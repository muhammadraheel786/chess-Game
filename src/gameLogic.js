// Chess game logic - movement rules and board initialization

// Initialize chess board with starting positions
export const initializeBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place black pieces
  board[0][0] = { type: 'rook', color: 'black' };
  board[0][1] = { type: 'knight', color: 'black' };
  board[0][2] = { type: 'bishop', color: 'black' };
  board[0][3] = { type: 'queen', color: 'black' };
  board[0][4] = { type: 'king', color: 'black' };
  board[0][5] = { type: 'bishop', color: 'black' };
  board[0][6] = { type: 'knight', color: 'black' };
  board[0][7] = { type: 'rook', color: 'black' };
  
  // Black pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
  }
  
  // White pawns
  for (let i = 0; i < 8; i++) {
    board[6][i] = { type: 'pawn', color: 'white' };
  }
  
  // Place white pieces
  board[7][0] = { type: 'rook', color: 'white' };
  board[7][1] = { type: 'knight', color: 'white' };
  board[7][2] = { type: 'bishop', color: 'white' };
  board[7][3] = { type: 'queen', color: 'white' };
  board[7][4] = { type: 'king', color: 'white' };
  board[7][5] = { type: 'bishop', color: 'white' };
  board[7][6] = { type: 'knight', color: 'white' };
  board[7][7] = { type: 'rook', color: 'white' };
  
  return board;
};

// Get valid moves for a piece at given position (including check prevention)
export const getValidMoves = (board, row, col, gameHistory = []) => {
  const piece = board[row][col];
  if (!piece) return [];
  
  let moves = [];
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(board, row, col, piece.color, gameHistory));
      break;
    case 'rook':
      moves.push(...getRookMoves(board, row, col, piece.color));
      break;
    case 'knight':
      moves.push(...getKnightMoves(board, row, col, piece.color));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(board, row, col, piece.color));
      break;
    case 'queen':
      moves.push(...getQueenMoves(board, row, col, piece.color));
      break;
    case 'king':
      moves.push(...getKingMoves(board, row, col, piece.color, gameHistory));
      break;
  }
  
  // Filter out moves that would leave king in check
  return moves.filter(move => {
    const moveData = moves.find(m => m.row === move.row && m.col === move.col);
    return !wouldBeInCheck(board, row, col, move.row, move.col, piece.color, moveData);
  });
};

// Pawn movement rules
const getPawnMoves = (board, row, col, color, gameHistory = []) => {
  const moves = [];
  const direction = color === 'white' ? -1 : 1; // White moves up, Black moves down
  const startRow = color === 'white' ? 6 : 1;
  
  // Move forward one square
  if (isValidSquare(row + direction, col) && !board[row + direction][col]) {
    moves.push({ row: row + direction, col });
    
    // Move forward two squares from starting position
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col });
    }
  }
  
  // Capture diagonally
  [-1, 1].forEach(colOffset => {
    const newCol = col + colOffset;
    const newRow = row + direction;
    if (isValidSquare(newRow, newCol) && board[newRow][newCol] && 
        board[newRow][newCol].color !== color) {
      moves.push({ row: newRow, col: newCol });
    }
  });
  
  // En passant capture
  if (gameHistory.length > 0) {
    const lastMove = gameHistory[gameHistory.length - 1];
    if (lastMove.piece.type === 'pawn' && 
        Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
        lastMove.to.row === row && 
        Math.abs(lastMove.to.col - col) === 1) {
      moves.push({ 
        row: row + direction, 
        col: lastMove.to.col, 
        enPassant: true 
      });
    }
  }
  
  return moves;
};

