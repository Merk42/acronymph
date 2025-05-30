import { useMemo } from "react"
import { VotedAcro } from "../../types/Entry";
import Bonuses from "../Bonuses";

interface ResultsProps {
    results: VotedAcro[];
    id: string;
}

function Results({ results, id }: ResultsProps) {
    const sortedAcro = useMemo(() => {
        if (results) {
            return results.sort((a:VotedAcro, b:VotedAcro) => {
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
    }, [results])

    if (sortedAcro.length) {
        return(
            <div className="max-w-xl m-auto">
                <p className="text-xl">Here are the results</p>
                <ul className="list-none">
                    { sortedAcro.map((result:VotedAcro) => 
                    <li className={`relative border-2 p-4 flex gap-2 mt-4 rounded-md ${result.id === id ? 'border-green-500' : 'border-blue-500'}`} key={result.id}>
                        <Bonuses length={result.phrase.split(" ").length} isNonVoter={result.isNonVoter} isFastest={result.isFastest} isWinner={result.isWinner} isWinnerVoter={result.isWinnerVoter}/>
                        <span className="w-5 shrink-0 text-right font-bold text-blue-500 dark:text-blue-400">{result.votes}</span>
                        <span className="flex-auto">{result.phrase}</span>
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