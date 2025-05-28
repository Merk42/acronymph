interface BonusesProps {
    isNonVoter: boolean;
    isFastest: boolean;
    isWinner: boolean;
    isWinnerVoter: boolean;
}

function Bonuses({ isNonVoter, isFastest, isWinner, isWinnerVoter}: BonusesProps) {
    return (
        <div className="absolute -top-2 -left-2">
            { isNonVoter === true && 
                <span className="p-1 rounded-md bg-red-400">Did not vote *0</span>
            }
            { isFastest === true && 
                <span className="p-1 rounded-md bg-amber-400">Fastest +1</span>
            }
            { isWinner === true && 
                <span className="p-1 rounded-md bg-emerald-400">Winner +1</span>
            }
            { isWinnerVoter === true && 
                <span className="p-1 rounded-md bg-cyan-400">Voted for Winner +1</span>
            }
        </div>
    )
}

export default Bonuses