import { useEffect, useState } from "react";

function Countdown(props:any) {
    const [timeRemaining, setTimeRemaining] = useState(props.timer);


    useEffect(() => {
      setTimeRemaining(props.timer);
        const timerInterval = setInterval(() => {
          setTimeRemaining((prevTime:number) => {
            if (prevTime === 0) {
              clearInterval(timerInterval);
              // Perform actions when the timer reaches zero
              console.log('Countdown complete!');
              return 0;
            } else {
              return prevTime - 1000;
            }
          });
        }, 1000);
    
        // Cleanup the interval when the component unmounts
        return () => clearInterval(timerInterval);
      }, [props.timer]); 


    return (
        <div className="grow text-right">{timeRemaining / 1000}s</div>
    )
}

export default Countdown;