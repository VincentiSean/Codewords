import { useState } from 'react';
import { db } from '../config/Fire';

function SpyClueInputs({ roomInfo, user }) {

    let [clueText, setClueText] = useState("");
    let [chosenNum, setChosenNum] = useState("-");
    let [numDisplay, setNumDisplay] = useState(false);
    let [guessNum, setGuessNum] = useState();

    // Variables that depend on conditions
    let numberPicker = numDisplay && 
        (
            <div className="clue-num-display">
                <button className="num-btn" onClick={() => changeGuesses(0)}>0</button>
                <button className="num-btn" onClick={() => changeGuesses(1)}>1</button>
                <button className="num-btn" onClick={() => changeGuesses(2)}>2</button>
                <button className="num-btn" onClick={() => changeGuesses(3)}>3</button>
                <button className="num-btn" onClick={() => changeGuesses(4)}>4</button>
                <button className="num-btn" onClick={() => changeGuesses(5)}>5</button>
                <button className="num-btn" onClick={() => changeGuesses(6)}>6</button>
                <button className="num-btn" onClick={() => changeGuesses(7)}>7</button>
                <button className="num-btn" onClick={() => changeGuesses(8)}>8</button>
                <button className="num-btn" onClick={() => changeGuesses(9)}>9</button>
                <button className="num-btn" onClick={() => changeGuesses(25)}>∞</button>
            </div>
        );



    function setClue(event) {
        setClueText(event.target.value);
    }

    // Changes what number is displayed to the spymaster when clicking a button and sets the state varaible "guessNum"
    function changeGuesses(val) {
        setGuessNum(val);
        if (val === 25) {
            setChosenNum("∞");
        } else {
            setChosenNum(val);
        }

        setNumDisplay(false);
    }


    function giveClue() {
        if (clueText !== undefined) {
            if (guessNum !== undefined) {
                let newClueArr = [];
                let newGamelogArr = [];
                let currentClue = [clueText + " " + guessNum];
                let altObjective = null;

                // Set the altObective text for the other team
                if (roomInfo.currentTurn === "orange") {
                    altObjective = "Orange team is guessing";
                } else {
                    altObjective = "Blue team is guessing";
                }


                if (roomInfo.clues) {
                    roomInfo.clues.forEach(clue => {
                        newClueArr.push(clue);
                    });
                }
                newClueArr.push(currentClue);

                if (roomInfo.gamelogs) {
                    roomInfo.gamelogs.forEach(text => {
                        newGamelogArr.push(text);
                    });
                }
                newGamelogArr.push([roomInfo.currentTurn, user, ' gives clue ', currentClue.toString()]);
            

                db.ref(`rooms/${roomInfo.roomCode}`).update({
                    "currClue": currentClue,
                    "altObjective": altObjective,
                    "clues": newClueArr,
                    "guesses": guessNum + 1,
                    "clueGiven": true,
                    "gamelogs": newGamelogArr
                });

            }
        }
    }


    return (
        <div className="clue-wrapper">
            <input  
                className="spy-input-text"
                type="text"
                value={clueText}
                onChange={setClue} />

            <button 
                className="choose-num-btn" 
                onClick={() => setNumDisplay(!numDisplay)}>
                {chosenNum}
            </button>

            {numberPicker}

            <button className="clue-enter-btn" onClick={giveClue}>
                Give Clue
            </button>
        </div>
    );
}

export default SpyClueInputs;
