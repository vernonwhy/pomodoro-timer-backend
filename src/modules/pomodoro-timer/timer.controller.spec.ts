import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroTimerController } from './pomodoro-timer.controller';

describe('TimerController', () => {
  let controller: PomodoroTimerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PomodoroTimerController],
    }).compile();

    controller = module.get<PomodoroTimerController>(PomodoroTimerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
