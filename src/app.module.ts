import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PomodoroTimerController } from './modules/pomodoro-timer/pomodoro-timer.controller';
import { PomodoroTimerService } from './modules/pomodoro-timer/pomodoro-timer.service';
import { UserConfigService } from './modules/user-config/user-config.service';
import { UsersController } from './modules/user/users.controller';
import { UsersService } from './modules/user/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [__dirname + '/models/*.model{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PomodoroTimerController, UsersController],
  providers: [PomodoroTimerService, UserConfigService, UsersService],
})
export class AppModule {}
