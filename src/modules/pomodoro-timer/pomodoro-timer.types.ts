export type PomodoroSessionDto = {
  pomodoroId: number;
  timeRemainingForPhase: number;
  currentPhase: PomodoroPhase;
  paused: boolean;
};

export enum PomodoroPhase {
  Working = 'Working',
  ShortBreak = 'Short Break',
  LongBreak = 'Long Break',
}

export type PomodoroStates = {
  timeRemainingForPhase: number;
  currentPhase: PomodoroPhase;
};
