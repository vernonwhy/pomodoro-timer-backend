CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_users_email ON users(email);

CREATE TABLE user_config (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  pomodoro_number INTEGER NOT NULL DEFAULT 4,
  work_length INTEGER NOT NULL DEFAULT 25,
  short_break_length INTEGER NOT NULL DEFAULT 5,
  long_break_length INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_config_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- Foreign keys are not auto-indexed in Postgres
-- https://www.postgresql.org/docs/current/ddl-constraints.html#:~:text=foreign%20key%20constraint%20does%20not%20automatically%20create%20an%20index
CREATE INDEX idx_user_config_user_id ON user_config(user_id);

CREATE TABLE pomodoro_timers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  start_time TIMESTAMPTZ(3) NOT NULL,
  end_time TIMESTAMPTZ(3),
  current_phase VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_pomodoro_timers_user_id ON pomodoro_timers(user_id);

CREATE TABLE pomodoro_pauses (
  id SERIAL PRIMARY KEY,
  start_time TIMESTAMPTZ(3) NOT NULL,
  end_time TIMESTAMPTZ(3),
  pomodoro_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pomodoro_pauses_pomodoro FOREIGN KEY(pomodoro_id) REFERENCES pomodoro_timers(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_pomodoro_pauses_pomodoro_id ON pomodoro_pauses(pomodoro_id);
