import { CurrentEntry, CurrentResult, CurrentVotes, Player , ValueCounts } from "../types";

export function countValues(obj:CurrentVotes):ValueCounts {
  const valueCounts:ValueCounts = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    }
  }
  return valueCounts;
}

export function roundWinner(players:Player[], breakdown:CurrentResult[]):Player {
  const IS_WINNER = breakdown.find(result => result.isWinner === true);
  
  if (IS_WINNER) {
    const WINNER = players.find(player => player.id === IS_WINNER.id);
    if (WINNER) {
      return WINNER
    }
  }
  return {id:'x',name:'x', score:-1}
}

export function updateScore(players:Player[], breakdown:CurrentResult[]) {
  let updatedplayers = players;
  for (const entry of breakdown) {
    const NON_VOTER_BONUS:number = entry.isNonVoter ? 0 : 1;
    const IS_FASTEST_BONUS:number = entry.isNonVoter ? 1 : 0;
    const IS_WINNER_BONUS:number = entry.isWinner ? 1 : 0;
    const IS_WINNER_VOTER_BONUS:number = entry.isWinnerVoter ? 1 : 0;
    const MORE_POINTS = (entry.votes + IS_FASTEST_BONUS + IS_WINNER_BONUS + IS_WINNER_VOTER_BONUS) * NON_VOTER_BONUS;
    const PLAYER = updatedplayers.find(player => player.id === entry.id);
    if (PLAYER) {
      PLAYER.score += MORE_POINTS;
    }
  }
  return updatedplayers
}

export function pointsToAcros(acros:CurrentEntry[], currentVotes:CurrentVotes, lightning:boolean = false):CurrentResult[]  {
  const VOTE_COUNT = countValues(currentVotes);
  let updatedacros:CurrentResult[] = acros.map(entry =>({
    id:entry.id,
    acro:entry.acro,
    votes:0,
    isNonVoter: false,
    isFastest: false,
    isWinner: false,
    isWinnerVoter: false
  }))
  for (const key in VOTE_COUNT) {
    if (VOTE_COUNT.hasOwnProperty(key)) { // Check if the key is a direct property
      const value = VOTE_COUNT[key];
      const idToUpdate = updatedacros.find(acro => acro.id === key);
      if (idToUpdate) {
        idToUpdate.votes = value;
      }
    }
  }
  if (lightning) {
    return updatedacros;
  } 
  const VOTER_IDS = Object.keys(currentVotes);
  const NONVOTERS = updatedacros.filter(player => 
    !VOTER_IDS.includes(player.id)
  );
  const FLAGGED_NONVOTERS = NONVOTERS.map(player => ({
    ...player,
    isNonVoter: true
  }));

  const VOTERS = updatedacros.filter(player => 
    VOTER_IDS.includes(player.id)
  );
  const FASTEST = VOTERS[0];
  FASTEST.isFastest = true;

  const VOTE_SORTED = [...VOTERS];
  VOTE_SORTED.sort((a:CurrentResult, b:CurrentResult) => {
    if (a.votes < b.votes) {
      return 1;
    }
    if (a.votes > b.votes) {
      return -1;
    }
    return 0;
  });
  // TODO what if tie in number of votes?
  const WINNER_ID = VOTE_SORTED[0].id;
  const WINNER = VOTERS.find(acro => acro.id === WINNER_ID);
  if (WINNER) {
    WINNER.isWinner = true;
  }
  return [...VOTERS, ...FLAGGED_NONVOTERS];
}