import { CurrentVotes, ValueCounts, CurrentEntry, Player } from "../types";

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

export function roundWinner(entries:CurrentEntry[], players:Player[], votecount: ValueCounts):Player {
  if (players.length === 1 || Object.keys(votecount).length === 0) {
    return players[0];
  }
  // TODO what if tie?
  function findKeyWithHighestValue(object: ValueCounts) {
    let highestValue = -Infinity;
    let keyWithHighestValue = null;

    for (const key in object) {
      if (object.hasOwnProperty(key) && typeof object[key] === 'number') {
        if (object[key] > highestValue) {
          highestValue = object[key];
          keyWithHighestValue = key;
        }
      }
    }
    return keyWithHighestValue;
  }
  const winnerID = findKeyWithHighestValue(votecount);
  return players.find(player => player.id === winnerID) || {id:'x',name:'x', score:-1}
}

export function updateScore(players:Player[], votecount:ValueCounts) {
  let updatedplayers = players;
  for (const key in votecount) {
    if (votecount.hasOwnProperty(key)) { // Check if the key is a direct property
      const value = votecount[key];
      const idToUpdate = updatedplayers.find(player => player.id === key);
      if (idToUpdate) {
        idToUpdate.score = idToUpdate.score + value;
      }
    }
  }
  return updatedplayers
}

export function pointsToAcros(acros:CurrentEntry[], votecount:ValueCounts) {
  let updatedacros:CurrentEntry[] = acros.map(player =>({id:player.id, acro:player.acro, votes:0}))
  for (const key in votecount) {
    if (votecount.hasOwnProperty(key)) { // Check if the key is a direct property
      const value = votecount[key];
      const idToUpdate = updatedacros.find(acro => acro.id === key);
      if (idToUpdate) {
        idToUpdate.votes = value;
      }
    }
  }
  return updatedacros;
}