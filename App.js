import { useState } from 'react';
import './App.css';

import Room from './components/room';
import CreateUser from './components/createUser';

function App() {
  
  // State variables
  let [userRoom, setUserRoom] = useState();
  let [user, setUser] = useState();

  // Component logic (keep return as clean as possible)
  let usersPage = userRoom !== undefined 
    ? <Room 
        roomCode={userRoom} 
        userInfo={user} /> 
    : <CreateUser 
        user={(userInfo) => setUser(userInfo)} 
        room={(roomCode) => setUserRoom(roomCode)} />
  
  return (
    <div className="app-wrapper">
      {usersPage}
    </div>
  );
}

export default App;
