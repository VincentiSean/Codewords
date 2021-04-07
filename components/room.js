import { useState, useEffect } from 'react';
import { db } from '../config/Fire';

// import useWindowWidth from '../hooks/useWindowWidth';

import TeamStats from './teamStats';
import StartBtn from './startBtn';
import SolutionBoard from './solutionBoard';
import UserGameBoard from './userGameBoard';
import SpyClueInputs from './spyClueInputs';
import EndTurnBtn from './endTurnBtn';
import Gamelog from './gamelog';

function Room({ roomCode, userInfo }) {

    // State variables
    let [initialRend, setInitialRend] = useState(true);
    let [roomInfo, setRoomInfo] = useState();

    let [userTeam, setUserTeam] = useState();
    let [userRole, setUserRole] = useState();
    let [isCurrTurn, setIsCurrTurn] = useState(false);
    let [blueTeam, setBlueTeam] = useState(true);
    let [orangeTeam, setOrangeTeam] = useState(true);

    let [currObjective, setCurrObjective] = useState("Setting up the game...");
    let [altObjective, setAltObjective] = useState("Setting up the game...");
    
    let [gamelogChange, setGamelogChange] = useState();

    let [gameOver, setGameOver] = useState(false);
    let [winnerText, setWinnerText] = useState("");

    //// VARIABLES THAT DEPEND ON CONDITIONS \\\\

    // Display the start button is the user is the host and the game is not started
    let startButton = 
        roomInfo !== undefined
        && userInfo.uid === roomInfo.roomHost 
        && !roomInfo.gameStarted 
        && (<StartBtn roomCode={roomCode} />)

    // Determine which gameboard to give the user
    let specificBoard;
    if (roomInfo !== undefined) {
        if (roomInfo.words !== undefined) {
            specificBoard = 
            roomInfo.words !== undefined
            && userRole === "spymaster"
            ?   <SolutionBoard roomInfo={roomInfo} />
            :   <UserGameBoard roomInfo={roomInfo} currTurn={isCurrTurn} />
        }
    }

    let clueInput = 
        userRole === "spymaster" &&
        roomInfo.gameStarted &&
        isCurrTurn &&
        !roomInfo.clueGiven &&
        <SpyClueInputs 
            roomInfo={roomInfo} 
            user={userInfo.username} />


    let objective = 
        isCurrTurn
        ?   <p className="curr-obj-txt">{currObjective}</p>
        :   <p className="curr-obj-txt">{altObjective}</p>


    let endTurn = 
        userRole === "operative" &&
        roomInfo.gameStarted &&
        isCurrTurn &&
        roomInfo.clueGiven !== false &&
        <EndTurnBtn roomInfo={roomInfo} />

    let winnerDisplay = 
        gameOver &&
        (<div className="winner-wrapper">
            <p className="winner-txt">{winnerText}</p>
        </div>)


    useEffect(() => {
        // This is to deal with page reloads when it comes to that...
        // window.addEventListener('beforeunload', handleEndConcery);

        if (initialRend) {
            getRoomInfo(roomCode);
        }

        if (roomInfo !== undefined) {
            if (roomInfo.currentTurn === "blue") {
                if (userTeam === "blue") {
                    setIsCurrTurn(true);
                } else {
                    setIsCurrTurn(false);
                }
            } else {
                if (userTeam === "orange") {
                    setIsCurrTurn(true);
                } else {
                    setIsCurrTurn(false);
                }
            }

            if (roomInfo.currClue !== undefined) {
                setCurrObjective(roomInfo.currClue);
                setAltObjective(roomInfo.altObjective);
            }

            if (roomInfo.orange && roomInfo.blue) {
                if (roomInfo.orange.wordsLeft === 0) {
                    winner("Orange");
                } else if (roomInfo.blue.wordsLeft === 0) {
                    winner("Blue");
                }
            }
        }

    }, [isCurrTurn, orangeTeam, blueTeam, roomInfo, gamelogChange])


    function getRoomInfo(roomCode) {
        setInitialRend(false);

        // Get the room information/set up listener from firebase
        db.ref(`rooms/${roomCode}`).on("value", (snapshot) => {
            console.log(snapshot.val());
            setRoomInfo(snapshot.val());
        });
    }

    function changeUserRole(newRole) {
        let rawRole = newRole.split(":");
        let team = rawRole[0];
        let role = rawRole[1];

        setUserRole(role);
        setUserTeam(team);

        if (team === "orange") {
            setBlueTeam(false);
            setOrangeTeam(true);
        } else {
            setBlueTeam(true);
            setOrangeTeam(false);
        }
    }

    
    function winner(winner) {
        let winTxt = `${winner} team wins!`;

        setGameOver(true);
        setWinnerText(winTxt);
        setAltObjective(winTxt);
        setCurrObjective(winTxt);

        db.ref(`rooms/${roomCode}`).update({
            "currentTurn": "game over"
        });
    }


    return (
        roomInfo !== undefined  
            ?   (<div className="room-wrapper">
                    <div className="player-room-wrapper">
                        <div className="info-elements-wrappers num-player-wrapper">
                            <svg
                                xmlns="http://www.w3.org/2000/svg" 
                                className="players-icon icon icon-tabler icon-tabler-user" 
                                width="44" 
                                height="44"
                                viewBox="0 0 24 24" 
                                strokeWidth="1.5" 
                                stroke="currentColor" 
                                fill="currentColor" 
                                strokeLinecap="round" 
                                strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <circle cx="12" cy="7" r="4" />
                                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                            </svg>
                            <p className="num-player-txt">{roomInfo.numPlayers}</p>
                        </div>
                        <div className="info-elements-wrappers room-code-wrapper">
                            <p className="room-code-txt">Room Code {roomInfo.roomCode}</p>
                        </div>
                    </div>
                    <div className="info-elements-wrappers username-wrapper">
                        <p className="username-txt">{userInfo.username}</p>
                        <svg
                            xmlns="http://www.w3.org/2000/svg" 
                            className="smiley-icon icon icon-tabler icon-tabler-mood-happy" 
                            width="44" 
                            height="44" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="none" 
                            fill="currentColor" 
                            strokeLinecap="round" 
                            strokeLinejoin="round">
                            <path 
                                stroke="none" 
                                d="M0 0h24v24H0z" 
                                fill="none"/>
                            <circle cx="12" cy="12" r="9" />
                            <line x1="9" y1="9" x2="9.01" y2="9" />
                            <line x1="15" y1="9" x2="15.01" y2="9" />
                            <path d="M8 13a4 4 0 1 0 8 0m0 0h-8" />
                        </svg>
                    </div>
                    <div className="current-objective-wrapper">
                        {objective}
                    </div>

                    {/* 
                        Display the gameboard for the user if game is started
                        Determined based on user's role and set in variables
                    */}
                    {roomInfo.gameStarted
                        ?   specificBoard
                        :   <></>
                    }

                    {/* Display the start button if the user is the host */}
                    {startButton}

                    {/* Display the end turn button if its the current operators turn */}
                    {endTurn}

                    {/* Display the clue input if applicable to the user */}
                    {clueInput}

                    <TeamStats
                        teamColor="blue"
                        roomInfo={roomInfo}
                        roomCode={roomInfo.roomCode}
                        userInfo={(newRole) => changeUserRole(newRole)}
                        userid={userInfo.uid}
                        userName={userInfo.username}
                        otherTeam="orange"
                        gameStarted={roomInfo.gameStarted}
                        isOnOtherTeam={orangeTeam}
                    />
                    <Gamelog roomInfo={roomInfo} changeGamelog={gamelogChange}/>
                    <TeamStats
                        teamColor="orange"
                        roomInfo={roomInfo}
                        roomCode={roomInfo.roomCode}
                        userInfo={(newRole) => changeUserRole(newRole)}
                        userid={userInfo.uid}
                        userName={userInfo.username}
                        otherTeam="blue"
                        gameStarted={roomInfo.gameStarted}
                        isOnOtherTeam={blueTeam}
                    />

                    {winnerDisplay}

                </div>)
            :   <></>
    );
}

export default Room;



// things to do
// make pretty/responsive
// make it replayable?