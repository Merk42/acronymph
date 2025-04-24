import { useMemo } from "react"
import { EnteredAcro } from "../../types/Entry";

function Results(props:any) {
    const sortedAcro = useMemo(() => {
        if (props.acros) {
            return props.acros.sort((a:EnteredAcro, b:EnteredAcro) => {
                if (a.votes && b.votes && a.votes < b.votes) {
                    return 1; // a comes before b
                }
                if (a.votes && b.votes && a.votes > b.votes) {
                    return -1;  // a comes after b
                }
                return 0; // a and b are equal
            });
        }
        return []
    }, [props.acros])

    if (sortedAcro.length) {
        return(
            <ul className="list-none">
                { sortedAcro.map((entry:any) => 
                <li className={`border-2 p-4 flex rounded-md ${entry.id === props.id ? 'border-green-500' : 'border-blue-500'}`} key={entry.id}>
                    <span className="w-5 text-right">{entry.votes}</span>
                    <span className="flex-auto">{entry.acro}</span>
                </li>
                )}
            </ul>
        )
    } else {
        return (
            <p className="text-center">No one entered any acronyms!</p>
        )
    }
}

export default Results