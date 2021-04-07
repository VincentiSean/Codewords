import { useEffect } from 'react';

function Gamelog({ roomInfo }) {

    useEffect(() => {
        
    }, [roomInfo])


    
    return (
        <div className="gamelog-wrapper">
            <h3 className="gamelog-title">Game log</h3>
            {roomInfo.gamelogs !== undefined
                ?   (<div className="logs-wrapper">
                        {roomInfo.gamelogs.map((clue, index) => {
                            return(<div className={`clue-wrapper ${clue[0]}-clue`}>
                                    <p className="clue">
                                        <span className={`${clue[0]}-bold`}>{clue[1]}</span>
                                        {clue[2]}
                                        <span className="actual-clue-txt">{clue[3]}</span>
                                    </p>
                                </div>);
                        })}
                    </div>)
                :   <></>
            }
            
        </div>
    );
}

export default Gamelog;
