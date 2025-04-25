export interface Rooms {
    [key:string]: Room
}

export interface Room {
    players: Player[],
    modeTimeout: any;
    currentAcronym: string[];
    currentRound: number;
    currentEntries: string[];
    currentVotes: any;
}

export interface Player {
    id: string;
    name: string;
    score: number;
}