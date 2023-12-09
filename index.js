const mongoose = require("mongoose");
const server = require("./src/utils/server");
const GameModel = require("./src/models/GameModel");
const GameController = require("./src/controllers/GameController");
require("dotenv").config();

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("Socket ID", socket.id);

  // Create Game
  socket.on("create-game", async ({ nickname }) => {
    const Game = await GameController.createGame(nickname, socket.id);
    const gameID = Game._id.toString();
    socket.join(gameID);
    io.to(gameID).emit("update-game", Game);
  });

  // Join Game
  socket.on("join-game", async ({ gameID, nickname }) => {
    if (!gameID.match(/^[0-9a-fA-F]{24}$/)) {
      socket.emit("not-correct-game", "Please Enter a valid Game ID");
      return;
    }

    let Game = await GameModel.findById(gameID);

    if (Game.isJoin) {
      const id = Game._id.toString();
      let player = {
        nickname,
        socketID: socket.id,
      };

      socket.join(id);

      Game.players.push(player);
      Game.isJoin = false;
      Game = await Game.save();
      io.to(gameID).emit("update-game", Game);
    } else {
      socket.emit(
        "not-correct-game",
        "Game is in Progress Please try again Later!"
      );
    }
  });

  // Start Timer

  socket.on("timer", async ({ playerID, gameID }) => {
    console.log("Player iD", playerID);
    console.log("Game iD", gameID);

    let Game = await GameModel.findById(gameID);

    const Player = Game.players.id(playerID);

    let countDown = 5;

    if (Player.isPartyLeader) {
      let timerID = setInterval(async () => {
        if (countDown >= 0) {
          console.log("Gam Starting... ", countDown);
          io.to(gameID).emit("timer", {
            countDown,
            msg: "Game Starting...",
          });
          countDown--;
        } else {
          console.log("Game Started");
          Game.isJoin = false;
          Game = await Game.save();
          io.to(gameID).emit("update-game", Game);
          await startGame(gameID);
          clearInterval(timerID);
        }
      }, 1000);
    }
  });

  socket.on("user-input", async ({ value, gameID }) => {
    let Game = await GameModel.findById(gameID);
    if (!(Game.isJoin && Game.isOver)) {
      let player = Game.players.find((player) => player.socketID === socket.id);

      if (Game.words[player.currentWordIndex] === value) {
        player.currentWordIndex += 1;

        if (player.currentWordIndex !== Game.words.length) {
          Game = await Game.save();
          io.to(gameID).emit("update-game", Game);
        } else {
          let endTime = new Date().getTime();

          let { startTime } = Game;

          player.WPM = calculateWPM(startTime, endTime, player);
          console.log("Words Per Minute", player.WPM);

          Game = await Game.save();

          socket.emit("done");

          io.to(gameID).emit("update-game", Game);
        }
      }
    }
  });
});

const calculateWPM = (startTime, endTime, player) => {
  const timeTakenInSec = (endTime - startTime) / 1000;

  const timeTaken = timeTakenInSec / 60;

  let wordTyped = player.currentWordIndex;

  const WPM = Math.floor(wordTyped / timeTaken);

  return WPM;
};

const startGame = async (gameID) => {
  console.log("Starting Game");
  let Game = await GameModel.findById(gameID);
  Game.startTime = new Date().getTime();

  Game = await Game.save();

  console.log(Game.startTime);

  let timer = 120;

  let timerID = setInterval(async () => {
    if (timer >= 0) {
      const timeFormat = calculateTime(timer);
      io.to(gameID).emit("timer", {
        countDown: timeFormat,
        msg: "Time Remaining",
      });
      timer--;
    } else {
      let endTime = new Date().getTime();
      let Game = await GameModel.findById(gameID)
      let { startTime } = Game;
      Game.isOver = true
      Game.players.forEach((player, index)=>{
        if(player.WPM === -1){
            Game.players[index].WPM = calculateWPM(startTime, endTime, player);
        }
      })
      Game = await Game.save()
      io.to(gameID).emit('update-game', Game)
      clearInterval(timerID);
    }
  }, 1000);
};

const calculateTime = (time) => {
  let min = Math.floor(time / 60);
  let sec = time % 60;

  return `${min}:${sec < 10 ? "0" + sec : sec}`;
};

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database is Connected Successfully");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
