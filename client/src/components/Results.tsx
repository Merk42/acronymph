import { useMemo } from "react"

function Results(props:any) {

    const shuffled = useMemo(() => {
        let array = props.acros;
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },[props.acros])

    return(
        <ul>
            { shuffled.map((entry:any) => 
            <li key={entry.id}><button>{entry.acro}</button></li>
            )}
        </ul>
    )
}

export default Results