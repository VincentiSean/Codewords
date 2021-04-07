import { useState, useEffect } from 'react';
import { db } from '../config/Fire';

function OpCard({
    cardNum,
    roomCode,
    word,
    solution,
    gameEffect,
    isCurrTurn,
    roomInfo
}) {

    let [divClass, setDivClass] = useState("card op-card");
    let [notFlipped, setNotFlipped] = useState(true);
    let [destroyed, setDestroyed] = useState(false);

    useEffect(() => {
        if (!destroyed) {
            if (solution[1] === 1) {
                setDivClass(`card op-card op-${solution[0]}`);
                setNotFlipped(false);

                decreaseTeam(solution[0]);
                if (!(solution[0] === roomInfo.currentTurn)) {
                    endTurn();
                } 
                setDestroyed(true);
            }

            if (roomInfo.guesses === 0) {
                endTurn();
            }
        }
    }, [solution[1], isCurrTurn])


    function cardFlip(index) {
        db.ref(`rooms/${roomCode}/boardSolution/`).child(index).set(
            [solution[0], 1]
        );

        db.ref(`rooms/${roomCode}`).update({
            "guesses": roomInfo.guesses - 1
        });
    }

    function endTurn() {
        console.log("end turn");
        let nextTeam = null;
        let objective = null;

        // Change whose turn it is and current objective
        if (roomInfo.currentTurn === "orange") {
            nextTeam = "blue";
            objective = "Blue spymaster is thinking...";
        } else {
            nextTeam = "orange";
            objective = "Orange spymaster is thinking...";
        }

        db.ref(`rooms/${roomCode}`).update({
            "currClue": objective,
            "altObjective": objective,
            "currentTurn": nextTeam,
            "clueGiven": false,
            "guesses": 100
        });
    }

    function decreaseTeam(teamName) {
        if (teamName === "orange") {
            db.ref(`rooms/${roomInfo.roomCode}/orange`).set({
                "wordsLeft": roomInfo.orange.wordsLeft - 1,
                "spymasters": roomInfo.orange.spymasters,
                "operatives": roomInfo.orange.operatives
            });
        } else if (teamName === "blue") {
            db.ref(`rooms/${roomInfo.roomCode}/blue`).set({
                "wordsLeft": roomInfo.blue.wordsLeft - 1,
                "spymasters": roomInfo.blue.spymasters,
                "operatives": roomInfo.blue.operatives
            });
        }
        
    }

    
    
    return (
        <div className={divClass}>
            {isCurrTurn && notFlipped && roomInfo.clueGiven !== false
                ?   <button className="flip-btn" onClick={() => cardFlip(cardNum)}>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="flip-icon icon icon-tabler icon-tabler-rotate-clockwise-2" 
                            width="44" 
                            height="44" 
                            viewBox="0 0 24 24" 
                            strokeWidth="2" 
                            stroke="currentColor" 
                            fill="none" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M9 3.55a8 8 0 0 1 6 16.9m0 -4.45v5h5" />
                        </svg>
                    </button>
                :   <></>
            }
            {notFlipped
                ?   <p className="card-txt">{word}</p>
                :   <></>
            }
        </div>
    );
}

export default OpCard;
