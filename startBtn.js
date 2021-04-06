import { useEffect } from 'react';
import { db } from '../config/Fire';

function StartBtn({ gameBoard, gameIsStarting, roomCode }) {

    let roomQuery = `rooms/${roomCode}`;

    // This function prepares all of the necessary information for the game to begin
    function startGame() {
        
        // Get random words from the db
        getWords("regular");

        // Generate which spots are orange/blue/kill
        let isOrangeTurn = whoStarts();
        generateGrid(isOrangeTurn);
    }


    // Generates a random num (0 or 1): 1 === blue start && 0 === orange start
    function whoStarts() {
        let coinFlip = Math.floor(Math.random() * 2);
        let startColor = null;
        let teamBool = null;

        if (coinFlip === 1) {
            startColor = "blue";
            teamBool = false;
        } else {
            startColor = "orange";
            teamBool = true;
        }

        db.ref(roomQuery).update({
            "currentTurn": startColor
        });

        return teamBool;
    }


    // Calls on the appropriate db word list and gets 25 random words from it
    // Set db to gameStarted
    function getWords(wordsType) {
        
        db.ref(`words/${wordsType}`).once("value", (snapshot) => {
            let fullWordArray = snapshot.val();     // Get all of the words from the list
            let arraySize = fullWordArray.length;

            fullWordArray = randomize(fullWordArray, arraySize);    // Returned word list is shuffled

            let numToDel = arraySize - 25;
            let splicedWords = fullWordArray.splice(numToDel, 25);

            db.ref(roomQuery).update({
                "gameStarted": true,
                "words": splicedWords
            });
        });
    }


    // Uses Fisher-Yates shuffle to shuffle the word array
    function randomize(array, length) {

        // Go through entire array and shuffle the current index with a random one
        for (let i = length - 1; i > 0; i--) {
            let j = randIntInRange(i);    // Pick a random index from 0 to i
            array = swap(array, i , j); // Swap array[i] with the random index
        }

        return array;
    }


    // Returns a random number between 0 and 'max'
    function randIntInRange(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    // Swaps two array indices
    function swap(array, indexOne, indexTwo) {
        
        let temp = array[indexOne];
        array[indexOne] = array[indexTwo];
        array[indexTwo] = temp;

        return array;
    }


    // Generate which spots on the grid are orange/blue/kill/empty
    function generateGrid(firstTurn) {

        let blues;
        let oranges;
        let empties = 7;
        let kill = 6;
        let gameboard = [];
        let start = "";
        
        // If firstTurn is true; orange goes first/has one more word
        if (firstTurn) {
            blues = 8;
            oranges = 9;
            start = "Orange";
        } else {
            blues = 9;
            oranges = 8;
            start = "Blue";
        }

        start += " spymaster is thinking...";

        db.ref(`${roomQuery}`).update({
            "orange/wordsLeft": oranges,
            "blue/wordsLeft": blues
        })

        for (let i=0; i<25; i++) {
            let randNum = randIntInRange(4);
            let currSpot;

            switch(randNum) {
                case 0:
                    if (blues !== 0) {
                        currSpot = "blue";
                        blues = blues - 1;
                    } else {
                        i = i - 1;
                    }
                    break;

                case 1:
                    if (oranges !== 0) {
                        currSpot = "orange";
                        oranges = oranges - 1;
                    } else {
                        i = i - 1;
                    }
                    break;

                case 2:
                    if (empties !== 0) {
                        currSpot = "empty";
                        empties = empties - 1;
                    } else {
                        i = i - 1;
                    }
                    break;

                case 3:
                    if (kill === 3) {
                        currSpot = "kill";
                        kill = kill - 1;
                    } else {
                        kill = kill - 1;
                        i = i - 1;
                    }
                    break;
            }

            if (currSpot !== undefined) {
                gameboard.push([currSpot, 0]);
            }
        }

        db.ref(roomQuery).update({
            "boardSolution": gameboard,
            "altObjective": start,
            "currClue": start,
        });
    }

    return (
        <div className="start-btn-wrapper">
            <button className="start-btn" onClick={startGame}>Start Game</button>
        </div>
    );
}

export default StartBtn;