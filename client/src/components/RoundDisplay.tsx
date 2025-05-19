function RoundDisplay({ round, category }: { round: number, category: string } ) {
    return (
        <h1 className="text-2xl font-bold grow">Round {round}{ category ? ': ' + category : ''}</h1>
    )
}

export default RoundDisplay