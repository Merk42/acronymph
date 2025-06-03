export type Acronym = string[];

export interface Rooms {
  [key: string]: Room;
}

export interface CurrentEntry {
  id: string;
  phrase: string;
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
  hasCategories: boolean;
  current: {
    acronym: Acronym,
    round: number,
    entries: CurrentEntry[],
    votes: CurrentVotes,
    category: string;
  },
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
  strikes: number;
}

export interface Socket {
  on: Function;
  id: string;
  join: Function;
}