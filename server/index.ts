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
const TIMES_TO_ENTER = [30000, 30000, 30000, 40000, 40000, 30000, 30000, 30000, 40000, 40000]
const TIME_TO_VOTE = 20000;
const TIME_TO_VIEW = 10000;
const TIME_TO_CELEBRATE = 15000;
const MAX_ROUNDS = 10;

type Acronym = string[];

interface Rooms {
  [key: string]: Room;
}

interface CurrentEntry {
  id: string;
  acro: string;
  votes?: number;
}

interface CurrentVotes {
  [key: string]: string;
}

interface ValueCounts {
  [key: string]: number;
}

interface Room {
  players: Player[],
  modeTimeout: any,
  currentAcronym: Acronym,
  currentRound: number,
  currentEntries: CurrentEntry[],
  currentVotes: CurrentVotes
}

interface Player {
  name: string;
  id: string;
  score: number;
}

interface Socket {
  on: Function;
  id: string;
  join: Function;
}


function acroLengthFromRound(round:number):number{
  const NEWLENGTH = ((round-1) % 5) + 3;
  return NEWLENGTH;
}

function getRandomLetter():string {
  /*
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const randomIndex = Math.floor(Math.random() * alphabet.length);
  return alphabet[randomIndex];
  */
  /* WEIGHTED BY FREQUENCY OF STARTING A WORD IN ENGLISH */
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
  const ALPHA_ARRAY = ALPHABET.split("");
  const WEIGHTS = [570, 60, 940, 610, 390, 410, 330, 370, 390, 110, 100, 310, 560, 220, 250, 770, 49, 600, 1100, 500, 290, 150, 270, 5, 36, 24]
  const cumulativeWeights:number[] = [];
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
  return ALPHA_ARRAY[0]
}
  
function generateAcro(length = 3):Acronym {
  const ACRO:Acronym = [];
  for (let i = 0; i < length; i++) {
    ACRO.push(getRandomLetter())
  }
  if (isBadAcro(ACRO)) {
    return generateAcro(length);
  }
  return ACRO
}

function stringHashCode(str:string):number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function isBadAcro(acro:string[]):boolean {
  const DISALLOWED = [96897, 106251, 3065272, 93747762, -1045620280];
  const HASHED = stringHashCode(acro.join(""));
  return DISALLOWED.includes(HASHED)
}

const rooms:Rooms = {};

io.on("connection", (socket:Socket) => {
  socket.on("joinRoom", (room:string, name:string) => {
    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        modeTimeout: null,
        currentAcronym: [],
        currentRound: 0,
        currentEntries: [],
        currentVotes: {}
      };
    }
    if (rooms[room].players.filter((player:Player) => player.name === name).length > 0) {
      io.to(socket.id).emit("join_error", `A player with the username of ${name} already exists in ${room}`);
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
        startNewGame(room);
      }
      if (rooms[room].players.length === 2) {
        // A CHALLENGER APPEARS
        clearTimeout(rooms[room].modeTimeout);
        startNewGame(room);
      }
    }
    socket.on("disconnect", () => {
      const PLAYERS_CONNECTED = rooms[room].players.filter(player => player.id !== socket.id);
      rooms[room].players = PLAYERS_CONNECTED;
      io.to(room).emit("players_updated", rooms[room].players);
    })          
  });

  socket.on("acroEntered", (room:string, acronym:string) => {
    console.log(socket.id, 'entered', acronym)
    rooms[room].currentEntries.push({
      id: socket.id,
      acro: acronym
    });
  });

  socket.on("voted", (room:string, acroid:string, userid:string) => {
    rooms[room].currentVotes[userid] = acroid;
  })


})

function sendNewAcronym(room:string) {
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
  const TIME_TO_ENTER = TIMES_TO_ENTER[rooms[room].currentRound-1];
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

function voteOnAcroym(room:string) {
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

function resultsOfAcronym(room:string) {
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

function gameOver(room:string) {
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

function startNewGame(room:string) {
  const RESET_PLAYERS = rooms[room].players.map(player => { 
    return { ...player, score:0 };
  });
  rooms[room].players = RESET_PLAYERS;
  io.to(room).emit("players_updated", rooms[room].players);
  rooms[room].currentRound = 0;
  sendNewAcronym(room);
}

function countValues(obj:CurrentVotes):ValueCounts {
  const valueCounts:ValueCounts = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    }
  }
  return valueCounts;
}

function updateScore(players:Player[], votecount:ValueCounts) {
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

function pointsToAcros(acros:CurrentEntry[], votecount:ValueCounts) {
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
