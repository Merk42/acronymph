import { FormEvent, useMemo, useState } from "react"

function Login({ joinRoom, enterError }:{ joinRoom: Function, enterError: string}) {
    const [userName, setUserName] = useState("");
    const [roomName, setRoomName] = useState("general");
    const [joinCopy, setJoinCopy] = useState("join");
    const [hasClicked, setHasClicked] = useState(false)

    const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (canLogIn) {
            setHasClicked(true);
            joinRoom(roomName, userName);
            setJoinCopy("Please wait...");
        }
    }

    const canLogIn = useMemo<boolean>(() => {
        return userName !== "" && roomName !== ""
    }, [userName, roomName])


    return (
        <div className="flex flex-col max-w-xs m-auto">
            <h1 className="text-center text-5xl font-bold text-blue-500 dark:text-blue-400 mt-4">Acronymph</h1>
            <form className="contents" onSubmit={handleSubmit}>
                <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white mt-4"
                    htmlFor="name">username</label>
                <input
                    className="outline-1 outline-gray-300 block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-blue-500"
                    id="name"
                    type="text"
                    placeholder="cool name"
                    value={userName}
                    onChange={(event) => {
                        setUserName(event.target.value)
                    }}
                />
                <label
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white mt-4"
                    htmlFor="room">room</label>
                <select
                    className="outline-1 outline-gray-300 block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-blue-500"
                    id="room"
                    value={roomName}
                    onChange={(event) => {
                        setRoomName(event.target.value)
                    }}>
                    <option value='general'>no categories</option>
                    <option value='categories'>categories</option>
                </select>
                <button
                    className="mt-4 px-1 py-2 bg-blue-500 text-white rounded-md cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={!canLogIn || hasClicked}>{joinCopy}</button>
            </form>
            <div className="text-red-500 font-bold">{enterError}</div>
        </div>
    )
}

export default Login