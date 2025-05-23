function RoundDisplay({ round, category }: { round: number, category: string } ) {
    const displayCopy = () => {
        if (round >= 99) {
            return 'lightning'
        }
        if (category) {
            return `Round ${round}: ${category}`
        }
        return `Round ${round}`
    }
    return (
        <h1 className="text-2xl font-bold grow">{displayCopy()}</h1>
    )
}

export default RoundDisplay