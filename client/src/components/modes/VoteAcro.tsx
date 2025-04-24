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

    if (shuffled.length) {
        return(
            <ul className="list-none">
                { shuffled.map((entry:any) => 
                <li key={entry.id}>
                    <label className="ml-3 flex gap-4">
                        <input
                            type="radio"
                            className="checked:bg-blue-400 checked:hover:bg-blue-400 checked:active:bg-blue-400 checked:focus:bg-blue-400 focus:bg-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            name="votefor"
                            id={entry.id}
                            value={entry.id}
                            disabled={entry.id === props.id}
                            onChange={() => {voteFor(entry.id)}}/>
                        <span className="flex-auto">{entry.acro}</span>
                    </label>
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

export default VoteAcro