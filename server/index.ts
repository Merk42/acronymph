import { Rooms, Player, Socket } from "./types";
import { acronymForRound } from "./modes/enterAcro";
import { countValues, roundWinner, updateScore, pointsToAcros } from "./modes/results";
import { categoryOptions } from "./modes/category";
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
      origin: "https://acronymph.markecurtis.com",
      methods: ["GET", "POST"]
  }
});
/*
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
*/
const TIMES_TO_ENTER = [30000, 30000, 30000, 40000, 40000, 30000, 30000, 30000, 40000, 40000]
const TIME_TO_VOTE = 20000;
const TIME_TO_VIEW = 10000;
const TIME_TO_CATEGORY = 15000;
const TIME_TO_CELEBRATE = 15000;
const MAX_ROUNDS = 10;

const CATEGORY_POOL = [
  "general",
  "food & drink",
  "movies & tv",
  "sci-fi",
  "sports",
  "animals",
  "vacation",
  "horror",
  "history"
]

const rooms:Rooms = {};

io.on("connection", (socket:Socket) => {
  socket.on("joinRoom", (roomName:string, userName:string) => {
    console.log('room', roomName)
    if (!rooms[roomName]) {
      rooms[roomName] = {
        players: [],
        modeTimeout: null,
        currentAcronym: [],
        currentRound: 0,
        currentEntries: [],
        currentVotes: {},
        currentCategory: CATEGORY_POOL[0],
        hasCategories: roomName === 'categories' ? true : false
      };
    }
    if (rooms[roomName].players.filter((player:Player) => player.name === userName).length > 0) {
      io.to(socket.id).emit("join_error", `A player with the username of ${userName} already exists in ${roomName}`);
    } else if (rooms[roomName].players.length >= 20) {
      io.to(socket.id).emit("join_error", `The ${roomName} room is full`);
    } else {
      console.log(userName, 'has joined the game')
      socket.join(roomName);
      console.log("User Joined", socket.id);
      io.to(roomName).emit("enter_room", socket.id, userName);
      rooms[roomName].players.push({ 
        id: socket.id,
        name: userName,
        score: 0
      });
      io.to(roomName).emit("players_updated", rooms[roomName].players);
      if (rooms[roomName].players.length === 1) {
        startNewGame(roomName);
      }
      if (rooms[roomName].players.length === 2) {
        // A CHALLENGER APPEARS
        clearTimeout(rooms[roomName].modeTimeout);
        startNewGame(roomName);
      }
    }
    socket.on("disconnect", () => {
      const PLAYERS_CONNECTED = rooms[roomName].players.filter(player => player.id !== socket.id);
      rooms[roomName].players = PLAYERS_CONNECTED;
      io.to(roomName).emit("players_updated", rooms[roomName].players);
      if (rooms[roomName].players.length === 0) {
        clearTimeout(rooms[roomName].modeTimeout);
        delete rooms[roomName];
        return;
      }
    })          
  });

  socket.on("acroEntered", (roomName:string, acronym:string) => {
    console.log(socket.id, 'entered', acronym)
    rooms[roomName].currentEntries.push({
      id: socket.id,
      acro: acronym
    });
  });

  socket.on("voted", (roomName:string, acroid:string, userid:string) => {
    rooms[roomName].currentVotes[userid] = acroid;
  })

  socket.on("category", (roomName:string, category:string) => {
    console.log('be category', category)
    rooms[roomName].currentCategory = category;
  })
})

function choosingCategory(roomName:string, winner:Player) {
  rooms[roomName].currentCategory = CATEGORY_POOL[0];
  io.to(roomName).except(winner.id).emit("choosingCategory", {
    winner: winner.name,
    timer: TIME_TO_CATEGORY,
    round: rooms[roomName].currentRound
  });
  io.to(winner.id).emit("chooseCategory", {
    categories: categoryOptions(CATEGORY_POOL, 4),
    timer: TIME_TO_CATEGORY,
    round: rooms[roomName].currentRound
  });

  clearTimeout(rooms[roomName].modeTimeout);
  // TODO find winner of round, and pass their ID and Name to new 'category' mode
  rooms[roomName].modeTimeout = setTimeout(() => {
    console.log("next category being chosen!");
    sendNewAcronym(roomName);
  }, TIME_TO_CATEGORY);
}

