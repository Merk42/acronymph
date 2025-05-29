
function Instructions() {
    return (
        <div className="max-w-2xl m-auto mt-4">
            <h1 className="text-2xl">How to play</h1>
            <h2 className="text-xl mt-2">Gameplay</h2>
            <ul className="list-decimal px-4">
                <li className="text-pretty">All players are given the same random letters (e.g. AIF)</li>
                <li className="text-pretty">Each player submits their entry (e.g. Acronymph Is Fun)</li>
                <li className="text-pretty">Each player then votes on their favorite</li>
                <li className="text-pretty">If there are categories, the winner chooses a category from a random list</li>
                <li className="text-pretty">After 10 rounds, the top two players enter the lightning round, where they submit entries for 3 sets of letters, all other players vote</li>
            </ul>
            <h2 className="text-xl mt-2">Scoring</h2>
            <ul className="list-disc px-4">
                <li className="text-pretty">Each vote is one point</li>
                <li className="text-pretty">The acronym with the most votes earns bonus points equal to the length of the inital letters</li>
                <li className="text-pretty">The fastest acronym, with at least one vote, earns one bonus point</li>
                <li className="text-pretty">Players who voted for the winning acronym earn one bonus point </li>
                <li className="text-pretty">Players that do not vote, do not earn any points</li>
            </ul>
        </div>
    )
}

export default Instructions
