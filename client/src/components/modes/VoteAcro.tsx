import { useEffect, useMemo, useState } from "react"
import { EnteredAcro } from "../../types/Entry";

interface VoteAcroProps {
    entries: EnteredAcro[];
    onVoted: Function;
    id: string;
}

function VoteAcro({ entries, onVoted, id }: VoteAcroProps) {
    const [selectedValue, setSelectedValue] = useState<string>('');
    const voteFor = (entry:string) => {
        setSelectedValue(entry);
        onVoted(entry);
    }

    const shuffled = useMemo(() => {
        let array = entries;
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },[entries]);

    useEffect(() => {
        setSelectedValue('');
    }, [entries]);

    if (shuffled.length) {
        return(
            <fieldset className="max-w-xl m-auto">
                <legend className="text-xl">Vote for your favorite</legend>
                { shuffled.map((entry:EnteredAcro) => 
                <div key={entry.id} className="mt-4">
                    <input
                        type="radio"
                        className="hidden peer"
                        name="votefor"
                        id={entry.id}
                        value={entry.id}
                        disabled={entry.id === id}
                        checked={selectedValue === entry.id}
                        onChange={() => {voteFor(entry.id)}}/>
                    <label
                        htmlFor={entry.id}
                        className="cursor-pointer border-blue-500 border-2 p-4 block rounded-md peer-checked:bg-blue-500 peer-checked:text-white peer-disabled:bg-gray-300 peer-disabled:border-gray-500 peer-disabled:cursor-not-allowed dark:peer-disabled:bg-gray-600">
                            {entry.phrase}
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