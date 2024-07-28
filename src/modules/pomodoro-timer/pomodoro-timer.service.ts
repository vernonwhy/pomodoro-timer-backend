import { HttpStatus } from '@nestjs/common';
import { differenceInMilliseconds, differenceInSeconds } from 'date-fns';
import { isNil } from 'lodash';
import { Repository } from 'typeorm';
import {
  BackendErrorCode,
  ClientManagedError,
} from '../../common/errors/errors.types';
import { PomodoroPause } from '../../models/pomodoro-pauses.model';
import { PomodoroTimer } from '../../models/pomodoro-timers.model';
import { UserConfig } from '../../models/user-config.model';
import { UserConfigService } from '../user-config/user-config.service';
import {
  PomodoroPhase,
  PomodoroSessionDto,
  PomodoroStates,
} from './pomodoro-timer.types';

export class PomodoroTimerService {
  constructor(
    private readonly pomodoroTimerRepository: Repository<PomodoroTimer>,
    private readonly pomodoroPauseRepository: Repository<PomodoroPause>,
    private readonly userConfigService: UserConfigService,
  ) {}

  async getLatestSession(userId: number): Promise<PomodoroSessionDto | null> {
    const currentPomodoroTimer = await this.pomodoroTimerRepository.findOne({
      where: { userId, isActive: true },
      order: { startTime: 'DESC' },
    });
    if (!currentPomodoroTimer) {
      return null;
    }

    const userConfig = await this.userConfigService.getUserConfig(userId);

    const pauses = await this.pomodoroPauseRepository.find({
      where: { pomodoroId: currentPomodoroTimer.id },
      order: { createdAt: 'DESC' },
    });

    const isPaused = pauses[0]?.endTime ? false : true;

    const { remainingTime, pomodoros, shortBreaks, longBreaks } =
      this.getPomodoroState({
        pomodoroTimer: currentPomodoroTimer,
        pauses,
        userConfig,
      });
    await this.updatePomodoroState({
      ...currentPomodoroTimer,
      pomodoros,
      shortBreaks,
      longBreaks,
    });

    const updatedPomodoroTimer = await this.pomodoroTimerRepository.findOne({
      where: { id: currentPomodoroTimer.id },
    });

    return {
      timeRemaining: remainingTime,
      pomodoros: updatedPomodoroTimer.pomodoros,
      shortBreaks: updatedPomodoroTimer.shortBreaks,
      longBreaks: updatedPomodoroTimer.longBreaks,
      currentPhase: updatedPomodoroTimer.currentPhase,
      userConfig: {
        pomodoroNumber: userConfig.pomodoroNumber,
        workLength: userConfig.workLength,
        shortBreakLength: userConfig.shortBreakLength,
        longBreakLength: userConfig.longBreakLength,
      },
      paused: isPaused,
    };
  }

  async createNewSession(userId: number) {
    // Close all active pomodoro timers
    await this.pomodoroTimerRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    const created = this.pomodoroTimerRepository.create({
      userId,
      startTime: new Date(),
      pomodoros: 0,
      shortBreaks: 0,
      longBreaks: 0,
      isActive: true,
    });

    const newPomodoroTimer = await this.pomodoroTimerRepository.save(created);
    const userConfig = await this.userConfigService.getUserConfig(userId);

    return {
      timeRemaining: userConfig.workLength,
      pomodoros: newPomodoroTimer.pomodoros,
      shortBreaks: newPomodoroTimer.shortBreaks,
      longBreaks: newPomodoroTimer.longBreaks,
      currentPhase: newPomodoroTimer.currentPhase,
      userConfig: {
        pomodoroNumber: userConfig.pomodoroNumber,
        workLength: userConfig.workLength,
        shortBreakLength: userConfig.shortBreakLength,
        longBreakLength: userConfig.longBreakLength,
      },
      paused: false,
    };
  }

  async updatePomodoroState(pomodoroTimer: Partial<PomodoroTimer>) {
    const updateResult = await this.pomodoroTimerRepository.update(
      { id: pomodoroTimer.id },
      pomodoroTimer,
    );

    if (updateResult.affected < 1) {
      throw new ClientManagedError(
        'No pomodoro timer found.',
        HttpStatus.NOT_FOUND,
        BackendErrorCode.INVALID_REQUEST,
      );
    }
    return;
  }

  private getPomodoroState(input: {
    pomodoroTimer: PomodoroTimer;
    pauses: PomodoroPause[];
    userConfig: UserConfig;
  }): PomodoroStates {
    const { pomodoroTimer, pauses, userConfig } = input;

    const totalPauseDuration = isNil(pauses)
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

    const totalElapsedTime = differenceInSeconds(
      Date.now(),
      pomodoroTimer.startTime,
      {
        roundingMethod: 'floor',
      },
    );

    const actualElapsedTime = totalElapsedTime - totalPauseDuration;

    if (actualElapsedTime > 3600 * 24) {
      throw new ClientManagedError(
        'Previous session expired.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        BackendErrorCode.SESSION_EXPIRED,
      );
    }

    return this.calculatePomodoroPhases({
      userConfig,
      elapsedStates: {
        currentPhase: pomodoroTimer.currentPhase,
        remainingTime: actualElapsedTime,
        pomodoros: 0,
        shortBreaks: 0,
        longBreaks: 0,
      },
    });
  }

  calculatePomodoroPhases(input: {
    userConfig: Pick<
      UserConfig,
      'pomodoroNumber' | 'workLength' | 'shortBreakLength' | 'longBreakLength'
    >;
    elapsedStates: PomodoroStates;
  }): PomodoroStates {
    const { userConfig, elapsedStates } = input;
    const { workLength, shortBreakLength, longBreakLength } = userConfig;
    const { remainingTime } = elapsedStates;

    if (remainingTime < 0 || remainingTime < workLength) {
      return elapsedStates;
    }

    let currentRemainingTime = remainingTime;
    if (currentRemainingTime - workLength > 0) {
      elapsedStates.pomodoros += 1;
      elapsedStates.currentPhase = PomodoroPhase.Working;
      currentRemainingTime -= workLength;
    }

    if (elapsedStates.pomodoros % userConfig.pomodoroNumber === 0) {
      if (currentRemainingTime - longBreakLength > 0) {
        elapsedStates.longBreaks += 1;
        elapsedStates.currentPhase = PomodoroPhase.LongBreak;
        currentRemainingTime -= longBreakLength;
      }
    } else {
      if (currentRemainingTime - shortBreakLength > 0) {
        elapsedStates.shortBreaks += 1;
        elapsedStates.currentPhase = PomodoroPhase.ShortBreak;
        currentRemainingTime -= shortBreakLength;
      }
    }
    elapsedStates.remainingTime = currentRemainingTime;

    console.log(`current state: ${JSON.stringify(elapsedStates)}`);
    return this.calculatePomodoroPhases({
      userConfig,
      elapsedStates,
    });
  }

  async pausePomodoroTimer(pomodoroId: number) {
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

  async unpausePomodoroTimer(pomodoroId: number) {
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
  }
}
