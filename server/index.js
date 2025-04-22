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
      // rooms[room].players.push({ id: socket.id, name,score: 0  });
        rooms[room].players.push({ id: socket.id, name });
    
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

    socket.on("voted", (room, id) => {
      if (rooms[room].currentVotes[id]) {
        rooms[room].currentVotes[id]++;
      } else {
        rooms[room].currentVotes[id] = 1
      }
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id)
    })
})

const questions = [
  {
    question: "What is the capital of France?",
    answers: [
      { text: "Paris", correct: true },
      { text: "Berlin", correct: false },
      { text: "London", correct: false },
      { text: "Madrid", correct: false },
    ],
  },
  {
    question: "What is the chemical symbol for water?",
    answers: [
      { text: "H2O", correct: true },
      { text: "CO2", correct: false },
      { text: "O2", correct: false },
      { text: "NaCl", correct: false },
    ],
  },
  {
    question: "What is the largest planet in our solar system?",
    answers: [
      { text: "Mercury", correct: false },
      { text: "Venus", correct: false },
      { text: "Mars", correct: false },
      { text: "Jupiter", correct: true },
    ],
  },
  {
    question: "What is the chemical symbol for iron?",
    answers: [
      { text: "Fe", correct: true },
      { text: "Ag", correct: false },
      { text: "Au", correct: false },
      { text: "Cu", correct: false },
    ],
  },
  {
    question: "Which famous scientist is known for the theory of evolution?",
    answers: [
      { text: "Galileo Galilei", correct: false },
      { text: "Isaac Newton", correct: false },
      { text: "Charles Darwin", correct: true },
      { text: "Marie Curie", correct: false },
    ],
  },
  {
    question: "In which country was the game of chess invented?",
    answers: [
      { text: "China", correct: false },
      { text: "India", correct: true },
      { text: "Greece", correct: false },
      { text: "Egypt", correct: false },
    ],
  },

  {
    question: "Which gas is responsible for the Earth's ozone layer?",
    answers: [
      { text: "Oxygen", correct: false },
      { text: "Carbon Dioxide", correct: false },
      { text: "Nitrogen", correct: false },
      { text: "Ozone", correct: true },
    ],
  },
  {
    question: "Which planet is known as the Red Planet?",
    answers: [
      { text: "Mars", correct: true },
      { text: "Venus", correct: false },
      { text: "Jupiter", correct: false },
      { text: "Saturn", correct: false },
    ],
  },
  {
    question: "Which gas do plants use for photosynthesis?",
    answers: [
      { text: "Oxygen", correct: false },
      { text: "Carbon Dioxide", correct: true },
      { text: "Nitrogen", correct: false },
      { text: "Helium", correct: false },
    ],
  },

  {
    question: "What is the capital of Japan?",
    answers: [
      { text: "Beijing", correct: false },
      { text: "Tokyo", correct: true },
      { text: "Seoul", correct: false },
      { text: "Bangkok", correct: false },
    ],
  },
  {
    question:
      "Which famous scientist developed the theory of general relativity?",
    answers: [
      { text: "Isaac Newton", correct: false },
      { text: "Albert Einstein", correct: true },
      { text: "Nikola Tesla", correct: false },
      { text: "Marie Curie", correct: false },
    ],
  },
  {
    question: "Which country is known as the 'Land of the Rising Sun'?",
    answers: [
      { text: "China", correct: false },
      { text: "Japan", correct: true },
      { text: "India", correct: false },
      { text: "Egypt", correct: false },
    ],
  },

  {
    question: "What is the chemical symbol for gold?",
    answers: [
      { text: "Ag", correct: false },
      { text: "Au", correct: true },
      { text: "Fe", correct: false },
      { text: "Hg", correct: false },
    ],
  },
  {
    question: "Which planet is known as the 'Morning Star' or 'Evening Star'?",
    answers: [
      { text: "Mars", correct: false },
      { text: "Venus", correct: true },
      { text: "Mercury", correct: false },
      { text: "Neptune", correct: false },
    ],
  },

  {
    question: "What is the smallest prime number?",
    answers: [
      { text: "1", correct: false },
      { text: "2", correct: true },
      { text: "3", correct: false },
      { text: "5", correct: false },
    ],
  },
  {
    question: "Which country is known as the 'Land of the Rising Sun'?",
    answers: [
      { text: "China", correct: false },
      { text: "South Korea", correct: false },
      { text: "Japan", correct: true },
      { text: "Thailand", correct: false },
    ],
  },
  {
    question: "What is the largest ocean on Earth?",
    answers: [
      { text: "Atlantic Ocean", correct: false },
      { text: "Indian Ocean", correct: false },
      { text: "Arctic Ocean", correct: false },
      { text: "Pacific Ocean", correct: true },
    ],
  },
  {
    question: "Which element has the chemical symbol 'K'?",
    answers: [
      { text: "Krypton", correct: false },
      { text: "Potassium", correct: true },
      { text: "Kryptonite", correct: false },
      { text: "Kallium", correct: false },
    ],
  },
  {
    question: "What is the capital city of India?",
    answers: [
      { text: "Mumbai", correct: false },
      { text: "New Delhi", correct: true },
      { text: "Bangalore", correct: false },
      { text: "Kolkata", correct: false },
    ],
  },
];

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

  console.log('find winner of', rooms[room].currentVotes);
  io.to(room).emit("resultsOfAcronym", {      
    timer: TIME_TO_VIEW
  });
  clearTimeout(rooms[room].questionTimeout);
  rooms[room].questionTimeout = setTimeout(() => {
    console.log("times up, next acro coming up!");
    sendNewAcronym(room);
  }, TIME_TO_VIEW);
}

server.listen(3001, () => {
    console.log('server running...')
})
