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
/*
    socket.on("join_room", (data) => {
        socket.join(data);
        console.log("User with ID", socket.id, "joined room", data);
        socket.emit("enter_room", {room:data});
        GO_TO_NEXT_PHASE(data)
    })
*/
    socket.on("joinRoom", (room, name) => {
        console.log(name, 'has joined the game')
        socket.join(room);
        console.log("User Joined", socket.id);
        io.to(room).emit("enter_room", socket.id, name);
        if (!rooms[room]) {
          rooms[room] = {
            players: [],
            currentQuestion: null,
            correctAnswer: null,
            questionTimeout: null,
            shouldSendNewAcronym: true,
            currentAcronym: null,
            currentRound: 0,
            currentAcros: [],
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
    
        if (!rooms[room].currentQuestion) {
          sendNewAcronym(room);
        }
      });

    socket.on("acroEntered", (room, acronym) => {
      console.log(socket.id, 'entered', acronym)
      // maybe should
      rooms[room].currentAcros.push({
        id: socket.id,
        acro: acronym
      });
    });

    socket.on("voted", (room, acroid, userid) => {
      rooms[room].currentVotes[userid] = acroid;
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id)
    })
})

function sendNewAcronym(room) {
    if (rooms[room].players.length === 0) {
      clearTimeout(rooms[room].questionTimeout);
      delete rooms[room];
      return;
    }

    // game over? lightning?
    if (rooms[room].currentRound === 10) {
      console.log("GG!!")
      return;
    }
  
    
      
    rooms[room].currentRound++;
    const ACROLENGTH = acroLengthFromRound(rooms[room].currentRound);
    const ACRO = generateAcro(ACROLENGTH);
    rooms[room].currentAcronym = ACRO;
  
    rooms[room].currentAcros = [];
    rooms[room].currentVotes = {};
    rooms[room].shouldSendNewAcronym = true;
    io.to(room).emit("newAcronym", {      
      timer: TIME_TO_ENTER,
      acronym: ACRO,
      round: rooms[room].currentRound
    });
    clearTimeout(rooms[room].questionTimeout);
    rooms[room].questionTimeout = setTimeout(() => {
      console.log("times up, now vote!")
  
      voteOnAcroym(room);
    }, TIME_TO_ENTER);
}

function voteOnAcroym(room) {
  io.to(room).emit("voteOnAcronym", {      
    acrosToVote: rooms[room].currentAcros,
    timer: TIME_TO_VOTE
  });
  clearTimeout(rooms[room].questionTimeout);
  rooms[room].questionTimeout = setTimeout(() => {
    console.log("times up, lets see who won!");
    resultsOfAcronym(room);
  }, TIME_TO_VOTE);
}

function resultsOfAcronym(room) {
  const votesPerId = countValues(rooms[room].currentVotes);
  const updatedPlayersAndScore = updateScore(rooms[room].players, votesPerId);
  rooms[room].players = updatedPlayersAndScore;
  // TODO maybe this calculation happens in the next phase instead?
  io.to(room).emit("resultsOfAcronym", {      
    timer: TIME_TO_VIEW,
    players: rooms[room].players
  });
  clearTimeout(rooms[room].questionTimeout);
  rooms[room].questionTimeout = setTimeout(() => {
    console.log("times up, next acro coming up!");
    sendNewAcronym(room);
  }, TIME_TO_VIEW);
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
      idToUpdate.score = idToUpdate.score + value;
    }
  }
  return updatedplayers
}

server.listen(3001, () => {
    console.log('server running...')
})
