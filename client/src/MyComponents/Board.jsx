import React, { useState, useEffect } from "react";
import Square from "./Square";

const Board = ({ playerName, opponentName, playingAs, socket }) => {
  const [state, setState] = useState(Array(9).fill(null));
  const [finishedState, setFinishedState] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("O");

  socket?.on("opponentLeftMatch", () => {
    setFinishedState("opponentLeftMatch");
});

socket?.on("gameReset", () => {
    setState(Array(9).fill(null));
    setFinishedState(false);
});

const checkWinner = () => {
    const logic = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [6, 4, 2]
    ];
    for (let x of logic) {
        const [a, b, c] = x;
        if (state[a] !== null && state[a] === state[b] && state[a] === state[c]) {
            return state[a];
        }
    }
    return false;
}
const checkDraw = () => {
    for (let each of state) {
        if (each === null) {
            return false;
        }
    }
    return true;
}
useEffect(() => {
    const winner = checkWinner();
    const draw = checkDraw();
    if (winner) {
        setFinishedState(winner);
    } else if (draw) {
        setFinishedState("draw");
    }
}, [state]);

socket?.on("playerMoveFromServer", (data) => {
    setState((prevState) => {
        const newState=[...prevState];
        newState[data.index]=data.sign;
        return newState;
    })
    setCurrentPlayer((prev) => (prev === "O" ? "X" : "O"));
});

const handleclick = (index) => {
    if (state[index] !== null || playingAs !== currentPlayer) {
        return;
    }

    if (finishedState) {
        return;
    }

    const copystate = [...state];
    //copystate[index]=playingAs === "X" ? (xTurn ? "X" : "O") : (xTurn ? "O" : "X");
    copystate[index] = currentPlayer;
    setState(copystate);

    socket.emit("playerMoveFromClient", {
        index: index,
        sign: currentPlayer,
    });
    setCurrentPlayer((prev) => (prev === "O" ? "X" : "O"));
};

  const resetGame = () => {
    setState(Array(9).fill(null));
    setFinishedState(false);
    socket.emit("resetGame");
  };
  return (
    <div className="board-container">
      <h1 className="result-text">Tic Tac Toe</h1>
      <div className="turn-detect">
        <div
          className={`left ${
            currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {playerName}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {opponentName}
        </div>
      </div>
      {playerName && opponentName && (
        <div className="heading">
          <h3>Your Name : {playerName}</h3>
          <h3>Opponent Name : {opponentName}</h3>
        </div>
      )}
      <div className="board-block">
        <div className="board-row">
          <Square className="square"
            onClick={() => {
              handleclick(0);
            }}
            value={state[0]}
          />
          <Square className="square"
            onClick={() => {
              handleclick(1);
            }}
            value={state[1]}
          />
          <Square className="square"
            onClick={() => {
              handleclick(2);
            }}
            value={state[2]}
          />
        </div>
        <div className="board-row">
          <Square
            onClick={() => {
              handleclick(3);
            }}
            value={state[3]}
          />
          <Square
            onClick={() => {
              handleclick(4);
            }}
            value={state[4]}
          />
          <Square
            onClick={() => {
              handleclick(5);
            }}
            value={state[5]}
          />
        </div>
        <div className="board-row">
          <Square
            onClick={() => {
              handleclick(6);
            }}
            value={state[6]}
          />
          <Square
            onClick={() => {
              handleclick(7);
            }}
            value={state[7]}
          />
          <Square
            onClick={() => {
              handleclick(8);
            }}
            value={state[8]}
          />
        </div>
      </div>
      {finishedState &&
      finishedState !== "opponentLeftMatch" &&
      finishedState !== "draw" ? (
        <div>
          <h3 className="result-text">{finishedState} has won the game</h3>
          <button className="reset-button" onClick={resetGame}>RESET GAME</button>
        </div>
      ) : finishedState &&
        finishedState !== "opponentLeftMatch" &&
        finishedState === "draw" ? (
        <div>
          <h3 className="result-text">The Game is Draw</h3>
          <button className="reset-button" onClick={resetGame}>RESET GAME</button>
        </div>
      ) : finishedState && finishedState === "opponentLeftMatch" ? (
        <div>
          <h3 className="result-text">You won the match</h3>
          <h3 className="result-text">Your opponent has left the match</h3>
        </div>
      ) : <h3 className="result-text">You are playing as {playingAs}</h3>}
    </div>
  );
};

export default Board;
