import { Rooms, Player, Socket } from "./types";
import { acronymForRound, generateAcro } from "./modes/enterAcro";
import { pointsToAcros, roundWinner, updateScore } from "./modes/results";
import { categoryOptions } from "./modes/category";
import { finalists } from "./modes/lightning";
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
const LIGHTNING_ROUNDS = 3;
const TIME_FOR_LIGHTNING = 30000;

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
    if (!rooms[roomName]) {
      rooms[roomName] = {
        players: [],
        modeTimeout: null,
        currentAcronym: [],
        currentRound: 0,
        currentEntries: [],
        currentVotes: {},
        currentCategory: CATEGORY_POOL[0],
        hasCategories: roomName === 'categories' ? true : false,
        lightning: {
          acronyms: [
            [],
            [],
            []
          ],
          round: 0,
          entries: [
            [],
            [],
            []
          ],
          votes: [
            {},
            {},
            {}
          ]
        }
      };
    }
    if (rooms[roomName].players.filter((player:Player) => player.name === userName).length > 0) {
      io.to(socket.id).emit("join_error", `A player with the username of ${userName} already exists in ${roomName}`);
    } else if (rooms[roomName].players.length >= 20) {
      io.to(socket.id).emit("join_error", `The ${roomName} room is full`);
    } else {
      socket.join(roomName);
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
    const LIGHTNING_ROUND = rooms[roomName].lightning.round;
    if (LIGHTNING_ROUND) {
      rooms[roomName].lightning.entries[LIGHTNING_ROUND-1].push({
        id: socket.id,
        acro: acronym
      })
    } else {
    rooms[roomName].currentEntries.push({
      id: socket.id,
      acro: acronym
    });
    }
  });

  socket.on("voted", (roomName:string, acroid:string, userid:string) => {
    const LIGHTNING_ROUND = rooms[roomName].lightning.round;
    if (LIGHTNING_ROUND) {
      rooms[roomName].lightning.votes[LIGHTNING_ROUND-1][userid] = acroid;
    } else {
    rooms[roomName].currentVotes[userid] = acroid;
    }
  })

  socket.on("category", (roomName:string, category:string) => {
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
    resultsOfAcronym(roomName);
  }, TIME_TO_VOTE);
}

function resultsOfAcronym(roomName:string) {
  const POINT_BREAKDOWN = pointsToAcros(rooms[roomName].currentEntries, rooms[roomName].currentVotes)
  const winner = roundWinner(rooms[roomName].players, POINT_BREAKDOWN);
  const updatedPlayersAndScore = updateScore(rooms[roomName].players, POINT_BREAKDOWN);
  // TODO maybe update players on next phase?
  rooms[roomName].players = updatedPlayersAndScore;
  io.to(roomName).emit("resultsOfAcronym", {
    players: rooms[roomName].players,
    entries: POINT_BREAKDOWN,
    timer: TIME_TO_VIEW,
    round: rooms[roomName].currentRound
  });
  clearTimeout(rooms[roomName].modeTimeout);
  // TODO find winner of round, and pass their ID and Name to new 'category' mode
  rooms[roomName].modeTimeout = setTimeout(() => {
    // game over? lightning?
    if (rooms[roomName].currentRound >= MAX_ROUNDS) {
      if (rooms[roomName].players.length < 3) {
      gameOver(roomName)
      return;
      } else {
        lightning(roomName);
        return;
      }
    }
    if (rooms[roomName].hasCategories) {
      choosingCategory(roomName, winner);
    } else {
      sendNewAcronym(roomName);
    }
  }, TIME_TO_VIEW);
}

function lightning(roomName: string) {
  const FINALISTS = finalists(rooms[roomName].players);
  const ACROS = [generateAcro(3), generateAcro(4), generateAcro(5)];
  rooms[roomName].lightning.acronyms = ACROS;
  rooms[roomName].currentRound = 100;
  io.to(roomName).except(FINALISTS[0].id).except(FINALISTS[1].id).emit("wait", {
    timer: LIGHTNING_ROUNDS * TIME_FOR_LIGHTNING,
    message: `Please wait while ${FINALISTS[0].name} and ${FINALISTS[1].name} enter their final entries`,
    round: rooms[roomName].currentRound
  });
  finalistLightning(roomName, FINALISTS)
}

function finalistLightning(roomName: string, finalists: Player[]) {
  const TIME_TO_ENTER = TIME_FOR_LIGHTNING;
  const CURRENT_ACRO = rooms[roomName].lightning.acronyms[rooms[roomName].lightning.round];
  rooms[roomName].lightning.round++;
  rooms[roomName].currentRound++;
  io.to(finalists[0].id).to(finalists[1].id).emit("newAcronym", {
    acronym: CURRENT_ACRO,
    timer: TIME_TO_ENTER,
    round: rooms[roomName].currentRound,
  });
  clearTimeout(rooms[roomName].modeTimeout);
  rooms[roomName].modeTimeout = setTimeout(() => {
    if (rooms[roomName].lightning.round < LIGHTNING_ROUNDS) {
      finalistLightning(roomName, finalists);
    } else {
      // wait for votes to happen
      rooms[roomName].lightning.round = 0;
      voteLightning(roomName, finalists);
      io.to(finalists[0].id).to(finalists[1].id).emit("wait", {
        timer:TIME_TO_VOTE * LIGHTNING_ROUNDS,
        message: "Please wait while voting is occuring",
        round: rooms[roomName].currentRound
      });
    }
    
  }, TIME_TO_ENTER);
}

function voteLightning(roomName: string , finalists: Player[]) {
  rooms[roomName].lightning.round++;
  rooms[roomName].currentRound++;
  io.to(roomName).except(finalists[0].id).except(finalists[1].id).emit("voteOnAcronym", {
    entries: rooms[roomName].lightning.entries[rooms[roomName].lightning.round-1],
    timer: TIME_TO_VOTE,
    round: rooms[roomName].currentRound
  });
  clearTimeout(rooms[roomName].modeTimeout);
  rooms[roomName].modeTimeout = setTimeout(() => {
    if (rooms[roomName].lightning.round < LIGHTNING_ROUNDS) {
      voteLightning(roomName, finalists);
    } else {
      // wait for votes to happen
      rooms[roomName].lightning.round = 0;
      viewLightning(roomName);
    }
  }, TIME_TO_VOTE);
}

function viewLightning(roomName:string) {
  rooms[roomName].lightning.round++;
  rooms[roomName].currentRound++;
  const LIGHTNING_INDEX = rooms[roomName].lightning.round-1;
  // everyone gets to see results
  const POINT_BREAKDOWN = pointsToAcros(rooms[roomName].lightning.entries[LIGHTNING_INDEX], rooms[roomName].lightning.votes[LIGHTNING_INDEX], true)
  const updatedPlayersAndScore = updateScore(rooms[roomName].players, POINT_BREAKDOWN);
  // TODO maybe update players on next phase?
  rooms[roomName].players = updatedPlayersAndScore;
  io.to(roomName).emit("resultsOfAcronym", {
    players: rooms[roomName].players,
    entries: POINT_BREAKDOWN,
    timer: TIME_TO_VIEW,
    round: rooms[roomName].currentRound
  });
  clearTimeout(rooms[roomName].modeTimeout);
  // TODO find winner of round, and pass their ID and Name to new 'category' mode
  rooms[roomName].modeTimeout = setTimeout(() => {
    // game over? lightning?
    if (rooms[roomName].lightning.round < LIGHTNING_ROUNDS) {
      viewLightning(roomName);
    } else {
      gameOver(roomName)
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
