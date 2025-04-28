import { useMemo } from "react"
import { EnteredAcro } from "../../types/Entry";

interface VoteAcroProps {
    acros: EnteredAcro[];
    onVoted: Function;
    id: string;
}

function VoteAcro({ acros, onVoted, id }: VoteAcroProps) {

    const voteFor = (entry:string) => {
        onVoted(entry);
    }

    const shuffled = useMemo(() => {
        let array = acros;
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },[acros])

    if (shuffled.length) {
        return(
            <fieldset>
                <legend className="text-xl">Vote for your favorite</legend>
                { shuffled.map((entry:any) => 
                <div key={entry.id} className="mt-4">
                    <input
                        type="radio"
                        className="hidden peer"
                        name="votefor"
                        id={entry.id}
                        value={entry.id}
                        disabled={entry.id === id}
                        onChange={() => {voteFor(entry.id)}}/>
                    <label
                        htmlFor={entry.id}
                        className="cursor-pointer border-blue-500 border-2 p-4 block rounded-md peer-checked:bg-blue-500 peer-checked:text-white peer-disabled:bg-gray-300 peer-disabled:border-gray-500 peer-disabled:cursor-not-allowed dark:peer-disabled:bg-gray-600">
                            {entry.acro}
                    </label>
                </div>
                )}
            </fieldset>
        )
    } else {
        return (
            <p className="text-center text-xl">No one entered any acronyms!</p>
        )
    }
}

export default VoteAcro