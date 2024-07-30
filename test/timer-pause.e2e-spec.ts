import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { subHours, subMinutes } from 'date-fns';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { PomodoroPause } from '../src/models/pomodoro-pauses.model';
import { PomodoroTimer } from '../src/models/pomodoro-timers.model';
import { UserConfig } from '../src/models/user-config.model';
import { User } from '../src/models/users.model';
import { PomodoroPhase } from '../src/modules/pomodoro-timer/pomodoro-timer.types';

let userId: number;
let pomodoroId: number;

Date.now = jest.fn(() => new Date(Date.UTC(2024, 0, 1)).valueOf());

const START_TIME = Date.now();

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let timerRepo: Repository<PomodoroTimer>;
  let userRepo: Repository<User>;
  let configRepo: Repository<UserConfig>;
  let pauseRepo: Repository<PomodoroPause>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    timerRepo = app.get(getRepositoryToken(PomodoroTimer));
    userRepo = app.get(getRepositoryToken(User));
    configRepo = app.get(getRepositoryToken(UserConfig));
    pauseRepo = app.get(getRepositoryToken(PomodoroPause));

    await configRepo.delete({});
    await pauseRepo.delete({});
    await timerRepo.delete({});
    await userRepo.delete({});
  });

  test('e2e timer flow ', async () => {
    /* Create user profile */
    const user = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email: 'test@example.com' })
      .expect(201);
    userId = user.body.id; // store user id for later use

    /* Check that user config is automatically created */
    const userConfig = await request(app.getHttpServer())
      .get(`/config/${userId}`)
      .expect(200);

    expect(userConfig.body).toEqual(
      expect.objectContaining({
        userId,
        pomodoroNumber: 4,
        // default values
        workLength: 25 * 60 * 1000,
        shortBreakLength: 5 * 60 * 1000,
        longBreakLength: 15 * 60 * 1000,
      }),
    );

    /* Create new sessions manually */
    const timer = await timerRepo.save({
      userId,
      startTime: subHours(START_TIME, 1),
      isActive: true,
      currentPhase: PomodoroPhase.Working,
    });

    // 10 minutes pause
    await pauseRepo.save({
      pomodoroId: timer.id,
      startTime: subMinutes(START_TIME, 40),
      endTime: subMinutes(START_TIME, 30),
    });

    // Total of 60 - 10 = 50 minutes elapsed
    // Current phase should be Working with 5 minute remaining
    const response = await request(app.getHttpServer())
      .get(`/timer/${userId}`)
      .expect(200);

    expect(response.body).toEqual({
      pomodoroId: timer.id,
      timeRemainingForPhase: 5 * 60 * 1000,
      currentPhase: PomodoroPhase.Working,
      paused: false,
    });
  });
});
