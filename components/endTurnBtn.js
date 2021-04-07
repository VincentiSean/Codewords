import { db } from "../config/Fire";

function EndTurnBtn({ roomInfo }) {

    function endTurn() {
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

        db.ref(`rooms/${roomInfo.roomCode}`).update({
            "currClue": objective,
            "altObjective": objective,
            "currentTurn": nextTeam,
            "clueGiven": 0
        });
    }

    return (
        <button 
            className="end-turn-btn"
            onClick={endTurn}>
                End Turn
            </button>
    );
}

export default EndTurnBtn;
