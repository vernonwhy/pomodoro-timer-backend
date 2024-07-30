import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from './base.model';
import { User } from './users.model';

/**
 * Represents the user configuration for a pomodoro timer
 */
@Entity('user_config')
export class UserConfig extends BaseModel {
  @Column()
  userId: number;

  @Column({ default: 4 })
  pomodoroNumber: number;

  @Column({ default: 25 })
  workLength: number;

  @Column({ default: 5 })
  shortBreakLength: number;

  @Column({ default: 15 })
  longBreakLength: number;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
