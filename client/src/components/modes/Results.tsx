import { useMemo } from "react"
import { EnteredAcro } from "../../types/Entry";

function Results(props:any) {
    const sortedAcro = useMemo(() => {
        if (props.acros) {
            return props.acros.sort((a:EnteredAcro, b:EnteredAcro) => {
                if (a.votes && b.votes && a.votes < b.votes) {
                    return 1;
                }
                if (a.votes && b.votes && a.votes > b.votes) {
                    return -1;
                }
                return 0;
            });
        }
        return []
    }, [props.acros])

    if (sortedAcro.length) {
        return(
            <>
                <p className="text-xl">Here are the results</p>
                <ul className="list-none">
                    { sortedAcro.map((entry:any) => 
                    <li className={`border-2 p-4 flex gap-2 mb-2 rounded-md ${entry.id === props.id ? 'border-green-500' : 'border-blue-500'}`} key={entry.id}>
                        <span className="w-5 text-right font-bold text-blue-500 dark:text-blue-400">{entry.votes}</span>
                        <span className="flex-auto">{entry.acro}</span>
                    </li>
                    )}
                </ul>
            </>
        )
    } else {
        return (
            <p className="text-center text-xl">No one entered any acronyms!</p>
        )
    }
}

export default Results