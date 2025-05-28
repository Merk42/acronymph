
function Instructions() {
    return (
        <div className="max-w-5xl m-auto mt-4">
            <h1 className="text-2xl">How to play</h1>
            <ul>
                <li className="text-pretty">All players are given the same random letters (e.g. AIF)</li>
                <li className="text-pretty">Each player submits their entry (e.g. Acronymph Is Fun)</li>
                <li className="text-pretty">Each player then votes on their favorite </li>
                <li className="text-pretty">If there are categories, the winner chooses a category from a random list</li>
                <li className="text-pretty">After 10 rounds, the top two players enter the lightning round, where they submit entries for 3 sets of letters, all other players vote</li>
            </ul>
        </div>
    )
}

export default Instructions
