function RoundDisplay({ round, mode }: { round: number, mode: string } ) {
    return (
        <h1 className="text-2xl font-bold grow">Round {round}: {mode}</h1>
    )
}

export default RoundDisplay