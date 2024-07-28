export type PomodoroSessionDto = {
  timeRemaining: number;
  pomodoros: number;
  shortBreaks: number;
  longBreaks: number;
  userConfig: {
    pomodoroNumber: number;
    workLength: number;
    shortBreakLength: number;
    longBreakLength: number;
  };
  currentPhase: PomodoroPhase;
  paused: boolean;
};


export enum PomodoroPhase {
  Working = 'Working',
  ShortBreak = 'Short Break',
  LongBreak = 'Long Break',
}

export type PomodoroStates = {
  remainingTime: number;
  currentPhase: PomodoroPhase;
  pomodoros: number;
  shortBreaks: number;
  longBreaks: number;
};
