import { EnteredAcro, VotedAcro } from "./Entry";
import { Player } from "./Player";

export interface NewAcronymData {
    acronym: string[];
    round: number;
    timer: number;
    category?: string;
}

export interface VoteOnAcronymData {
    entries: EnteredAcro[];
    round:number;
    timer:number
}

export interface ResultsOfAcronymData {
    players: Player[];
    entries: VotedAcro[];
    round: number;
    timer: number;
}

export interface ChoosingCategoryData {
    winner: string;
    round: number;
    timer: number;
}

export interface ChooseCategoryData {
    categories: string[];
    round: number;
    timer: number;
}

export interface GameoverData {
    winner: string;
    tie: boolean;
    timer: number;
}