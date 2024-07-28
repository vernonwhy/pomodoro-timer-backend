import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserConfigService } from './user-config.service';

export class UpdateUserConfigDto {
  userId: number;
  workLength: number;
  shortBreakLength: number;
  longBreakLength: number;
}

@Controller('config')
export class UserConfigController {
  constructor(private readonly userConfigService: UserConfigService) {}
  @Get('/:userId')
  getConfig(@Param('userId') userId: number) {
    const userConfig = this.userConfigService.getUserConfig(userId);
    return userConfig;
  }

  @Post('update')
  updateConfig(@Body() updateConfigDto: UpdateUserConfigDto) {
    const updatedConfig =
      this.userConfigService.updateUserConfig(updateConfigDto);
    return updatedConfig;
  }
}
