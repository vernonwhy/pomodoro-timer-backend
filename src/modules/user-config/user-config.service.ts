import { Repository } from 'typeorm';
import { UserConfig } from '../../models/user-config.model';
import { UpdateUserConfigDto } from './user-config.controller';

export class UserConfigService {
  constructor(private readonly userConfigRepository: Repository<UserConfig>) {}

  async getUserConfig(userId: number) {
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
