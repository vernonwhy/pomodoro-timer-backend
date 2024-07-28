import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './base.model';
import { PomodoroTimer } from './pomodoro-timers.model';

@Entity('pomodoro_pauses')
export class PomodoroPause extends BaseModel {
  @Column({ type: 'timestamptz', precision: 3 })
  startTime: Date;

  @Column({ type: 'timestamptz', precision: 3, nullable: true })
  endTime: Date;

  @Column()
  pomodoroId: number;

  @ManyToOne(() => PomodoroTimer, { cascade: true })
  @JoinColumn({ name: 'pomodoro_id' })
  pomodoroTimer: PomodoroTimer;
}
