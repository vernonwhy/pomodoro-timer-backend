import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from './base.model';
import { User } from './users.model';

@Entity('user_config')
export class UserConfig extends BaseModel {
  @Column()
  userId: number;

  @Column()
  pomodoroNumber: number;

  @Column()
  workLength: number;

  @Column()
  shortBreakLength: number;

  @Column()
  longBreakLength: number;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
