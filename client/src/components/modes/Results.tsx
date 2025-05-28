import { useMemo } from "react"
import { VotedAcro } from "../../types/Entry";
import Bonuses from "../Bonuses";

interface ResultsProps {
    acros: VotedAcro[];
    id: string;
}

function Results({ acros, id }: ResultsProps) {
    const sortedAcro = useMemo(() => {
        if (acros) {
            return acros.sort((a:VotedAcro, b:VotedAcro) => {
                if (a.votes < b.votes) {
                    return 1;
                }
                if (a.votes > b.votes) {
                    return -1;
                }
                return 0;
            });
        }
        return []
    }, [acros])

    if (sortedAcro.length) {
        return(
            <div className="max-w-xl m-auto">
                <p className="text-xl">Here are the results</p>
                <ul className="list-none">
                    { sortedAcro.map((entry:any) => 
                    <li className={`relative border-2 p-4 flex gap-2 mt-4 rounded-md ${entry.id === id ? 'border-green-500' : 'border-blue-500'}`} key={entry.id}>
                        <Bonuses isNonVoter={entry.isNonVoter} isFastest={entry.isFastest} isWinner={entry.isWinner} isWinnerVoter={entry.isWinnerVoter}/>
                        <span className="w-5 shrink-0 text-right font-bold text-blue-500 dark:text-blue-400">{entry.votes}</span>
                        <span className="flex-auto">{entry.acro}</span>
                    </li>
                    )}
                </ul>
            </div>
        )
    } else {
        return (
            <p className="text-center text-xl">No one entered any acronyms!</p>
        )
    }
}

export default Results