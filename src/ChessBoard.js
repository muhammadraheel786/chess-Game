import React from 'react';
import Piece from './Piece';
import { getValidMoves } from './gameLogic';

// Chess board component - renders the 8x8 board and handles piece interactions
const ChessBoard = ({ 
  board, 
  currentPlayer, 
  selectedSquare, 
  validMoves, 
  onSquareClick 
}) => {
  
  // Handle square click events
  const handleSquareClick = (row, col) => {
    onSquareClick(row, col);
  };
  
  // Check if a square is selected
  const isSelected = (row, col) => {
    return selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
  };
  
  // Check if a square is a valid move
  const isValidMove = (row, col) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };
  
  // Get square color class
  const getSquareColor = (row, col) => {
    const isLight = (row + col) % 2 === 0;
    return isLight ? 'light-square' : 'dark-square';
  };
  
  return (
    <div className="chess-board">
      {board.map((row, rowIndex) => (
        row.map((piece, colIndex) => {
          const squareColor = getSquareColor(rowIndex, colIndex);
          const selected = isSelected(rowIndex, colIndex);
          const validMove = isValidMove(rowIndex, colIndex);
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${squareColor} ${
                selected ? 'selected' : ''
              } ${
                validMove ? 'valid-move' : ''
              }`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              <Piece piece={piece} />
            </div>
          );
        })
      ))}
    </div>
  );
};

export default ChessBoard;
