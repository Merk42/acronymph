import { Player } from "../types";

export function finalists(players: Player[]):Player[] {
    const SORTED = players.sort((a:Player, b:Player) => {
        if (a.score < b.score) {
            return 1; // a comes before b
        }
        if (a.score > b.score) {
            return -1;  // a comes after b
        }
        return 0; // a and b are equal
    });
    return [SORTED[0], SORTED[1]]
}