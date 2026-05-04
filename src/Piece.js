import React from 'react';

// Chess piece component - renders individual chess pieces with Unicode symbols
const Piece = ({ piece }) => {
  if (!piece) return null;
  
  // Unicode chess symbols for different pieces and colors
  const pieceSymbols = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  };
  
  const symbol = pieceSymbols[piece.color][piece.type];
  
  return (
    <span className={`piece piece-${piece.color}`}>
      {symbol}
    </span>
  );
};

export default Piece;
