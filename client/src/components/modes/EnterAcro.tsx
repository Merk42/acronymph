import { useMemo, useRef, useState } from "react";

function EnterAcro({acronym, onAcroEntered}:{acronym:string[]; onAcroEntered: Function}) {
    const [isEntered, setIsEntered] = useState(false);

    const inputRef = useRef(null);
    const [phrase, setPhrase] = useState('');

    const isValid = useMemo<boolean>(() => {
        if (phrase.toLowerCase().split(" ").length !== acronym.length) {
            return false;
        }
        const WORDS = phrase.toLowerCase().split(" ");
        for (let i = 0; i < WORDS.length; i++) {
            if (WORDS[i].slice(0, 1) !== acronym[i]) {
                return false;
            }
        }
        return true
    }, [phrase, acronym]);


    const phraseArray = useMemo<string[]>(() => {
        return phrase.split(' ');
    }, [phrase])

    const handleClick = () => {
        setIsEntered(true);
        onAcroEntered(phrase)
    };

    return (
        <div>  
            <p className="text-center uppercase text-7xl font-bold">
            {acronym.join("")}
            </p>
            { isEntered === false && 
                <div className="max-w-xl m-auto flex mt-16">
                    <input
                        className="rounded-tl-lg rounded-bl-lg sm:text-2xl outline-1 -outline-offset-1 outline-gray-300 block min-w-0 grow py-1.5 px-3 text-gray-900 dark:text-white placeholder:text-gray-400"
                        type="text"
                        value={phrase}
                        onChange={e => setPhrase(e.target.value)}
                        ref={inputRef}/>
                    <button
                        className="px-4 py-8 bg-blue-500 text-white rounded-tr-lg rounded-br-lg cursor-pointer"
                        disabled={!isValid}
                        onClick={handleClick}>submit</button>
                </div>
            }
            { isEntered === true && 
                <p className="flex flex-wrap justify-center overflow-x-auto gap-2 mt-16 text-2xl">
                    { phraseArray.map((word:string) => 
                        <p className="first-letter:font-bold first-letter:uppercase first-letter:text-3xl">{word}</p>
                    )}
                </p>
            }
        </div>
    )
}

export default EnterAcro