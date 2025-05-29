export type Acronym = string[];

export interface Rooms {
  [key: string]: Room;
}

export interface CurrentEntry {
  id: string;
  acro: string;
}

export interface CurrentResult extends CurrentEntry {
  votes: number;
  isNonVoter: boolean;
  isFastest: boolean;
  isWinner: boolean;
  isWinnerVoter: boolean;
  index: number;
}

export interface CurrentVotes {
  [key: string]: string;
}

export interface ValueCounts {
  [key: string]: number;
}

export interface Room {
  players: Player[],
  modeTimeout: any,
  currentAcronym: Acronym,
  currentRound: number,
  currentEntries: CurrentEntry[],
  currentVotes: CurrentVotes,
  currentCategory: string;
  hasCategories: boolean;
  lightning: {
    acronyms: Acronym[],
    round: number,
    entries: CurrentEntry[][]
    votes: CurrentVotes[];
  }
}

export interface Player {
  name: string;
  id: string;
  score: number;
}

export interface Socket {
  on: Function;
  id: string;
  join: Function;
}