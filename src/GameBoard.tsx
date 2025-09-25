import React from "react";
import Tile from "./Tile";
import { Board } from "./types";

interface GameBoardProps {
  board: Board;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
}) => {
  return (
    <div className="game-board">
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <Tile
            key={`${rowIndex}-${colIndex}`}
            value={value}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;
