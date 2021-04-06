import OpCard from './opCard';

function UserGameBoard({ 
        changeScore, 
        currTurn,
        roomInfo
    }) {
    
        
    return (
        <div className="gameboard-wrapper">
            {roomInfo.words.map((word, index) => {
                return <OpCard
                            key={index}
                            cardNum={index}
                            word={word}
                            roomCode={roomInfo.roomCode}
                            solution={roomInfo.boardSolution[index]}
                            gameEffect={change => changeScore(change)}
                            isCurrTurn={currTurn} 
                            roomInfo={roomInfo} />;
            })}
        </div>
    );
}

export default UserGameBoard;