function GameOver(props:any) {
    return (
        <>
        {props.tie &&
            <h1 className="text-center text-5xl">It's a tie!</h1>
        }
        {!props.tie && 
            <h1 className="text-center text-5xl">{props.winner} has won the game!</h1>
        }
        </>
    )
}

export default GameOver