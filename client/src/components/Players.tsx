import { useMemo } from "react"
import { Player } from '../types/Player';

interface PlayersProps {
    players: Player[];
    id: string;
}

function Players({players, id}:PlayersProps) {

    const sortedPlayers = useMemo<Player[]>(() => {
        if (players) {
            return players.sort((a:Player, b:Player) => {
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
    }, [players])

    return (
        <div>
            <ol className="flex sm:grid grid-cols-[1fr_3ch] m-0 p-0 gap-2 overflow-auto">
                { sortedPlayers.map((player) => 
                <li className={`flex sm:contents gap-4 ${player.id === id ? 'font-bold text-blue-500 dark:text-blue-400' : ''} `} key={player.id}>
                    <span>{player.name}</span>
                    <span className="text-right">{player.score}</span>
                </li>
                )}
            </ol>
        </div>
    )
}

export default Players