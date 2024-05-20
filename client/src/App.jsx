import React, {useState, useEffect} from 'react'
import './App.css'
import Board from './MyComponents/Board';
//enclosing in brackets means destructuring
import {io} from 'socket.io-client'
// const socket = io('http://localhost:3000', {
//   autoConnect: true,
// });
import Swal from 'sweetalert2';

function App() {

  const [gameStarted, setGameStarted] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName]=useState(null);
  const [playingAs, setPlayingAs]=useState(null);
  //We're using the useEffect hook to add the event listener for the "connect" event only when the socket state changes.
  //When the socket is initialized (after clicking the "Play Game" button), the event listener is added, and when the connection is established, an alert is shown, and the gameStarted state is updated to true.
  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        alert("Connected to the server");
        setGameStarted(true);
      });
    }
  }, [socket]);

  socket?.on("OpponentNotFound", function(){
    setOpponentName(false);
  });
  socket?.on("OpponentFound", function(data){
    //console.log(data);
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });

  if(gameStarted && !opponentName){
    return(
      <div className='waiting_for_opponent'>
        <p>Waiting for opponent...</p>
      </div>
    )
  };

  const initiateSocket = async () =>{
    //name is local var
    const name = await takePlayerName();
    if(!name.isConfirmed){
      return;
    }
    const userName = name.value;
    setPlayerName(userName);

    const newSocket = io('http://localhost:3000', {
        autoConnect: true,
    });

    newSocket?.emit("request_to_play",{
      playerName:userName,
    })

    setSocket(newSocket);
  }

  const takePlayerName = async () => {
    const name = await Swal.fire({
      title: "Enter your Name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write your name!";
        }
      }
    });
    return name;
  };

  return (
    <div className='App'>
      {!gameStarted ? (
        <button className='play-Button' onClick={initiateSocket}>Play Game</button>
      ) : (
        <Board playerName={playerName} opponentName={opponentName} playingAs={playingAs} socket={socket} />
      )}
    </div>
  );
}

export default App;
