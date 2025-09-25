import {
  Board,
  GameState,
  Direction,
  HistoryState,
} from "./types";

// 빈 보드 생성
export const createEmptyBoard = (): Board => {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(0));
};

// 새로운 타일 추가 (2 또는 4)
export const addRandomTile = (
  board: Board
): Board => {
  const newBoard = board.map((row) => [...row]);
  const emptyCells: [number, number][] = [];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (newBoard[i][j] === 0) {
        emptyCells.push([i, j]);
      }
    }
  }

  if (emptyCells.length > 0) {
    const randomIndex = Math.floor(
      Math.random() * emptyCells.length
    );
    const [row, col] = emptyCells[randomIndex];
    newBoard[row][col] =
      Math.random() < 0.9 ? 2 : 4;
  }

  return newBoard;
};

// 초기 게임 상태 생성
export const createInitialGameState =
  (): GameState => {
    let board = createEmptyBoard();
    board = addRandomTile(board);
    board = addRandomTile(board);

    return {
      board,
      score: 0,
      isGameOver: false,
      isWin: false,
    };
  };

// 보드가 같은지 확인
export const areBoardsEqual = (
  board1: Board,
  board2: Board
): boolean => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board1[i][j] !== board2[i][j]) {
        return false;
      }
    }
  }
  return true;
};

// 행을 왼쪽으로 슬라이드하고 합치기
const slideAndMergeRow = (
  row: number[]
): { newRow: number[]; scoreGained: number } => {
  // 0이 아닌 값들만 필터링
  const filtered = row.filter((val) => val !== 0);
  const newRow = [...filtered];
  let scoreGained = 0;

  // 인접한 같은 값들을 합치기
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      scoreGained += newRow[i];
      newRow[i + 1] = 0;
    }
  }

  // 다시 0이 아닌 값들만 필터링하고 4칸 맞추기
  const finalRow = newRow.filter(
    (val) => val !== 0
  );
  while (finalRow.length < 4) {
    finalRow.push(0);
  }

  return { newRow: finalRow, scoreGained };
};

// 보드 회전 (시계방향 90도)
const rotateBoard = (board: Board): Board => {
  const newBoard = createEmptyBoard();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      newBoard[j][3 - i] = board[i][j];
    }
  }
  return newBoard;
};

// 보드 회전 (반시계방향 90도)
const rotateCounterClockwise = (
  board: Board
): Board => {
  const newBoard = createEmptyBoard();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      newBoard[3 - j][i] = board[i][j];
    }
  }
  return newBoard;
};

// 보드 이동
export const moveBoard = (
  board: Board,
  direction: Direction
): { newBoard: Board; scoreGained: number } => {
  let workingBoard = board.map((row) => [...row]);
  let totalScore = 0;

  switch (direction) {
    case Direction.LEFT:
      // 그대로 진행
      break;
    case Direction.RIGHT:
      // 180도 회전
      workingBoard = rotateBoard(
        rotateBoard(workingBoard)
      );
      break;
    case Direction.UP:
      // 반시계방향 90도 회전
      workingBoard =
        rotateCounterClockwise(workingBoard);
      break;
    case Direction.DOWN:
      // 시계방향 90도 회전
      workingBoard = rotateBoard(workingBoard);
      break;
  }

  // 각 행을 왼쪽으로 슬라이드
  for (let i = 0; i < 4; i++) {
    const { newRow, scoreGained } =
      slideAndMergeRow(workingBoard[i]);
    workingBoard[i] = newRow;
    totalScore += scoreGained;
  }

  // 원래 방향으로 되돌리기
  switch (direction) {
    case Direction.LEFT:
      // 그대로
      break;
    case Direction.RIGHT:
      // 180도 회전
      workingBoard = rotateBoard(
        rotateBoard(workingBoard)
      );
      break;
    case Direction.UP:
      // 시계방향 90도 회전
      workingBoard = rotateBoard(workingBoard);
      break;
    case Direction.DOWN:
      // 반시계방향 90도 회전
      workingBoard =
        rotateCounterClockwise(workingBoard);
      break;
  }

  return {
    newBoard: workingBoard,
    scoreGained: totalScore,
  };
};

// 게임 종료 확인 (이동 가능한지)
export const canMove = (
  board: Board
): boolean => {
  // 빈 칸이 있는지 확인
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        return true;
      }
    }
  }

  // 인접한 같은 값이 있는지 확인
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const current = board[i][j];
      // 오른쪽 확인
      if (j < 3 && board[i][j + 1] === current) {
        return true;
      }
      // 아래쪽 확인
      if (i < 3 && board[i + 1][j] === current) {
        return true;
      }
    }
  }

  return false;
};

// 128 타일이 있는지 확인
export const hasWinningTile = (
  board: Board
): boolean => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 128) {
        return true;
      }
    }
  }
  return false;
};

// localStorage에 게임 상태 저장
export const saveGameState = (
  gameState: GameState,
  history: HistoryState[]
): void => {
  localStorage.setItem(
    "2048-game-state",
    JSON.stringify(gameState)
  );
  localStorage.setItem(
    "2048-history",
    JSON.stringify(history)
  );
};

// localStorage에서 게임 상태 불러오기
export const loadGameState = (): {
  gameState: GameState | null;
  history: HistoryState[];
} => {
  try {
    const savedState = localStorage.getItem(
      "2048-game-state"
    );
    const savedHistory = localStorage.getItem(
      "2048-history"
    );

    const gameState = savedState
      ? JSON.parse(savedState)
      : null;
    const history = savedHistory
      ? JSON.parse(savedHistory)
      : [];

    return { gameState, history };
  } catch (error) {
    console.error(
      "Failed to load game state:",
      error
    );
    return { gameState: null, history: [] };
  }
};

// localStorage 클리어
export const clearGameState = (): void => {
  localStorage.removeItem("2048-game-state");
  localStorage.removeItem("2048-history");
};
