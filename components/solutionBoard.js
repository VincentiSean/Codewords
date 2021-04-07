import { useEffect } from 'react';
import Card from './card';

function SolutionBoard({ roomInfo }) {

    useEffect(() => {}, [roomInfo.words]);

    return (
        <div className="gameboard-wrapper">
            {roomInfo.words.map((word, index) => {
                return <Card
                            flipped={roomInfo.boardSolution[1]}
                            key={index}
                            word={word}
                            color={roomInfo.boardSolution[index][0]} />
            })}
        </div>
    );
}

export default SolutionBoard;