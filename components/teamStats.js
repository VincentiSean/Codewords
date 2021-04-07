import { useState, useEffect } from 'react';
import { db } from '../config/Fire';

function TeamStats({
    teamColor,
    roomInfo,
    roomCode,
    userInfo,
    userid,
    userName,
    otherTeam,
    gameStarted,
    isOnOtherTeam
}) {

    // State variables
    let [isOp, setIsOp] = useState(false);
    let [isSpy, setIsSpy] = useState(false);
    let [wordsLeft, setWordsLeft] = useState("-");

    // Other variables...
    const teamQuery = `rooms/${roomCode}/${teamColor}`;
    let currOps = [];
    let currSpys = [];

    let bckgrndStyle = null;

    // Set up some styles for the background of the team stat component 
    //  depending on the team
    if (teamColor === "blue") {
        bckgrndStyle = {
            backgroundColor: "#0096af",
            color: "#77E3F2",
            gridColumn: "7/10"
        }
    } else {
        bckgrndStyle = {
            backgroundColor: "#a13e1e",
            color: "#F9A58A",
            gridColumn: "1/4"
        }
    }

    // Determine which op & spy buttons should be shown depending on the currently chosen button
    let opBtn = !isOp 
        &&  <button 
                className="team-btns" 
                onClick={addOperative}>
                    Join as Operative
            </button>;
    let spyBtn = !isSpy 
        &&  <button 
                className="team-btns" 
                onClick={addSpymaster}>
                    Join as Spymaster
            </button>;



    // This listens for database changes for the current color's operators
    //      and adds those operators to an array (currOps)
    db.ref(`${teamQuery}/operatives`).on('value', (snapshot) => {
        if (snapshot.exists()) {
            snapshot.val().map((user, index) => {
                currOps.push(user[1]);
            });
        }
    });

    // This listens for database changes for the current color's spymasters
    //      and adds those spymasters to an array (currSpys)
    db.ref(`${teamQuery}/spymasters`).on('value', (snapshot) => {
        if (snapshot.exists()) {
            snapshot.val().map((user, index) => {
                currSpys.push(user[1]);
            });
        }
    });


    useEffect(() => {

        // If the user is on the other team, reset isOp and isSpy
        if (isOnOtherTeam) {
            setIsOp(false);
            setIsSpy(false);
        }

        if (teamColor === "orange") {
            if (roomInfo.orange !== undefined) {
                setWordsLeft(roomInfo.orange.wordsLeft);
            }
        } else {
            if (roomInfo.blue !== undefined) {
                setWordsLeft(roomInfo.blue.wordsLeft);
            }
        }
    }, [isOnOtherTeam, roomInfo])


    function addSpymaster() {
        setIsSpy(true);
        setIsOp(false);

        // If user chooses to be a spymaster, delete from operatives of current color
        db.ref(`${teamQuery}/operatives`).once("value", (snapshot) => {
            if (snapshot.exists()) {
                snapshot.val().forEach((item, index) => {
                    if (item[0] === userid) {
                        db.ref(`${teamQuery}/operatives`).child(index).remove();
                    }
                });
            }
        });

        removeFromOther(userid, otherTeam, roomCode); // Removes user from other team

        // Add user to spymasters
        let newSpy = [userid, userName];
        db.ref(teamQuery).once("value", (snapshot) => {
            if (snapshot.exists()) {
                let spyRoster = [];

                if (snapshot.val().spymasters !== undefined) {
                    snapshot.val().spymasters.forEach((user) => {
                        spyRoster.push(user);
                    });
                }
                spyRoster.push(newSpy);

                db.ref(teamQuery).update({
                    "spymasters": spyRoster
                });
            } else {
                db.ref(teamQuery).update({
                    "spymasters": [newSpy]
                })
            }
        });

        // pass info up to parent
        let userInfoString = teamColor + ":spymaster";
        userInfo(userInfoString);
    }


    function addOperative() {
        setIsOp(true);
        setIsSpy(false);

        // If user chooses to be an operative, delete from spymasters of current color
        db.ref(`${teamQuery}/spymasters`).once("value", (snapshot) => {
            if (snapshot.exists()) {
                snapshot.val().forEach((item, index) => {
                    if (item[0] === userid) {
                        console.log(index);
                        db.ref(`${teamQuery}/spymasters`).child(index).remove();
                    }
                });
            }
        });

        removeFromOther(userid, otherTeam, roomCode); // Removes user from other team

        // Add user to operatives
        let newOp = [userid, userName];
        db.ref(teamQuery).once("value", (snapshot) => {
            if (snapshot.exists()) {
                let opRoster = [];

                if (snapshot.val().operatives !== undefined) {
                    snapshot.val().operatives.forEach((user) => {
                        opRoster.push(user);
                    });
                }
                opRoster.push(newOp);

                db.ref(teamQuery).update({
                    "operatives": opRoster
                });
            } else {
                db.ref(teamQuery).update({
                    "operatives": [newOp]
                })
            }
        });

        // pass info up to parent
        let userInfoString = teamColor + ":operative";
        userInfo(userInfoString);
    }

    // This function removes the current user from the other team entirely
    function removeFromOther(userID, otherColor, roomNum) {
        let otherTeamQuery = `rooms/${roomNum}/${otherColor}`;

        // Remove the user from the other team's operative list if they exist there
        db.ref(`${otherTeamQuery}/operatives`).once("value", (snapshot) => {
            if (snapshot.exists()) {
                snapshot.val().forEach((user, index) => {
                    if (user[0] === userID) {
                        db.ref(`${otherTeamQuery}/operatives/${index}`).remove();
                    }
                });
            }
        });


        // Remove the user from the other team's spymaster list if they exist there
        db.ref(`${otherTeamQuery}/spymasters`).once("value", (snapshot) => {
            if (snapshot.exists()) {
                snapshot.val().forEach((user, index) => {
                    if (user[0] === userID) {
                        db.ref(`${otherTeamQuery}/spymasters/${index}`).remove();
                    }
                });
            }
        });
    }

    
    return(
        <div className="team-wrapper" style={bckgrndStyle}>
            <div className="words-left-wrapper">
                {wordsLeft !== undefined
                    ?   <p className="words-left-num">
                            {wordsLeft}
                        </p>
                    : <p className="words-left-num">
                        -
                    </p>
                }
            </div>
            <div className="team-stats-wrapper red">
                <p className="team-stats-headers">Operative(s)</p>
                {currOps.length > 0
                    ?   <p className="team-txt">{currOps.toString()}</p>
                    :   <></>
                }
                {!gameStarted && opBtn}
            </div>
            <div className="team-stats-wrapper red">
                <p className="team-stats-headers">Spymaster(s)</p>
                {currSpys.length > 0
                    ?   <p className="team-txt">{currSpys.toString()}</p>
                    :   <></>
                }
                {!gameStarted && spyBtn}
            </div>
        </div>
    );
}

export default TeamStats;
