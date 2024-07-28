import { Column, Entity } from 'typeorm';
import { BaseModel } from './base.model';

@Entity('users')
export class User extends BaseModel {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  webhookNotificationUrl: string;
}
