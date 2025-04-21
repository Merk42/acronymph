import { useMemo } from "react"

function VoteAcro(props:any) {

    const voteFor = (entry:string) => {
        props.onVoted(entry);
    }

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
            <li key={entry.id}><button onClick={() => {voteFor(entry.id)}}>{entry.acro}</button></li>
            )}
        </ul>
    )
}

export default VoteAcro