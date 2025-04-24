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
        <div className="flex flex-col">
            <h1 className="text-center text-5xl font-bold text-blue-500 mt-4">Acronymph</h1>
            <label
                className="block text-sm/6 font-medium text-gray-900 mt-4"
                htmlFor="name">username</label>
            <input
                className="outline-1 -outline-offset-1 outline-gray-300 block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                id="name"
                type="text"
                placeholder="cool name"
                value={username}
                onChange={(event) => {
                    setUsername(event.target.value)
                }}
            />
            <label
                className="block text-sm/6 font-medium text-gray-900 mt-4"
                htmlFor="room">room</label>
            <input
                className="outline-1 -outline-offset-1 outline-gray-300 block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                id="room"
                type="text"
                placeholder="room"
                value={room}
                onChange={(event) => {
                    setRoom(event.target.value)
                }}
            />
            <button
                className="mt-4 px-1 py-2 bg-blue-500 text-white rounded-md cursor-pointer"
                onClick={joinRoom}>join</button>
        </div>
    )
}

export default Login