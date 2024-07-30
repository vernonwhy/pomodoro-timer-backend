import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/users.model';
import { UserConfigService } from '../user-config/user-config.service';
import { RegisterUserDto } from './users.controller';

export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userConfigService: UserConfigService,
  ) {}

  async registerUser(user: RegisterUserDto) {
    const newUser = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(newUser);
    await this.userConfigService.createUserConfig(savedUser.id);
    return savedUser;
  }

  async getUserByEmail(email: string) {
    const user = this.usersRepository.find({ where: { email }, take: 1 });
    return user[0];
  }

  async notifyUser(email: string, message: string) {
    /**
     * Mock implementation to call notification microservice API
     * Implementation can be done using services such as Firebase Cloud Messaging
     */
  }
}
