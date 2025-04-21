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

    const handleClick = () => {
        console.log('submit click?');
        // TODO put value somewhere!;
        // setPhrase("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
        setIsEntered(true);
        props.onAcroEntered(phrase)
    };

    return (
        <div>  
            <p style={{textTransform: 'uppercase', fontSize: '4rem'}}>
            {props.ACRONYM.join("")}
            </p>
            { isEntered === false && 
                <div>
                    <input type="text" value={phrase} onChange={e => setPhrase(e.target.value)} ref={inputRef}/>
                    <button disabled={!isValid} onClick={handleClick}>submit</button>
                </div>
            }
        </div>
    )
}

export default EnterAcro