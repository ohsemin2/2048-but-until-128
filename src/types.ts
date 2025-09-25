export type Board = number[][];

export interface GameState {
  board: Board;
  score: number;
  isGameOver: boolean;
  isWin: boolean;
}

export interface HistoryState {
  board: Board;
  score: number;
}

export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}
