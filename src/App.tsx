import { useEffect, useState } from 'react';
import './App.css'

import EnterAcro from './components/EnterAcro';
import VoteAcro from './components/VoteAcro';

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
  const [roundMode, setRoundMode] = useState(''); // or vote, or stuff for lightning round?

  useEffect(() => {
    const ACROLENGTH = acroLengthFromRound(roundNumber);
    setCurrentacro(generateAcro(ACROLENGTH))
  }, [roundNumber]);

  function acroLengthFromRound(round:number):number{
    const NEWLENGTH = ((round-1) % 5) + 3;
    return NEWLENGTH;
  } 

  function startRound() {
    setRoundMode('enter');
    setRoundNumber(roundNumber+1);
  }
  
// round()

  switch (roundMode) {
    case "enter":
      return (
        <EnterAcro
          onNewRound={startRound}
          ACRONYM={currentacro}/>
      )
    case "vote":
      return (
        <VoteAcro/>
      )
    default:
      return (
        <button onClick={() => startRound()}>start</button>
      )
    }
}

export default App
