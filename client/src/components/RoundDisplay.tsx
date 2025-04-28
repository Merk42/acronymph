function RoundDisplay({ round, mode }: { round: number, mode: string } ) {
    return (
        <h1 className="text-xl">Round {round}: {mode}</h1>
    )
}

export default RoundDisplay