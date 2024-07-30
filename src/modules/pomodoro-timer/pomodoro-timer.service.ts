import { HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInMilliseconds } from 'date-fns';
import { isEmpty } from 'lodash';
import { Repository } from 'typeorm';
import { ClientManagedError } from '../../common/errors/errors.types';
import { PomodoroPause } from '../../models/pomodoro-pauses.model';
import { PomodoroTimer } from '../../models/pomodoro-timers.model';
import { UserConfig } from '../../models/user-config.model';
import { UserConfigService } from '../user-config/user-config.service';
import {
  PomodoroPhase,
  PomodoroSessionDto,
  PomodoroStates,
} from './pomodoro-timer.types';

const UPPER_LIMIT_FOR_ELAPSED_TIME = 3600 * 24 * 1000;

export class PomodoroTimerService {
  constructor(
    @InjectRepository(PomodoroTimer)
    private readonly pomodoroTimerRepository: Repository<PomodoroTimer>,
    @InjectRepository(PomodoroPause)
    private readonly pomodoroPauseRepository: Repository<PomodoroPause>,
    private readonly userConfigService: UserConfigService,
  ) {}

  async getLatestSession(userId: number): Promise<PomodoroSessionDto | null> {
    const timer = await this.pomodoroTimerRepository.findOne({
      where: { userId, isActive: true },
      order: { startTime: 'DESC' },
    });
    if (!timer) {
      return null;
    }
    const userConfig = await this.userConfigService.getUserConfig(userId);
    const pauses = await this.pomodoroPauseRepository.find({
      where: { pomodoroId: timer.id },
      order: { createdAt: 'DESC' },
    });
    const isPaused = isEmpty(pauses) ? false : pauses[0].endTime ? false : true;

    const { timeRemainingForPhase, currentPhase } = this.getPomodoroState({
      pomodoroTimer: timer,
      pauses,
      userConfig,
    });

    return {
      pomodoroId: timer.id,
      timeRemainingForPhase,
      currentPhase,
      paused: isPaused,
    };
  }

  async createNewSession(userId: number): Promise<PomodoroSessionDto> {
    // Close all active pomodoro timers
    await this.pomodoroTimerRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    const created = this.pomodoroTimerRepository.create({
      userId,
      startTime: new Date(),
      currentPhase: PomodoroPhase.Working,
      isActive: true,
    });

    const newPomodoroTimer = await this.pomodoroTimerRepository.save(created);
    const userConfig = await this.userConfigService.getUserConfig(userId);

    return {
      pomodoroId: newPomodoroTimer.id,
      timeRemainingForPhase: userConfig.workLength,
      currentPhase: newPomodoroTimer.currentPhase,
      paused: false,
    };
  }

  private getPomodoroState(input: {
    pomodoroTimer: PomodoroTimer;
    pauses: PomodoroPause[];
    userConfig: UserConfig;
  }): PomodoroStates {
    const { pomodoroTimer, pauses, userConfig } = input;

    const totalPauseDuration = isEmpty(pauses)
      ? 0
      : pauses
          .map((pauses) => {
            return differenceInMilliseconds(
              pauses.endTime ?? new Date(),
              pauses.startTime,
            );
          })
          .reduce((acc, pause) => {
            return acc + pause;
          }, 0);

    const totalElapsedTime = differenceInMilliseconds(
      Date.now(),
      pomodoroTimer.startTime,
    );
    const actualElapsedTime = totalElapsedTime - totalPauseDuration;
    const phase = this.getPomodoroPhase({
      userConfig,
      elapsedTimeInMs: actualElapsedTime,
    });
    return phase;
  }

  /**
   * Gets the current phase of the pomodoro timer
   * A cycle represents a work phase and a break phase, in other words, completing a pomodoro
   * A session represents completing all cycles of a pomodoro, completing all work and rest phases
   */
  getPomodoroPhase(input: {
    userConfig: Pick<
      UserConfig,
      'pomodoroNumber' | 'workLength' | 'shortBreakLength' | 'longBreakLength'
    >;
    elapsedTimeInMs: number;
  }): PomodoroStates {
    const {
      userConfig: {
        pomodoroNumber,
        workLength,
        shortBreakLength,
        longBreakLength,
      },
      elapsedTimeInMs,
    } = input;

    // TechDebt: Refactor to make it more readable
    const workBreakCycleTime = workLength + shortBreakLength;
    const totalWorkTimePerSession = workLength * pomodoroNumber;
    const totalBreakTimePerSession =
      shortBreakLength * (pomodoroNumber - 1) + longBreakLength;
    const totalSessionTime = totalWorkTimePerSession + totalBreakTimePerSession;

    const remainingElapsedTimeForLastPhase = elapsedTimeInMs % totalSessionTime;

    const totalCycles = Math.floor(
      remainingElapsedTimeForLastPhase / workBreakCycleTime,
    );
    const remainingElapsedTimeForLastCycle =
      remainingElapsedTimeForLastPhase % workBreakCycleTime;

    if (totalCycles === pomodoroNumber) {
      return {
        timeRemainingForPhase:
          longBreakLength - remainingElapsedTimeForLastCycle,
        currentPhase: PomodoroPhase.LongBreak,
      };
    } else if (totalCycles === pomodoroNumber - 1) {
      if (remainingElapsedTimeForLastCycle < workLength) {
        return {
          timeRemainingForPhase: workLength - remainingElapsedTimeForLastCycle,
          currentPhase: PomodoroPhase.Working,
        };
      } else {
        return {
          timeRemainingForPhase:
            longBreakLength - (remainingElapsedTimeForLastCycle - workLength),
          currentPhase: PomodoroPhase.LongBreak,
        };
      }
    } else {
      if (remainingElapsedTimeForLastCycle < workLength) {
        return {
          timeRemainingForPhase: workLength - remainingElapsedTimeForLastCycle,
          currentPhase: PomodoroPhase.Working,
        };
      } else {
        return {
          timeRemainingForPhase:
            shortBreakLength - (remainingElapsedTimeForLastCycle - workLength),
          currentPhase: PomodoroPhase.ShortBreak,
        };
      }
    }
  }

  async pausePomodoroTimer(pomodoroId: number): Promise<void> {
    const pomodoroTimer = await this.pomodoroTimerRepository.findOne({
      where: { id: pomodoroId },
    });
    if (!pomodoroTimer) {
      throw new ClientManagedError(
        'No pomodoro timer found',
        HttpStatus.NOT_FOUND,
      );
    }
    const pause = this.pomodoroPauseRepository.create({
      startTime: new Date(),
      pomodoroId,
    });
    await this.pomodoroPauseRepository.save(pause);
    return;
  }

  async unpausePomodoroTimer(pomodoroId: number): Promise<void> {
    const pause = await this.pomodoroPauseRepository.findOne({
      where: { pomodoroId, endTime: null },
    });
    if (!pause) {
      throw new ClientManagedError('No pause found', HttpStatus.NOT_FOUND);
    }
    await this.pomodoroPauseRepository.update(
      { id: pause.id },
      { endTime: new Date() },
    );

    return;
  }
}
