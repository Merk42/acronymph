import { useMemo } from "react"

function Results(props:any) {
    const sortedAcro = useMemo(() => {
        if (props.acros) {
            return props.acros.sort((a, b) => {
                if (a.votes < b.votes) {
                    return 1; // a comes before b
                }
                if (a.votes > b.votes) {
                    return -1;  // a comes after b
                }
                return 0; // a and b are equal
            });
        }
        return []
    }, [props.acros])

    return(
        <ul className="list-none">
            { sortedAcro.map((entry:any) => 
            <li className="ml-3 mb-1 flex gap-4" key={entry.id}>
                <span className="w-5 text-right">{entry.votes}</span>
                <span className="flex-auto">{entry.acro}</span>
            </li>
            )}
        </ul>
    )
}

export default Results