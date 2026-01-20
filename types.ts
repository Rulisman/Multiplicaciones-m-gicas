
export type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  factor1: number;
  factor2: number;
  answer: number;
  isBonus?: boolean;
}

export interface ScoreEntry {
  points: number;
  mistakes: number;
}

export interface DifficultyConfig {
  maxNumber: number;
  timer: number;
}
