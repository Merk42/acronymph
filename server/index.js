const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

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
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const randomIndex = Math.floor(Math.random() * alphabet.length);
  return alphabet[randomIndex];
}
  
function generateAcro(length = 3) {
  const ACRO = [];
  for (let i = 0; i < length; i++) {
    ACRO.push(getRandomLetter())
  }
  // TODO make sure result isn't some 'bad word';
  return ACRO
}

const rooms = {};

io.on("connection", (socket) => {
    console.log("User Connected", socket.id);
    socket.on("joinRoom", (room, name) => {
        console.log(name, 'has joined the game')
        socket.join(room);
        console.log("User Joined", socket.id);
        io.to(room).emit("enter_room", socket.id, name);
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
        // to make score zero
      //   if(rooms[room]){
      //   rooms[room].players.forEach((player) => {
      //     player.score = 0;
      //   });
      // }

        rooms[room].players.push({ 
          id: socket.id,
          name: name,
          score: 0
         });
        // TODO also do on score updates
        io.to(room).emit("players_updated", rooms[room].players);
        // TODO fix buggy behavior of always increasing round when player enters
        if (rooms[room].players.length === 1) {
          sendNewAcronym(room);
        }
        socket.on("disconnect", () => {
          const PLAYERS_CONNECTED = rooms[room].players.filter(player => player.id !== socket.id);
          rooms[room].players = PLAYERS_CONNECTED;
          io.to(room).emit("players_updated", rooms[room].players);
        })          
        // }
    });

    socket.on("acroEntered", (room, acronym) => {
      console.log(socket.id, 'entered', acronym)
      // maybe should
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
