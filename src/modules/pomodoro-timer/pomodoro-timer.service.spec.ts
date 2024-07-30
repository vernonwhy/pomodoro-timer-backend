import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PomodoroPause } from '../../models/pomodoro-pauses.model';
import { PomodoroTimer } from '../../models/pomodoro-timers.model';
import { UserConfig } from '../../models/user-config.model';
import { UserConfigService } from '../user-config/user-config.service';
import { PomodoroTimerService } from './pomodoro-timer.service';
import { PomodoroPhase, PomodoroStates } from './pomodoro-timer.types';

const userConfig: Pick<
  UserConfig,
  'pomodoroNumber' | 'workLength' | 'shortBreakLength' | 'longBreakLength'
> = {
  pomodoroNumber: 4,
  workLength: 25 * 60 * 1000, // 25 minutes
  shortBreakLength: 5 * 60 * 1000, // 5 minutes
  longBreakLength: 15 * 60 * 1000, // 15 minutes
};

const mockPomodoroTimeRepository = jest.mocked(Repository<PomodoroTimer>);
const mockPauseRepository = jest.mocked(Repository<PomodoroPause>);
const mockUserConfigService = jest.mocked(UserConfigService);

describe('PomodoroTimerService', () => {
  let service: PomodoroTimerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PomodoroTimerService,
        {
          provide: getRepositoryToken(PomodoroTimer),
          useValue: mockPomodoroTimeRepository,
        },
        {
          provide: getRepositoryToken(PomodoroPause),
          useValue: mockPauseRepository,
        },
        {
          provide: UserConfigService,
          useValue: mockUserConfigService,
        },
      ],
    }).compile();

    service = module.get<PomodoroTimerService>(PomodoroTimerService);
  });

  describe('getPomodoroPhase', () => {
    it('should return work phase', () => {
      const elapsedTimeInMs = 10 * 60 * 1000; // 10 minutes elapsed
      const phase: PomodoroStates = service.getPomodoroPhase({
        userConfig,
        elapsedTimeInMs,
      });

      expect(phase).toEqual({
        currentPhase: PomodoroPhase.Working,
        timeRemainingForPhase: 15 * 60 * 1000, // 15 minutes remaining
      });
    });

    it('should return short break phase', () => {
      const elapsedTimeInMs = (25 + 5) * 60 * 1000; // 30 minutes elapsed

      const phase: PomodoroStates = service.getPomodoroPhase({
        userConfig,
        elapsedTimeInMs,
      });

      expect(phase).toEqual({
        currentPhase: PomodoroPhase.Working,
        timeRemainingForPhase: 25 * 60 * 1000, // short break just ended
      });
    });

    it('should return long break phase', () => {
      const elapsedTimeInMs = (25 + 5 + 25 + 5 + 25 + 5 + 25) * 60 * 1000; // 105 minutes (end of 4th work session)

      const phase: PomodoroStates = service.getPomodoroPhase({
        userConfig,
        elapsedTimeInMs,
      });

      expect(phase).toEqual({
        currentPhase: PomodoroPhase.LongBreak,
        timeRemainingForPhase: 15 * 60 * 1000, // 15 minutes remaining for long break
      });
    });
  });

  
});
