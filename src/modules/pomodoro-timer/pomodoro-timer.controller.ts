import { Controller, Get, Param, Post } from '@nestjs/common';
import { PomodoroTimerService } from './pomodoro-timer.service';
import { PomodoroPhase, PomodoroSessionDto } from './pomodoro-timer.types';

@Controller('timer')
export class PomodoroTimerController {
  constructor(private readonly pomodoroTimerService: PomodoroTimerService) {}
  @Get('/:userId')
  async getLatestSession(
    @Param('userId') userId: number,
  ): Promise<PomodoroSessionDto> {
    return await this.pomodoroTimerService.getLatestSession(userId);
  }

  @Post('/:userId/new')
  async createNewSession(
    @Param('userId') userId: number,
  ): Promise<PomodoroSessionDto> {
    return await this.pomodoroTimerService.createNewSession(userId);
  }

  @Post('/:pomodoroId/pause')
  async pauseSession(@Param('pomodoroId') pomodoroId: number) {
    return await this.pomodoroTimerService.pausePomodoroTimer(pomodoroId);
  }

  @Post('/:pomodoroId/unpause')
  async unpauseSession(@Param('pomodoroId') pomodoroId: number) {
    return await this.pomodoroTimerService.unpausePomodoroTimer(pomodoroId);
  }

  @Post('/test')
  test() {
    return this.pomodoroTimerService.calculatePomodoroPhases({
      userConfig: {
        pomodoroNumber: 4,
        workLength: 25 * 60,
        shortBreakLength: 5 * 60,
        longBreakLength: 15 * 60,
      },
      elapsedStates: {
        currentPhase: PomodoroPhase.Working,
        remainingTime: 3600 * 3,
        pomodoros: 0,
        shortBreaks: 0,
        longBreaks: 0,
      },
    });
  }
}