// Rook movement rules (horizontal and vertical)
const getRookMoves = (board, row, col, color) => {
  const moves = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
  directions.forEach(([rowDir, colDir]) => {
    for (let i = 1; i < 8; i++) {
      const newRow = row + rowDir * i;
      const newCol = col + colDir * i;
      
      if (!isValidSquare(newRow, newCol)) break;
      
      if (!board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (board[newRow][newCol].color !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
    }
  });
  
  return moves;
};

// Knight movement rules (L-shape)
const getKnightMoves = (board, row, col, color) => {
  const moves = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  knightMoves.forEach(([rowOffset, colOffset]) => {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;
    
    if (isValidSquare(newRow, newCol)) {
      if (!board[newRow][newCol] || board[newRow][newCol].color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  });
  
  return moves;
};

// Bishop movement rules (diagonal)
const getBishopMoves = (board, row, col, color) => {
  const moves = [];
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  directions.forEach(([rowDir, colDir]) => {
    for (let i = 1; i < 8; i++) {
      const newRow = row + rowDir * i;
      const newCol = col + colDir * i;
      
      if (!isValidSquare(newRow, newCol)) break;
      
      if (!board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (board[newRow][newCol].color !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
    }
  });
  
  return moves;
};

// Queen movement rules (combination of rook and bishop)
const getQueenMoves = (board, row, col, color) => {
  return [...getRookMoves(board, row, col, color), ...getBishopMoves(board, row, col, color)];
};

// King movement rules (one square in any direction + castling)
const getKingMoves = (board, row, col, color, gameHistory = []) => {
  const moves = [];
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  
  kingMoves.forEach(([rowOffset, colOffset]) => {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;
    
    if (isValidSquare(newRow, newCol)) {
      if (!board[newRow][newCol] || board[newRow][newCol].color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  });
  
  // Castling
  if (!hasKingMoved(color, gameHistory) && !isInCheck(board, color)) {
    // King-side castling
    if (canCastleKingside(board, row, col, color, gameHistory)) {
      moves.push({ row, col: col + 2, castling: 'kingside' });
    }
    // Queen-side castling
    if (canCastleQueenside(board, row, col, color, gameHistory)) {
      moves.push({ row, col: col - 2, castling: 'queenside' });
    }
  }
  
  return moves;
};

// Check if a square is within the board bounds
const isValidSquare = (row, col) => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Check if a move is valid
export const isValidMove = (board, fromRow, fromCol, toRow, toCol, currentPlayer, gameHistory = []) => {
  const piece = board[fromRow][fromCol];
  if (!piece || piece.color !== currentPlayer) return false;
  
  const validMoves = getValidMoves(board, fromRow, fromCol, gameHistory);
  return validMoves.some(move => move.row === toRow && move.col === toCol);
};

// Make a move on the board
export const makeMove = (board, fromRow, fromCol, toRow, toCol, moveData = {}) => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[fromRow][fromCol];
  
  // Handle castling
  if (moveData.castling) {
    if (moveData.castling === 'kingside') {
      newBoard[fromRow][fromCol + 2] = piece;
      newBoard[fromRow][fromCol] = null;
      newBoard[fromRow][fromCol + 1] = newBoard[fromRow][7]; // Move rook
      newBoard[fromRow][7] = null;
    } else if (moveData.castling === 'queenside') {
      newBoard[fromRow][fromCol - 2] = piece;
      newBoard[fromRow][fromCol] = null;
      newBoard[fromRow][fromCol - 1] = newBoard[fromRow][0]; // Move rook
      newBoard[fromRow][0] = null;
    }
  } 
  // Handle en passant
  else if (moveData.enPassant) {
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    // Remove the captured pawn
    const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
    newBoard[capturedPawnRow][toCol] = null;
  }
  // Normal move
  else {
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
  }
  
  return newBoard;
};

// Find king position
const findKing = (board, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

// Check if a square is under attack
const isSquareUnderAttack = (board, row, col, byColor) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === byColor) {
        const moves = getBasicMoves(board, r, c);
        if (moves.some(move => move.row === row && move.col === col)) {
          return true;
        }
      }
    }
  }
  return false;
};

// Get basic moves without check prevention (to avoid infinite recursion)
const getBasicMoves = (board, row, col) => {
  const piece = board[row][col];
  if (!piece) return [];
  
  switch (piece.type) {
    case 'pawn':
      return getPawnBasicMoves(board, row, col, piece.color);
    case 'rook':
      return getRookMoves(board, row, col, piece.color);
    case 'knight':
      return getKnightMoves(board, row, col, piece.color);
    case 'bishop':
      return getBishopMoves(board, row, col, piece.color);
    case 'queen':
      return [...getRookMoves(board, row, col, piece.color), ...getBishopMoves(board, row, col, piece.color)];
    case 'king':
      return getKingBasicMoves(board, row, col, piece.color);
    default:
      return [];
  }
};

// Basic pawn moves (for attack detection - includes attack squares even if empty)
const getPawnBasicMoves = (board, row, col, color) => {
  const moves = [];
  const direction = color === 'white' ? -1 : 1;
  
  // Pawns can attack diagonally even if square is empty (for check detection)
  [-1, 1].forEach(colOffset => {
    const newCol = col + colOffset;
    const newRow = row + direction;
    if (isValidSquare(newRow, newCol)) {
      moves.push({ row: newRow, col: newCol });
    }
  });
  
  return moves;
};

// Basic king moves (without castling)
const getKingBasicMoves = (board, row, col, color) => {
  const moves = [];
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  
  kingMoves.forEach(([rowOffset, colOffset]) => {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;
    
    if (isValidSquare(newRow, newCol)) {
      if (!board[newRow][newCol] || board[newRow][newCol].color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  });
  
  return moves;
};

// Check if king is in check
export const isInCheck = (board, color) => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareUnderAttack(board, kingPos.row, kingPos.col, opponentColor);
};

// Check if a move would result in check
const wouldBeInCheck = (board, fromRow, fromCol, toRow, toCol, color, moveData = {}) => {
  const newBoard = makeMove(board, fromRow, fromCol, toRow, toCol, moveData);
  return isInCheck(newBoard, color);
};

// Check if king has moved (for castling)
const hasKingMoved = (color, gameHistory) => {
  return gameHistory.some(move => 
    move.piece.type === 'king' && move.piece.color === color
  );
};

// Check if rook has moved (for castling)
const hasRookMoved = (row, col, color, gameHistory) => {
  return gameHistory.some(move => 
    move.piece.type === 'rook' && 
    move.piece.color === color && 
    move.from.row === row && 
    move.from.col === col
  );
};

// Check if kingside castling is possible
const canCastleKingside = (board, row, col, color, gameHistory) => {
  const rookCol = 7;
  if (hasRookMoved(row, rookCol, color, gameHistory)) return false;
  
  // Check if squares between king and rook are empty
  for (let c = col + 1; c < rookCol; c++) {
    if (board[row][c]) return false;
  }
  
  // Check if king and passing squares are not under attack
  const opponentColor = color === 'white' ? 'black' : 'white';
  if (isSquareUnderAttack(board, row, col, opponentColor)) return false;
  if (isSquareUnderAttack(board, row, col + 1, opponentColor)) return false;
  if (isSquareUnderAttack(board, row, col + 2, opponentColor)) return false;
  
  return true;
};

// Check if queenside castling is possible
const canCastleQueenside = (board, row, col, color, gameHistory) => {
  const rookCol = 0;
  if (hasRookMoved(row, rookCol, color, gameHistory)) return false;
  
  // Check if squares between king and rook are empty
  for (let c = rookCol + 1; c < col; c++) {
    if (board[row][c]) return false;
  }
  
  // Check if king and passing squares are not under attack
  const opponentColor = color === 'white' ? 'black' : 'white';
  if (isSquareUnderAttack(board, row, col, opponentColor)) return false;
  if (isSquareUnderAttack(board, row, col - 1, opponentColor)) return false;
  if (isSquareUnderAttack(board, row, col - 2, opponentColor)) return false;
  
  return true;
};

// Check if game is in checkmate
export const isCheckmate = (board, color, gameHistory = []) => {
  if (!isInCheck(board, color)) return false;
  
  // Check if any piece can make a legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, row, col, gameHistory);
        if (validMoves.length > 0) return false;
      }
    }
  }
  
  return true;
};

// Check if game is in stalemate
export const isStalemate = (board, color, gameHistory = []) => {
  if (isInCheck(board, color)) return false;
  
  // Check if any piece can make a legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, row, col, gameHistory);
        if (validMoves.length > 0) return false;
      }
    }
  }
  
  return true;
};

// Check if pawn can be promoted
export const canPromotePawn = (board, row, col) => {
  const piece = board[row][col];
  if (!piece || piece.type !== 'pawn') return false;
  
  if (piece.color === 'white' && row === 0) return true;
  if (piece.color === 'black' && row === 7) return true;
  
  return false;
};

// Promote pawn to chosen piece
export const promotePawn = (board, row, col, promotionType) => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[row][col];
  
  if (piece && piece.type === 'pawn') {
    newBoard[row][col] = {
      type: promotionType,
      color: piece.color
    };
  }
  
  return newBoard;
};
