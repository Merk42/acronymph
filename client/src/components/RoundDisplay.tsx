function RoundDisplay({ round, category }: { round: number, category: string } ) {
    const displayCopy = () => {
        if (round >= 99) {
            return 'lightning round'
        }
        if (category) {
            return `round ${round}: ${category}`
        }
        return `round ${round}`
    }
    return (
        <h1 className="text-2xl font-bold grow capitalize">{displayCopy()}</h1>
    )
}

export default RoundDisplay