import { Acronym } from "../types";

export function acronymForRound(round:number):Acronym{
    const ACROLENGTH = acroLengthFromRound(round);
    return generateAcro(ACROLENGTH);
}

function acroLengthFromRound(round:number):number{
  const NEWLENGTH = ((round-1) % 5) + 3;
  return NEWLENGTH;
}

function getRandomLetter():string {
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
  
export function generateAcro(length = 3):Acronym {
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