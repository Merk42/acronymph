import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

import GameOver from './components/GameOver';
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

interface EnteredAcro {
  id: string;
  acro: string;
  votes?: number;
}

function App() {

  const [room, setRoom] = useState<string>("");;
  const [userID, setUserID] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [currentacro, setCurrentacro] = useState<string[]>([" "]);
  const [roundNumber, setRoundNumber] = useState<number>(0);
  const [roundMode, setRoundMode] = useState(''); // or vote, or stuff for lightning round?
  const [enteredAcronyms, setEnteredAcronyms] =  useState<EnteredAcro[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<string>('');
  const [isTieGame, setIsTieGame] = useState<boolean>(false);

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
    });

    socket.on('voteOnAcronym', (data) => {
      console.log('voteOnAcronym...', data);
      console.log('list', data.acrosToVote);
      setEnteredAcronyms(data.acrosToVote);
      setTimer(data.timer);
      setRoundMode('vote')
    });

    socket.on('resultsOfAcronym', (data)=>{
      console.log('resultsOfAcronym...', data)
      setPlayers(data.players);
      setTimer(data.timer);
      setEnteredAcronyms(data.acros);
      setRoundMode('results')
    })

    socket.on('gameover', (data) => {
      console.log('gameover', data)
      setRoundMode('gameover');
      setWinner(data.winner)
      setIsTieGame(data.tie);
    })

    return () => {
      socket.off('newAcronym');
      socket.off('voteOnAcronym');
      socket.off('resultsOfAcronym');
      socket.off('gameover');
    };
  }, []);

  useEffect(() => {
    socket.on("enter_room", (id, name) => {
      if (name === userName) {
        setUserID(id);
      }
    })
  }, [userName])

  useEffect(() => {
    socket.on("players_updated", (players) => {
      setPlayers(players)
    })
  }, [])

  function acroEntered(e:string) {
    console.log('acro entered',e)
    socket.emit('acroEntered', room, e)
  }



  function joinRoom(room:string, username: string) {
    console.log(username, 'is trying joining room', room, 'from parent...');
    // socket.emit("join_room", room)
    console.log('set username to', username);
    setUserName(username);
    console.log('username??', userName)
    setRoom(room);
    socket.emit('joinRoom', room, username);
  }

  function votedFor(id:string) {
    socket.emit('voted', room, id, userID)
  }
  
  // round()
  return (
      <div className="App">
        { roundMode &&
        <Players players={players} id={userID} />
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
              return <VoteAcro acros={enteredAcronyms} onVoted={votedFor} id={userID}/>
            case 'results':
              return <Results acros={enteredAcronyms} id={userID}/>
            case 'gameover':
                return <GameOver winner={winner} tie={isTieGame}/>
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
