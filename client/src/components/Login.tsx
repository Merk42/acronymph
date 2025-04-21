import { useState, useEffect } from "react"
import { io } from 'socket.io-client';

const socket = io("http://localhost:3001");

function Login(props:any) {
    const [username, setUsername] = useState("myName");
    const [room, setRoom] = useState("myRoom");

    const joinRoom = () => {

      console.log('attempt to join room', room)
      /*
      socket.emit("join_room", room)
      */
      props.joinRoom(room, username)
    }


    return (
        <div style={{display:'flex',flexDirection: 'column'}}>
            <label htmlFor="name">username</label>
            <input
                id="name"
                type="text"
                placeholder="cool name"
                value={username}
                onChange={(event) => {
                    setUsername(event.target.value)
                }}
            />
            <label htmlFor="room">room</label>
            <input
                id="room"
                type="text"
                placeholder="room"
                value={room}
                onChange={(event) => {
                    setRoom(event.target.value)
                }}
            />
            <button onClick={joinRoom}>join</button>
        </div>
    )
}

export default Login