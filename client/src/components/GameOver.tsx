function GameOver(props:any) {
    return (
        <>
        {props.tie &&
            <h1>It's a tie!</h1>
        }
        {!props.tie && 
            <h1>{props.winner} has won the game!</h1>
        }
        </>
    )
}

export default GameOver