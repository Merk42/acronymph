import { useEffect, useState } from 'react';
import './App.css'

import Gameplay from './components/Gameplay'

function getRandomLetter() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const randomIndex = Math.floor(Math.random() * alphabet.length);
  return alphabet[randomIndex];
}

function generateAcro(length = 3):string[] {
  const ACRO:string[] = [];
  for (let i = 0; i < length; i++) {
    ACRO.push(getRandomLetter())
  }
  // TODO make sure result isn't some 'bad word';
  return ACRO
}

function App() {

  const [currentacro, setCurrentacro] = useState([" "]);
  const [roundNumber, setRoundNumber] = useState(0);

  useEffect(() => {
    const ACROLENGTH = acroLengthFromRound(roundNumber);
    setCurrentacro(generateAcro(ACROLENGTH))
  }, [roundNumber]);

  function acroLengthFromRound(round:number):number{
    const NEWLENGTH = ((round-1) % 5) + 3;
    return NEWLENGTH;
  } 

  function startRound() {
    setRoundNumber(roundNumber+1);
  }
  
// round()

  return (
    <>
      {roundNumber > 0 &&
      <>
        <h1>Round {roundNumber}</h1>
        <Gameplay
          onNewRound={startRound}
          ACRONYM={currentacro}/>
        </>
      }
      { roundNumber === 0 &&
        <button onClick={() => startRound()}>start</button>
      }
    </>
  )
}

export default App
