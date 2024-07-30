import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PomodoroTimerService } from './pomodoro-timer.service';
import { PomodoroSessionDto } from './pomodoro-timer.types';

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
  async pauseSession(@Param('pomodoroId') pomodoroId: number): Promise<void> {
    return await this.pomodoroTimerService.pausePomodoroTimer(pomodoroId);
  }

  @Post('/:pomodoroId/unpause')
  async unpauseSession(@Param('pomodoroId') pomodoroId: number): Promise<void> {
    return await this.pomodoroTimerService.unpausePomodoroTimer(pomodoroId);
  }
}
