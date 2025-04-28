function GameOver({ winner, tie }:{ winner: string, tie: boolean}) {
    return (
        <>
        {tie &&
            <h1 className="text-center text-5xl">It's a tie!</h1>
        }
        {!tie && 
            <h1 className="text-center text-5xl">{winner} has won the game!</h1>
        }
        </>
    )
}

export default GameOver