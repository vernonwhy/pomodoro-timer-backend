import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserConfig } from '../../models/user-config.model';
import { UpdateUserConfigDto } from './user-config.controller';
import {
  DEFAULT_LONG_BREAK_TIME,
  DEFAULT_POMODORO_NUMBER,
  DEFAULT_SHORT_BREAK_TIME,
  DEFAULT_WORKING_TIME,
} from './user-config.types';

export class UserConfigService {
  constructor(
    @InjectRepository(UserConfig)
    private readonly userConfigRepository: Repository<UserConfig>,
  ) {}

  async createUserConfig(userId: number) {
    const newUserConfig = this.userConfigRepository.create({
      userId,
      pomodoroNumber: DEFAULT_POMODORO_NUMBER,
      workLength: DEFAULT_WORKING_TIME,
      shortBreakLength: DEFAULT_SHORT_BREAK_TIME,
      longBreakLength: DEFAULT_LONG_BREAK_TIME,
    });
    return await this.userConfigRepository.save(newUserConfig);
  }

  async getUserConfig(userId: number): Promise<UserConfig> {
    const userConfig = await this.userConfigRepository.find({
      where: { userId },
      take: 1,
    });
    return userConfig[0];
  }

  async updateUserConfig(
    updateUserConfigDto: UpdateUserConfigDto,
  ): Promise<void> {
    const updateResult = await this.userConfigRepository.update(
      { userId: updateUserConfigDto.userId },
      updateUserConfigDto,
    );

    if (updateResult.affected < 1) {
      throw new Error('No user config found');
    }

    return;
  }
}
