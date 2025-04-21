import { useMemo } from "react"
import { Player } from '../types/Player';

function Players(props:any) {

    const sortedPlayers = useMemo<Player[]>(() => {
        if (props.players) {
            return props.players.sort((a:Player, b:Player) => {
                if (a.score < b.score) {
                  return 1; // a comes before b
                }
                if (a.score > b.score) {
                  return -1;  // a comes after b
                }
                return 0; // a and b are equal
            });
        }
        return []
    }, [props.players])

    return (
        <ol className="players">
            { sortedPlayers.map((player) => 
            <li key={player.id}>
                <span>{player.name}</span>
                <span>{player.score}</span>
            </li>
            )}
        </ol>
    )
}

export default Players