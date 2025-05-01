import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

import EnterAcro from './components/modes/EnterAcro';
import GameOver from './components/modes/GameOver';
import Login from './components/modes/Login';
import PleaseWait from './components/modes/PleaseWait';
import Results from './components/modes/Results';
import VoteAcro from './components/modes/VoteAcro';

import Countdown from './components/Countdown';
import Players from './components/Players';
import RoundDisplay from './components/RoundDisplay';

import { Player } from './types/Player';
import { EnteredAcro } from './types/Entry';

const socket = io("https://acronymph.onrender.com/");
// const socket = io("localhost:3001");

type MODE = '' | 'wait' | 'enter' | 'vote' | 'results' | 'gameover';

function App() {

  const [room, setRoom] = useState<string>("");;
  const [userID, setUserID] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [currentacro, setCurrentacro] = useState<string[]>([" "]);
  const [roundNumber, setRoundNumber] = useState<number>(0);
  const [roundMode, setRoundMode] = useState<MODE>(''); // or vote, or stuff for lightning round?
  const [enteredAcronyms, setEnteredAcronyms] =  useState<EnteredAcro[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<string>('');
  const [isTieGame, setIsTieGame] = useState<boolean>(false);

  const [enterError, setEnterError] = useState<string>("");

  useEffect(() => {
    socket.on('newAcronym', (data) => {
      console.log('newAcronym...', data)
      setCurrentacro(data.acronym);
      setRoundNumber(data.round);
      setTimer(data.timer); 
      setRoundMode('enter');
    });

    socket.on('voteOnAcronym', (data) => {
      console.log('voteOnAcronym...', data);
      console.log('list', data.acrosToVote);
      setEnteredAcronyms(data.entries);
      setRoundNumber(data.round);
      setTimer(data.timer);
      setRoundMode('vote')
    });

    socket.on('resultsOfAcronym', (data)=>{
      console.log('resultsOfAcronym...', data)
      setPlayers(data.players);
      setEnteredAcronyms(data.entries);
      setRoundNumber(data.round);
      setTimer(data.timer);
      setRoundMode('results')
    })

    socket.on('gameover', (data) => {
      console.log('gameover', data)
      setWinner(data.winner)
      setIsTieGame(data.tie);
      setTimer(data.timer);
      setRoundMode('gameover');
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
        setRoundMode('wait');
        setEnterError("")
      }
    })
  }, [userName])



  useEffect(() => {
    socket.on("players_updated", (players) => {
      setPlayers(players)
    })
  }, [])

  useEffect(() => {
    socket.on("join_error", (error) => {
      setEnterError(error);
    })
  }, [])

  function acroEntered(e:string) {
    socket.emit('acroEntered', room, e)
  }

  function joinRoom(room:string, username: string) {
    setUserName(username);
    setRoom(room);
    socket.emit('joinRoom', room, username);
  }

  function votedFor(id:string) {
    socket.emit('voted', room, id, userID)
  }
  
  return (
      <div className={`grid gap-8 p-8 ${roundMode ? 'sm:grid-cols-[25ch_1fr]' : ''} `}>
        { roundMode &&
        <Players players={players} id={userID} />
        }
        <main>
          { roundNumber > 0 &&
            <div className='flex mb-8'>
              <RoundDisplay round={roundNumber} mode={roundMode}/>
              <Countdown timer={timer}/>
            </div>
          }
          <div className='max-w-xl m-auto'>
          {(() => {
            switch (roundMode) {
              case 'enter':
                return <EnterAcro acronym={currentacro} onAcroEntered={acroEntered}/>
              case 'vote':
                return <VoteAcro acros={enteredAcronyms} onVoted={votedFor} id={userID}/>
              case 'results':
                return <Results acros={enteredAcronyms} id={userID}/>
              case 'gameover':
                return <GameOver winner={winner} tie={isTieGame}/>
              case 'wait':
                return <PleaseWait/>
              default:
                return <Login joinRoom={joinRoom} enterError={enterError}/>
            }
          })()}
           </div>
        </main>
      </div>
  )
}

export default App
