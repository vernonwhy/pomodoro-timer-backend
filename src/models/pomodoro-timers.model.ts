import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PomodoroPhase } from '../modules/pomodoro-timer/pomodoro-timer.types';
import { BaseModel } from './base.model';
import { User } from './users.model';

@Entity('pomodoro_timers')
export class PomodoroTimer extends BaseModel {
  @Column()
  userId: number;

  @Column({ type: 'timestamptz', precision: 3 })
  startTime: Date;
  @Column({ type: 'timestamptz', precision: 3, nullable: true })
  endTime: Date;

  @Column()
  pomodoros: number;
  @Column()
  longBreaks: number;
  @Column()
  shortBreaks: number;

  @Column()
  currentPhase: PomodoroPhase;

  @Column()
  isActive: boolean;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
