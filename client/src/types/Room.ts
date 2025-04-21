export interface Rooms {
    [key:string]: Room
}

export interface Room {
    players: Player[],
    currentQuestion: any;
    correctAnswer: any;
    questionTimeout: number;
    shouldSendNewAcronym: boolean;
    currentAcronym: string[];
    currentRound: number;
    currentAcros: string[];
    currentVotes: any;
}

export interface Player {
    id: string;
    name: string;
    score: number;
}