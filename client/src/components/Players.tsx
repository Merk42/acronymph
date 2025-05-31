import { useMemo } from "react"
import { Player } from '../types/Player';

interface PlayersProps {
    players: Player[];
    id: string;
    onForceNewGame: Function;
}

function Players({players, id, onForceNewGame}:PlayersProps) {

    const sortedPlayers = useMemo<Player[]>(() => {
        if (players) {
            let sorted = [...players];
            return sorted.sort((a:Player, b:Player) => {
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

    const handleClick = () => {
        onForceNewGame()
    };

    function PlayerContent({ player}:{player:Player}) {   
        if (players.length && id === players[0].id && player.id === id) {
            return (
                <>             
                    <button className="text-left" onClick={handleClick}>{player.name} &#8902;</button>
                    <span className="text-right">{player.score}</span>
                </>
            )
        }
        return (
            <>             
                <span>{player.name}</span>
                <span className="text-right">{player.score}</span>
            </>
        )
    }

    return (
        <div className="overflow-auto bg-gray-100 dark:bg-gray-800">
            <ol className="flex sm:grid grid-cols-[1fr_3ch] m-0 gap-x-3 sm:gap-x-1 gap-y-2 p-4">
                { sortedPlayers.map((player) => 
                <li className={`whitespace-nowrap flex sm:contents gap-1 sm:gap-4 ${player.id === id ? 'font-bold text-blue-500 dark:text-blue-400' : ''} `} key={player.id}>
                    <PlayerContent player={player}/>
                </li>
                )}
            </ol>
        </div>
    )
}

export default Players