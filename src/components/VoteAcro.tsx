function VoteAcro() {

    const DEMO = [
        'central intelligence agency',
        'culinary institute-of america'
    ]

    return(
        <ul>
            { DEMO.map((entry) => 
            <li><button>{entry}</button></li>
            )}
        </ul>
    )
}

export default VoteAcro