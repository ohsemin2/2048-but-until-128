import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import "./App.css";
import GameBoard from "./GameBoard";
import {
  GameState,
  Direction,
  HistoryState,
} from "./types";
import {
  createInitialGameState,
  moveBoard,
  addRandomTile,
  areBoardsEqual,
  canMove,
  hasWinningTile,
  saveGameState,
  loadGameState,
  clearGameState,
} from "./gameUtils";

function App() {
  const [gameState, setGameState] =
    useState<GameState>(createInitialGameState);
  const [history, setHistory] = useState<
    HistoryState[]
  >([]);

  // 게임 상태 로드
  useEffect(() => {
    const {
      gameState: savedState,
      history: savedHistory,
    } = loadGameState();
    if (savedState) {
      setGameState(savedState);
      setHistory(savedHistory);
    }
  }, []);

  // 게임 상태 저장
  useEffect(() => {
    saveGameState(gameState, history);
  }, [gameState, history]);

  // 이동 처리
  const makeMove = useCallback(
    (direction: Direction) => {
      const { newBoard, scoreGained } = moveBoard(
        gameState.board,
        direction
      );

      // 보드가 변경되지 않았으면 무시
      if (
        areBoardsEqual(gameState.board, newBoard)
      ) {
        return;
      }

      // 히스토리에 현재 상태 저장
      const newHistory = [
        ...history,
        {
          board: gameState.board.map((row) => [
            ...row,
          ]),
          score: gameState.score,
        },
      ];

      // 히스토리 최대 10개까지만 유지
      if (newHistory.length > 10) {
        newHistory.shift();
      }

      setHistory(newHistory);

      // 새로운 타일 추가
      const boardWithNewTile =
        addRandomTile(newBoard);
      const newScore =
        gameState.score + scoreGained;

      // 승리 조건 확인 (128 타일)
      const isWin = hasWinningTile(
        boardWithNewTile
      );

      // 게임 오버 조건 확인
      const isGameOver = !canMove(
        boardWithNewTile
      );

      setGameState({
        board: boardWithNewTile,
        score: newScore,
        isGameOver,
        isWin,
      });
    },
    [gameState, history]
  );

  // 키보드 이벤트 처리
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (gameState.isGameOver || gameState.isWin)
        return;

      let direction: Direction | null = null;

      switch (event.key) {
        case "ArrowUp":
          direction = Direction.UP;
          break;
        case "ArrowDown":
          direction = Direction.DOWN;
          break;
        case "ArrowLeft":
          direction = Direction.LEFT;
          break;
        case "ArrowRight":
          direction = Direction.RIGHT;
          break;
        default:
          return;
      }

      event.preventDefault();

      if (direction) {
        makeMove(direction);
      }
    },
    [
      gameState.isGameOver,
      gameState.isWin,
      makeMove,
    ]
  );

  useEffect(() => {
    window.addEventListener(
      "keydown",
      handleKeyPress
    );
    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyPress
      );
    };
  }, [handleKeyPress]);

  // 새 게임 시작
  const startNewGame = () => {
    const newGameState = createInitialGameState();
    setGameState(newGameState);
    setHistory([]);
    clearGameState();
  };

  // Undo 기능
  const undo = () => {
    if (history.length === 0) return;

    const previousState =
      history[history.length - 1];
    const newHistory = history.slice(0, -1);

    setGameState({
      board: previousState.board,
      score: previousState.score,
      isGameOver: false,
      isWin: false,
    });

    setHistory(newHistory);
  };

  return (
    <div className="App">
      <div className="game-container">
        <div className="game-header">
          <h1>2048 (Until 128)</h1>
          <div className="game-info">
            <div className="score-container">
              <div className="score-label">
                SCORE
              </div>
              <div className="score-value">
                {gameState.score}
              </div>
            </div>
            <button
              className="new-game-button"
              onClick={startNewGame}
            >
              새 게임
            </button>
            <button
              className="undo-button"
              onClick={undo}
              disabled={history.length === 0}
            >
              되돌리기
            </button>
          </div>
        </div>

        <div className="game-board-container">
          <GameBoard board={gameState.board} />

          {gameState.isWin && (
            <div className="game-overlay">
              <div className="game-message">
                <h2>축하합니다!</h2>
                <p>128 타일을 만들었습니다!</p>
                <button onClick={startNewGame}>
                  다시 시작
                </button>
              </div>
            </div>
          )}

          {gameState.isGameOver &&
            !gameState.isWin && (
              <div className="game-overlay">
                <div className="game-message">
                  <h2>게임 종료!</h2>
                  <p>
                    더 이상 이동할 수 없습니다.
                  </p>
                  <button onClick={startNewGame}>
                    다시 시작
                  </button>
                </div>
              </div>
            )}
        </div>

        <div className="game-instructions">
          <p>
            <strong>HOW TO PLAY:</strong> 방향키를
            사용해서 타일을 움직이세요. 같은
            숫자의 타일이 만나면 합쳐집니다. 128
            타일을 만들면 승리입니다!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
