import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PomodoroPause } from '../../models/pomodoro-pauses.model';
import { PomodoroTimer } from '../../models/pomodoro-timers.model';
import { UserConfigModule } from '../user-config/user-config.module';
import { PomodoroTimerController } from './pomodoro-timer.controller';
import { PomodoroTimerService } from './pomodoro-timer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PomodoroTimer, PomodoroPause]),
    UserConfigModule,
  ],
  controllers: [PomodoroTimerController],
  providers: [PomodoroTimerService],
  exports: [PomodoroTimerService],
})
export class PomodoroTimerModule {}
