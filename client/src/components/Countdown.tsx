import { useEffect, useState } from "react";

function Countdown({ timer, round }: { timer: number, round: number }) {
  const [timeRemaining, setTimeRemaining] = useState(timer);

  useEffect(() => {
    setTimeRemaining(timer);
    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime:number) => {
        if (prevTime === 0) {
          clearInterval(timerInterval);
          return 0;
        } else {
          return prevTime - 1000;
        }
      });
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timerInterval);
  }, [timer, round]); 

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeRemaining / timer) * circumference;

  return (
    <div>
      <div className="relative w-15 h-15">
        <svg className="w-full h-full">
          <circle
            className="text-gray-300"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={radius + 10}
            cy={radius + 10}
          />
          <circle
            className="text-blue-600"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={radius + 10}
            cy={radius + 10}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-bold ${timeRemaining < 100000 ? 'text-2xl' : 'text-1xl'}`}>
          {timeRemaining / 1000}
        </div>
      </div>
    </div>
  );
}

export default Countdown;