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
import { EnteredAcro, VotedAcro } from './types/Entry';
import { NewAcronymData, VoteOnAcronymData, ResultsOfAcronymData, GameoverData } from './types/SocketEvent';
import { PLACEHOLDER_ACRONYM, PLACEHOLDER_ENTRIES, PLACEHOLDER_ID, PLACEHOLDER_PLAYERS } from './placeholders';

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
  const [votedAcronyms, setVotedAcronyms] =  useState<VotedAcro[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<string>('');
  const [isTieGame, setIsTieGame] = useState<boolean>(false);

  const [enterError, setEnterError] = useState<string>("");

  useEffect(() => {
    socket.on('newAcronym', (data:NewAcronymData) => {
      setCurrentacro(data.acronym);
      setRoundNumber(data.round);
      setTimer(data.timer); 
      setRoundMode('enter');
    });

    socket.on('voteOnAcronym', (data:VoteOnAcronymData) => {
      setEnteredAcronyms(data.entries);
      setRoundNumber(data.round);
      setTimer(data.timer);
      setRoundMode('vote')
    });

    socket.on('resultsOfAcronym', (data:ResultsOfAcronymData) => {
      setPlayers(data.players);
      setVotedAcronyms(data.entries);
      setRoundNumber(data.round);
      setTimer(data.timer);
      setRoundMode('results')
    })

    socket.on('gameover', (data:GameoverData) => {
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
    socket.on("enter_room", (id:string, name:string) => {
      if (name === userName) {
        setUserID(id);
        setRoundMode('wait');
        setEnterError("")
      }
    })
  }, [userName])



  useEffect(() => {
    socket.on("players_updated", (players:Player[]) => {
      setPlayers(players)
    })
  }, [])

  useEffect(() => {
    socket.on("join_error", (error:string) => {
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

  function demoMode(mode:MODE) {
    setUserID(PLACEHOLDER_ID);
    setRoundMode(mode);
    setPlayers(PLACEHOLDER_PLAYERS);
    setRoundNumber(5);
    switch (mode) {
      case 'wait':
        
        break;
      case 'enter':
        setCurrentacro(PLACEHOLDER_ACRONYM);
        break;
      case 'vote':
        setVotedAcronyms(PLACEHOLDER_ENTRIES);
        break;
      case 'results':
        setEnteredAcronyms(PLACEHOLDER_ENTRIES);
        break;
      case 'gameover':
        setWinner(PLACEHOLDER_PLAYERS[10].name)
        break;
      default:
        
    }
  }
/*
  useEffect(() => {
    demoMode('wait')
  }, [])
  */
  return (
      <div className={`grid gap-8 ${roundMode ? 'sm:grid-cols-[25ch_1fr]' : ''} `}>
        { roundMode &&
        <Players players={players} id={userID} />
        }
        <main className='p-4'>
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
                return <Results acros={votedAcronyms} id={userID}/>
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
