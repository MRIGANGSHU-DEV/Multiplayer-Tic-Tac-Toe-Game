const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:5173/",
});

const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {
  //console.log("Socket connected" + socket.id);
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  //when player name is emit from client receive here
  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;
    //console.log(currentUser);

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        //this is our opponent
        opponentPlayer = user;
        break;
      }
    }
    if (opponentPlayer) {
      //console.log("Opponent found");

      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      })
    

      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "O",
      });
      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.playerName,
        playingAs: "X",
      });

      currentUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
    } else {
      //console.log("Opponent not found");
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("resetGame", () => {
    // Broadcast the reset game event to all connected clients
    io.emit("gameReset");
  });

  socket.on("disconnect", function(){
    const currentUser = allUsers[socket.id];
    currentUser.online=false;
    currentUser.playing=false;

    for (let index = 0; index < allRooms.length; index++) {
        //destructuring
        const {player1, player2} = allRooms[index];

        if(player1.socket.id === socket.id){
            player2.socket.emit("opponentLeftMatch");
            break;
        }
        if(player2.socket.id === socket.id){
            player1.socket.emit("opponentLeftMatch");
            break;
        }
    }
  })
});

httpServer.listen(3000);
