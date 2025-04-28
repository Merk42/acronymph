import { useEffect, useState } from "react";

function Countdown({ timer }: { timer: number }) {
    const [timeRemaining, setTimeRemaining] = useState(timer);

    useEffect(() => {
      setTimeRemaining(timer);
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
    }, [timer]); 

    return (
      <div className="grow text-right text-xl">{timeRemaining / 1000}</div>
    )
}

export default Countdown;