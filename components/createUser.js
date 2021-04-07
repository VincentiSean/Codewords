import { useState, useEffect } from 'react';
import fire, { db } from '../config/Fire';
import { nanoid } from 'nanoid';

function CreateUser({ user, room }) {

    // State variables
    let [username, setUsername] = useState("");
    let [currUser, setCurrUser] = useState();
    let [roomCode, setRoomCode] = useState("");
    let [errorText, setErrorText] = useState();

    // Variables to change with state
    let errTextContainer = errorText !== undefined 
        && <p className="error-txt">{errorText}</p>



    useEffect(() => {}, [currUser])



    // Updates the username state on input change
    function updateName(event) {
        setUsername(event.target.value);
    }

    // Updates the roomCode state on input change
    function updateRoomCode(event) {
        setRoomCode(event.target.value);
    }

    function login(numType) {
        
        // use Firebase to sign users in anonymously (currently users dont need to login just have a userid)
        fire.auth().signInAnonymously()
            .then(() => {
                setCurrUser(user);
            })
            .catch((error) => {
                console.error(error);
            });

        
        // Check to see if user is creating or joining a room
        fire.auth().onAuthStateChanged((userInfo) => {
            userInfo.username = username;        
            setCurrUser(userInfo);
            
            if (numType === 0) {
                let newRoomID = nanoid(6);
                let roomQuery = `rooms/${newRoomID}`;

                db.ref(roomQuery).set({
                    "roomCode": newRoomID,
                    "roomHost": userInfo.uid,
                    "numPlayers": 1,
                    "players": [userInfo.uid],
                    "gameStarted": false,
                    "currentTurn": null,
                    "words": null,
                    "boardSolution": null,
                    "clueGiven": false
                });

                // Send info through props
                user(userInfo);
                room(newRoomID);        
            } else if (numType === 1) {
                if (roomCode !== undefined) {
                    let rooms;
                    let validCode = false;

                    db.ref(`rooms`).once("value", (snapshot) => {
                        if (snapshot.exists()) {
                            rooms = snapshot.val();

                            Object.entries(rooms).forEach(([key, value]) => {
                                if (key === roomCode) {
                                    console.log("valie");
                                    validCode = true;
                                }
                            });
                        

                            if (validCode) {
                                
                                console.log("hered");
                                let joinRoomQuery = `rooms/${roomCode}`;

                                db.ref(joinRoomQuery).once("value", (snapshot) => {
                                    let usersInRoom = [];

                                    snapshot.val().players.forEach((user) => {
                                        usersInRoom.push(user);
                                    });

                                    usersInRoom.push(userInfo.uid);

                                    db.ref(joinRoomQuery).update({
                                        "numPlayers": snapshot.val().numPlayers + 1,
                                        "players": usersInRoom
                                    });
                                });

                                setErrorText(undefined);
                                user(userInfo);
                                room(roomCode);
                            } else {
                                setErrorText("Not a valid room code");
                            }
                        }
                    });
                }
            }
        }); 
    }

    return (
        <div className="create-user-bkg">
            <div className="create-user-wrapper">
                <h1 className="create-header">CodeWords</h1>
                {errTextContainer}
                <div className="create-inputs-wrapper">
                    <input
                        className="create-txt-inputs"
                        onChange={updateName}
                        value={username}
                        type="text"
                        name="name"
                        placeholder="Username"
                    />
                    <input
                        className="create-txt-inputs"
                        onChange={updateRoomCode}
                        value={roomCode}
                        type="text"
                        name="roomCode"
                        placeholder="Room Code"
                    />
                </div>
                <div className="create-btn-wrapper">
                    <button className="create-btn" onClick={() => login(0)}>
                        Create Room    
                    </button>
                    <button className="create-btn" onClick={() => login(1)}>
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateUser;
