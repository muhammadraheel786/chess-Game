import React, { useState, useEffect } from 'react';
import ChessBoard from './ChessBoard';
import { 
  initializeBoard, 
  getValidMoves, 
  isValidMove, 
  makeMove, 
  isInCheck, 
  isCheckmate, 
  isStalemate,
  canPromotePawn,
  promotePawn
} from './gameLogic';
import './App.css';

// Main App component - manages game state and user interactions
const App = () => {
  // Game state
  const [board, setBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'check', 'checkmate', 'stalemate'
  const [promotionPending, setPromotionPending] = useState(null);
  
  // Check game status after each move
  useEffect(() => {
    const inCheck = isInCheck(board, currentPlayer);
    const checkmate = isCheckmate(board, currentPlayer, gameHistory);
    const stalemate = isStalemate(board, currentPlayer, gameHistory);
    
    if (checkmate) {
      setGameStatus('checkmate');
    } else if (stalemate) {
      setGameStatus('stalemate');
    } else if (inCheck) {
      setGameStatus('check');
    } else {
      setGameStatus('playing');
    }
  }, [board, currentPlayer, gameHistory]);
  
  // Handle square click events
  const handleSquareClick = (row, col) => {
    // If waiting for pawn promotion, ignore clicks
    if (promotionPending) return;
    
    // If no piece is selected
    if (!selectedSquare) {
      const piece = board[row][col];
      // Select piece if it belongs to current player
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare({ row, col });
        const moves = getValidMoves(board, row, col, gameHistory);
        setValidMoves(moves);
      }
    } else {
      // If clicking on the same square, deselect
      if (selectedSquare.row === row && selectedSquare.col === col) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }
      
      // Check if the move is valid
      if (isValidMove(board, selectedSquare.row, selectedSquare.col, row, col, currentPlayer, gameHistory)) {
        const piece = board[selectedSquare.row][selectedSquare.col];
        const moveData = validMoves.find(move => move.row === row && move.col === col);
        
        // Make the move
        const newBoard = makeMove(board, selectedSquare.row, selectedSquare.col, row, col, moveData);
        
        // Check for pawn promotion
        if (canPromotePawn(newBoard, row, col)) {
          setPromotionPending({ row, col, color: piece.color });
          setBoard(newBoard);
        } else {
          // Complete the move
          completeMove(newBoard, piece, selectedSquare, { row, col }, moveData);
        }
      } else {
        // Select new piece if it belongs to current player
        const piece = board[row][col];
        if (piece && piece.color === currentPlayer) {
          setSelectedSquare({ row, col });
          const moves = getValidMoves(board, row, col, gameHistory);
          setValidMoves(moves);
        } else {
          // Deselect if clicking on empty square or opponent's piece
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    }
  };
  
  // Complete a move (after potential pawn promotion)
  const completeMove = (newBoard, piece, from, to, moveData) => {
    setBoard(newBoard);
    
    // Add to game history
    const move = {
      piece,
      from,
      to,
      moveData,
      timestamp: Date.now()
    };
    setGameHistory([...gameHistory, move]);
    
    // Switch players
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
    
    // Clear selection
    setSelectedSquare(null);
    setValidMoves([]);
  };
  
  // Handle pawn promotion
  const handlePromotion = (promotionType) => {
    if (!promotionPending) return;
    
    const newBoard = promotePawn(board, promotionPending.row, promotionPending.col, promotionType);
    
    // Find the last move to complete it
    const lastMove = gameHistory[gameHistory.length - 1];
    if (lastMove) {
      completeMove(newBoard, lastMove.piece, lastMove.from, promotionPending, lastMove.moveData);
    }
    
    setPromotionPending(null);
  };
  
  // Reset the game
  const resetGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer('white');
    setSelectedSquare(null);
    setValidMoves([]);
    setGameHistory([]);
    setGameStatus('playing');
    setPromotionPending(null);
  };
  
  // Get game status message
  const getGameStatusMessage = () => {
    switch (gameStatus) {
      case 'check':
        return <span className="check-warning">Check!</span>;
      case 'checkmate':
        return <span className="checkmate-warning">
          Checkmate! {currentPlayer === 'white' ? 'Black' : 'White'} wins!
        </span>;
      case 'stalemate':
        return <span className="stalemate-warning">Stalemate! Draw!</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="app">
      <div className="game-container">
        <h1 className="game-title">Chess Game</h1>
        
        <div className="game-info">
          <div className="current-player">
            Current Turn: <span className={`player-${currentPlayer}`}>
              {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}
            </span>
            {getGameStatusMessage()}
          </div>
          <button className="reset-button" onClick={resetGame}>
            Reset Game
          </button>
        </div>
        
        {/* Pawn Promotion Modal */}
        {promotionPending && (
          <div className="promotion-modal">
            <div className="promotion-content">
              <h3>Choose Promotion:</h3>
              <div className="promotion-options">
                <button onClick={() => handlePromotion('queen')} className="promotion-btn">
                  ♕ Queen
                </button>
                <button onClick={() => handlePromotion('rook')} className="promotion-btn">
                  ♖ Rook
                </button>
                <button onClick={() => handlePromotion('bishop')} className="promotion-btn">
                  ♗ Bishop
                </button>
                <button onClick={() => handlePromotion('knight')} className="promotion-btn">
                  ♘ Knight
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="board-container">
          <ChessBoard
            board={board}
            currentPlayer={currentPlayer}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            onSquareClick={handleSquareClick}
          />
        </div>
        
        <div className="game-instructions">
          <h3>How to Play:</h3>
          <ul>
            <li>Click a piece to select it</li>
            <li>Valid moves will be highlighted</li>
            <li>Click a highlighted square to move</li>
            <li>Players alternate turns automatically</li>
            <li>Game prevents illegal moves and shows check/checkmate</li>
            <li>Castling: Move king two squares when safe</li>
            <li>En Passant: Capture pawns that moved two squares</li>
            <li>Promotion: Pawns become Queen/Rook/Bishop/Knight at the end</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
