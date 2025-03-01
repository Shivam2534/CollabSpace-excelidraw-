"use client";
import {  useState } from "react";
import { useRouter } from "next/navigation";

export default function Home({
  searchParams,
}: {
  searchParams: {
    user: string;
  };
}) {
  let user = null;

  if (searchParams?.user) {
    try {
      user = JSON.parse(decodeURIComponent(searchParams?.user));
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  console.log("user-", user);
  const [view, setView] = useState("join_room");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.elements.username?.value;
    const roomId = e.target.elements.roomid?.value; 

    if (view === "join_room") {
      if (!username || !roomId) {
        alert("Please enter both username and room ID.");
        return;
      }

      // Pass roomId as query param
      console.log(roomId, username);
      router.push(
        `/chat?roomid=${Number(roomId)}&username=${username}&user=${encodeURIComponent(JSON.stringify(user))}`
      );
    } else {
      const roomName = e.target.elements.roomname?.value;

      if (!roomName) {
        alert("Please enter a room name.");
        return;
      }


      router.push(
        `/chat?roomname=${roomName}&username=${username}&user=${user}`
      );
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          {view === "join_room" ? "Join a Chat Room" : "Create a New Room"}
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {view === "join_room" ? (
            <>
              <div>
                <label
                  htmlFor="username"
                  className="block text-gray-700 font-medium"
                >
                  Username
                </label>
                <input
                  id="username"
                  value={user.user.name}
                  type="text"
                  placeholder="Enter your name"
                  className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="roomid"
                  className="block text-gray-700 font-medium"
                >
                  Room ID
                </label>
                <input
                  id="roomid"
                  type="text"
                  placeholder="Enter room ID"
                  className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
              >
                Join Room
              </button>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="username"
                  className="block text-gray-700 font-medium"
                >
                  Username
                </label>
                <input
                  id="username"
                  value={user?.user.name}
                  type="text"
                  placeholder="Enter your name"
                  className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="roomname"
                  className="block text-gray-700 font-medium"
                >
                  Room Name
                </label>
                <input
                  id="roomname"
                  type="text"
                  placeholder="Enter room name"
                  className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition duration-300"
              >
                Create Room
              </button>
            </>
          )}
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setView(view === "join_room" ? "create_room" : "join_room")
            }
            className="text-blue-600 hover:underline font-medium"
          >
            {view === "join_room"
              ? "Create a new room"
              : "Join an existing room"}
          </button>
        </div>
      </div>
    </div>
  );
}
