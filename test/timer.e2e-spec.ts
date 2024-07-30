import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { PomodoroPause } from '../src/models/pomodoro-pauses.model';
import { PomodoroTimer } from '../src/models/pomodoro-timers.model';
import { UserConfig } from '../src/models/user-config.model';
import { User } from '../src/models/users.model';

let userId: number;
let pomodoroId: number;

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

    /* Create new session */
    const timer = await request(app.getHttpServer())
      .post(`/timer/${userId}/new`)
      .expect(201);

    pomodoroId = timer.body.pomodoroId;
    expect(timer.body).toEqual(
      expect.objectContaining({
        timeRemainingForPhase: 25 * 60 * 1000,
        currentPhase: 'Working',
      }),
    );

    /* Pause and unpause session */
    await request(app.getHttpServer())
      .post(`/timer/${pomodoroId}/pause`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/timer/${pomodoroId}/unpause`)
      .expect(201);

    const pause = await pauseRepo.findOne({ where: { pomodoroId } });
    expect(pause).toEqual(
      expect.objectContaining({
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      }),
    );
  });
});
