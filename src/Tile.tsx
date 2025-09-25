import React from "react";

interface TileProps {
  value: number;
}

const Tile: React.FC<TileProps> = ({ value }) => {
  const getTileClass = (
    value: number
  ): string => {
    if (value === 0) return "tile tile-empty";
    return `tile tile-${value}`;
  };

  return (
    <div className={getTileClass(value)}>
      {value !== 0 && value}
    </div>
  );
};

export default Tile;