function sendNewAcronym(roomName:string) {   
  rooms[roomName].currentRound++;
  const ACRO = acronymForRound(rooms[roomName].currentRound);
  rooms[roomName].currentAcronym = ACRO;

  rooms[roomName].currentEntries = [];
  rooms[roomName].currentVotes = {};
  const TIME_TO_ENTER = TIMES_TO_ENTER[rooms[roomName].currentRound-1];
  io.to(roomName).emit("newAcronym", {
    acronym: ACRO,
    timer: TIME_TO_ENTER,
    round: rooms[roomName].currentRound,
    ...(rooms[roomName].hasCategories && { category: rooms[roomName].currentCategory })
  });
  clearTimeout(rooms[roomName].modeTimeout);
  rooms[roomName].modeTimeout = setTimeout(() => {
    console.log("times up, now vote!")
    voteOnAcroym(roomName);
  }, TIME_TO_ENTER);
  
}

function voteOnAcroym(roomName:string) {
  io.to(roomName).emit("voteOnAcronym", {
    entries: rooms[roomName].currentEntries,
    timer: TIME_TO_VOTE,
    round: rooms[roomName].currentRound
  });
  clearTimeout(rooms[roomName].modeTimeout);
  rooms[roomName].modeTimeout = setTimeout(() => {
    console.log("times up, lets see who won!");
    resultsOfAcronym(roomName);
  }, TIME_TO_VOTE);
}

function resultsOfAcronym(roomName:string) {
  const votesPerId = countValues(rooms[roomName].currentVotes);
  const winner = roundWinner(rooms[roomName].currentEntries, rooms[roomName].players, votesPerId);
  const updatedPlayersAndScore = updateScore(rooms[roomName].players, votesPerId);
  // TODO maybe update players on next phase?
  rooms[roomName].players = updatedPlayersAndScore;
  io.to(roomName).emit("resultsOfAcronym", {
    players: rooms[roomName].players,
    entries: pointsToAcros(rooms[roomName].currentEntries, votesPerId),
    timer: TIME_TO_VIEW,
    round: rooms[roomName].currentRound
  });
  clearTimeout(rooms[roomName].modeTimeout);
  // TODO find winner of round, and pass their ID and Name to new 'category' mode
  rooms[roomName].modeTimeout = setTimeout(() => {
    // game over? lightning?
    if (rooms[roomName].currentRound === MAX_ROUNDS) {
      console.log("GG!!");
      gameOver(roomName)
      return;
    }
    if (rooms[roomName].hasCategories) {
      console.log('category gets chosen');
      choosingCategory(roomName, winner);
    } else {
      console.log("times up, next acro coming up!");
      sendNewAcronym(roomName);
    }
  }, TIME_TO_VIEW);
}

function gameOver(roomName:string) {
  const SORTED = rooms[roomName].players.sort((a, b) => {
    if (a.score < b.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }
    return 0;
  });
  if (SORTED.length > 1 && SORTED[0].score === SORTED[1].score) {
    io.to(roomName).emit("gameover", {
      winner: null,
      tie: true,
      timer: TIME_TO_CELEBRATE
    });
  } else {
    io.to(roomName).emit("gameover", {
      winner: SORTED[0].name,
      tie: false,
      timer: TIME_TO_CELEBRATE
    });
  }
  rooms[roomName].modeTimeout = setTimeout(() => {
    console.log("gg!!")
    startNewGame(roomName);
  }, TIME_TO_CELEBRATE);
}

function startNewGame(roomName:string) {
  const RESET_PLAYERS = rooms[roomName].players.map(player => { 
    return { ...player, score:0 };
  });
  rooms[roomName].players = RESET_PLAYERS;
  io.to(roomName).emit("players_updated", rooms[roomName].players);
  rooms[roomName].currentRound = 0;
if (rooms[roomName].hasCategories) {
    rooms[roomName].currentCategory = CATEGORY_POOL[0];
  }
  sendNewAcronym(roomName);
}

server.listen(3001, () => {
    console.log('server running...')
})
