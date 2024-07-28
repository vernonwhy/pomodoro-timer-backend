import { Repository } from 'typeorm';
import { User } from '../../models/users.model';
import { RegisterUserDto } from './users.controller';

export class UsersService {
  constructor(private readonly usersRepository: Repository<User>) {}

  async registerUser(user: RegisterUserDto) {
    const newUser = this.usersRepository.create(user);
    return await this.usersRepository.save(newUser);
  }

  async getUserByEmail(email: string) {
    const user = this.usersRepository.find({ where: { email }, take: 1 });
    return user[0];
  }
}
