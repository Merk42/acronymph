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
            <li key={entry.id}>
                <input
                    type="radio"
                    name="votefor"
                    id={entry.id}
                    value={entry.id}
                    disabled={entry.id === props.id}
                    onChange={() => {voteFor(entry.id)}}/>
                <label htmlFor={entry.id}>{entry.acro}</label>
            </li>
            )}
        </ul>
    )
}

export default VoteAcro