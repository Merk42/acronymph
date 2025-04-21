import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

import Results from './components/Results';
import EnterAcro from './components/EnterAcro';
import VoteAcro from './components/VoteAcro';
import Login from './components/Login';
import Players from './components/Players';
import { Player } from './types/Player';
import { Round } from './types/Round';
import RoundDisplay from './components/RoundDisplay';
import Countdown from './components/Countdown';

const socket = io("http://localhost:3001");

function App() {

  const [room, setRoom] = useState("")

  const [currentacro, setCurrentacro] = useState([" "]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [roundMode, setRoundMode] = useState(''); // or vote, or stuff for lightning round?
  const [enteredAcronyms, setEnteredAcronyms] =  useState([]);
  const [timer, setTimer] = useState(0);

  const DEMOPLAYERS:Player[] = [
    {
      name: "Bobson Dugnutt",
      id: "3lkj4lkj3",
      score: 5
    },
    {
      name:"Sleve McDichael",
      id: "3e43qtlkj",
      score: 0
    },
    {
      name: "Todd Bonzalez",
      id: "jkgj333",
      score: 1
    },
    {
      name: "Mike Truk",
      id: "jherkljwwt",
      score: 2
    }, {
      name:"Dwigt Rortugal",
      id: "e4ktjlkkjt",
      score: 2
    }
  ]

/*
  useEffect(() => {
    const ACROLENGTH = acroLengthFromRound(roundNumber);
    setCurrentacro(generateAcro(ACROLENGTH))
  }, [roundNumber]);
*/
  useEffect(() => {
    socket.on('newAcronym', (data) => {
      console.log('newAcronym...', data)
      setRoundMode('enter')
      setCurrentacro(data.acronym);
      setRoundNumber(data.round);
      setTimer(data.timer);
      /*
      setQuestion(data.question);
      setOptions(data.answers);
      setAnswered(false);
      setSeconds(data.timer)
      setSelectedAnswerIndex();
     */

  
    });

    socket.on('voteOnAcronym', (data) => {
      console.log('voteOnAcronym...', data);
      console.log('list', data.acrosToVote);
      setEnteredAcronyms(data.acrosToVote);
      setTimer(data.timer);
      setRoundMode('vote')

      // setScores(data.scores);

      // else {
        // setResult(`Incorrect. The correct answer was: ${data.answers[data.correctAnswer]}`);
      // }

    });

    socket.on('resultsOfAcronym', (data)=>{
      console.log('resultsOfAcronym...', data)
      setTimer(data.timer);
      // setWinner(data.winner);
      setRoundMode('results')
    })

    return () => {
      socket.off('newAcronym');
      socket.off('voteOnAcronym');
      socket.off('resultsOfAcronym');
    };
  }, []);

  useEffect(() => {
    socket.on("enter_room", (e) => {
      console.log('enter?', e)
    })
  }, [])

  function acroEntered(e:string) {
    console.log('acro entered',e)
    socket.emit('acroEntered', room, e)
  }



  function joinRoom(room:string, username: string) {
    console.log(username, 'is trying joining room', room, 'from parent...');
    // socket.emit("join_room", room)
    setRoom(room);
    socket.emit('joinRoom', room, username);
  }

  function votedFor(id:string) {
    socket.emit('voted', room, id)
  }
  
  // round()
  return (
      <div className="App">
        { roundMode &&
        <Players players={DEMOPLAYERS} />
        }
        <main>
          { roundNumber > 0 && 
            <RoundDisplay round={roundNumber} mode={roundMode}/>
          }
        {(() => {
          switch (roundMode) {
            case 'enter':
              return <EnterAcro ACRONYM={currentacro} onAcroEntered={acroEntered}/>
            case 'vote':
              return <VoteAcro acros={enteredAcronyms} onVoted={votedFor}/>
            case 'results':
              return <Results acros={enteredAcronyms}/>
            default:
              return <Login joinRoom={joinRoom}/>
          }
        })()}
        { roundNumber > 0 &&
          <Countdown timer={timer}/>
        }
        </main>
      </div>
  )
}

export default App
