import { useMemo, useRef, useState } from "react";

function EnterAcro(props:any) {
    const [isEntered, setIsEntered] = useState(false);

    const inputRef = useRef(null);
    const [phrase, setPhrase] = useState('');

    const isValid = useMemo<boolean>(() => {
        if (phrase.toLowerCase().split(" ").length !== props.ACRONYM.length) {
            return false;
        }
        const WORDS = phrase.toLowerCase().split(" ");
        for (let i = 0; i < WORDS.length; i++) {
            if (WORDS[i].slice(0, 1) !== props.ACRONYM[i]) {
                return false;
            }
        }
        return true
    }, [phrase, props.ACRONYM]);


    const phraseArray = useMemo<string[]>(() => {
        return phrase.split(' ');
    }, [phrase])

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        setIsEntered(true);
        props.onAcroEntered(phrase)
    };

    return (
        <div>  
            <p className="text-center uppercase text-7xl font-bold">
            {props.ACRONYM.join("")}
            </p>
            { isEntered === false && 
                <div className="flex mt-16">
                    <input
                        className="rounded-tl-lg rounded-bl-lg text-2xl outline-1 -outline-offset-1 outline-gray-300 block min-w-0 grow py-1.5 px-3 text-gray-900 placeholder:text-gray-400"
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
                <p className="flex justify-center gap-2 mt-16 text-2xl">
                    { phraseArray.map((word:string) => 
                        <p className="first-letter:font-bold first-letter:uppercase first-letter:text-3xl">{word}</p>
                    )}
                </p>
            }
        </div>
    )
}

export default EnterAcro