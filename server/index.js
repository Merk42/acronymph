const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
      origin: "https://markecurtis.com",
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
const TIME_TO_ENTER = 30000;
const TIME_TO_VOTE = 20000;
const TIME_TO_VIEW = 10000;
const TIME_TO_CELEBRATE = 15000;
const MAX_ROUNDS = 10;

function acroLengthFromRound(round){
  const NEWLENGTH = ((round-1) % 5) + 3;
  return NEWLENGTH;
}

function getRandomLetter() {
  /*
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const randomIndex = Math.floor(Math.random() * alphabet.length);
  return alphabet[randomIndex];
  */
  /* WEIGHTED BY FREQUENCY OF STARTING A WORD IN ENGLISH */
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
  const ALPHA_ARRAY = ALPHABET.split("");
  const WEIGHTS = [570, 60, 940, 610, 390, 410, 330, 370, 390, 110, 100, 310, 560, 220, 250, 770, 49, 600, 1100, 500, 290, 150, 270, 5, 36, 24]
  const cumulativeWeights = [];
  let sum = 0;
  for (let i = 0; i < WEIGHTS.length; i++) {
    sum += WEIGHTS[i];
    cumulativeWeights.push(sum);
  }

  const randomNumber = Math.random() * sum;

  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (randomNumber < cumulativeWeights[i]) {
      return ALPHA_ARRAY[i];
    }
  }
}
  
function generateAcro(length = 3) {
  const ACRO = [];
  for (let i = 0; i < length; i++) {
    ACRO.push(getRandomLetter())
  }
  if (isBadAcro(ACRO)) {
    return generateAcro(length);
  }
  // TODO make sure result isn't some 'bad word';
  return ACRO
}

function isBadAcro(acro) {
  const DISALLOWED = ['ass', 'cunt', 'bitch'];
  return DISALLOWED.includes(acro.join(""))
}

const rooms = {};

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  socket.on("joinRoom", (room, name) => {
    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        modeTimeout: null,
        currentAcronym: null,
        currentRound: 0,
        currentEntries: [],
        currentVotes: {}
      };
    }
    if (rooms[room].players.filter(player => player.name === name).length > 0) {
      io.to(socket.id).emit("join_error", `A player with the username of ${player.name} already exists in ${room}`);
    } else if (rooms[room].players.length >= 20) {
      io.to(socket.id).emit("join_error", `The ${room} room is full`);
    } else {
      console.log(name, 'has joined the game')
      socket.join(room);
      console.log("User Joined", socket.id);
      io.to(room).emit("enter_room", socket.id, name);
      rooms[room].players.push({ 
        id: socket.id,
        name: name,
        score: 0
      });
      io.to(room).emit("players_updated", rooms[room].players);
      if (rooms[room].players.length === 1) {
        sendNewAcronym(room);
      }
    }
    socket.on("disconnect", () => {
      const PLAYERS_CONNECTED = rooms[room].players.filter(player => player.id !== socket.id);
      rooms[room].players = PLAYERS_CONNECTED;
      io.to(room).emit("players_updated", rooms[room].players);
    })          
  });

  socket.on("acroEntered", (room, acronym) => {
    console.log(socket.id, 'entered', acronym)
    rooms[room].currentEntries.push({
      id: socket.id,
      acro: acronym
    });
  });

  socket.on("voted", (room, acroid, userid) => {
    rooms[room].currentVotes[userid] = acroid;
  })


})

function sendNewAcronym(room) {
  if (rooms[room].players.length === 0) {
    clearTimeout(rooms[room].modeTimeout);
    delete rooms[room];
    return;
  }

  // game over? lightning?
  if (rooms[room].currentRound === MAX_ROUNDS) {
    console.log("GG!!");
    gameOver(room)
    return;
  }
    
  rooms[room].currentRound++;
  const ACROLENGTH = acroLengthFromRound(rooms[room].currentRound);
  const ACRO = generateAcro(ACROLENGTH);
  rooms[room].currentAcronym = ACRO;

  rooms[room].currentEntries = [];
  rooms[room].currentVotes = {};
  io.to(room).emit("newAcronym", {
    acronym: ACRO,
    timer: TIME_TO_ENTER,
    round: rooms[room].currentRound
  });
  clearTimeout(rooms[room].modeTimeout);
  rooms[room].modeTimeout = setTimeout(() => {
    console.log("times up, now vote!")
    voteOnAcroym(room);
  }, TIME_TO_ENTER);
  
}

function voteOnAcroym(room) {
  io.to(room).emit("voteOnAcronym", {      
    entries: rooms[room].currentEntries,
    timer: TIME_TO_VOTE,
    round: rooms[room].currentRound
  });
  clearTimeout(rooms[room].modeTimeout);
  rooms[room].modeTimeout = setTimeout(() => {
    console.log("times up, lets see who won!");
    resultsOfAcronym(room);
  }, TIME_TO_VOTE);
}

function resultsOfAcronym(room) {
  const votesPerId = countValues(rooms[room].currentVotes);
  const updatedPlayersAndScore = updateScore(rooms[room].players, votesPerId);
  // TODO maybe update players on next phase?
  rooms[room].players = updatedPlayersAndScore;
  io.to(room).emit("resultsOfAcronym", {
    players: rooms[room].players,
    entries: pointsToAcros(rooms[room].currentEntries, votesPerId),
    timer: TIME_TO_VIEW,
    round: rooms[room].currentRound
  });
  clearTimeout(rooms[room].modeTimeout);
  rooms[room].modeTimeout = setTimeout(() => {
    console.log("times up, next acro coming up!");
    sendNewAcronym(room);
  }, TIME_TO_VIEW);
}

function gameOver(room) {
  const SORTED = rooms[room].players.sort((a, b) => {
    if (a.score < b.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }
    return 0;
  });
  if (SORTED.length > 1 && SORTED[0].score === SORTED[1].score) {
    io.to(room).emit("gameover", {
      winner: null,
      tie: true,
      timer: TIME_TO_CELEBRATE
    });
  } else {
    io.to(room).emit("gameover", {
      winner: SORTED[0].name,
      tie: false,
      timer: TIME_TO_CELEBRATE
    });
  }
  rooms[room].modeTimeout = setTimeout(() => {
    console.log("gg!!")
    startNewGame(room);
  }, TIME_TO_CELEBRATE);
}

function startNewGame(room) {
  const RESET_PLAYERS = rooms[room].players.map(player => { 
    return { ...player, score:0 };
  });
  rooms[room].players = RESET_PLAYERS;
  io.to(room).emit("players_updated", rooms[room].players);
  rooms[room].currentRound = 0;
  sendNewAcronym(room, false);
}

function countValues(obj) {
  const valueCounts = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    }
  }
  return valueCounts;
}

function updateScore(players, votecount) {
  let updatedplayers = players;
  for (const key in votecount) {
    if (votecount.hasOwnProperty(key)) { // Check if the key is a direct property
      const value = votecount[key];
      const idToUpdate = updatedplayers.find(player => player.id === key);
      if (idToUpdate) {
        idToUpdate.score = idToUpdate.score + value;
      }
    }
  }
  return updatedplayers
}

function pointsToAcros(acros, votecount) {
  let updatedacros = acros;
  for (const key in votecount) {
    if (votecount.hasOwnProperty(key)) { // Check if the key is a direct property
      const value = votecount[key];
      const idToUpdate = updatedacros.find(acro => acro.id === key);
      if (idToUpdate) {
        idToUpdate.votes = value;
      }
    }
  }
  return updatedacros;
}



server.listen(3001, () => {
    console.log('server running...')
})
