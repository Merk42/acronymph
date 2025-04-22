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
        <ul>
            { sortedAcro.map((entry:any) => 
            <li key={entry.id}>{entry.acro} - {entry.votes}</li>
            )}
        </ul>
    )
}

export default Results