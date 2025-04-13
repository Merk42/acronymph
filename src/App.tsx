import { useState } from 'react';
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
  function startRound() {
    
    
    const ACROLENGTH = (roundNumber+1 % 5) + 3;
    
    setCurrentacro(generateAcro(ACROLENGTH))

    setRoundNumber(roundNumber+1);

    console.log("ROUND", roundNumber);
    console.log("LENGTH", ACROLENGTH);
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
