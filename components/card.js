import { useEffect } from 'react';

function Card({ word, color, flipped }) {
    useEffect(() => {}, [word]);

    return (
        <div className={"card " + color}>
            {flipped !== 1 && <p className="card-txt">{word}</p>}
        </div>
    );
}

export default Card;



// things to do
// display number of words left for each team
// determine winner
// make pretty/responsive
// gamelog
