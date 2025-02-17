import { Button } from "@/components/ui/button";
import { useSocket } from "@repo/common/hooks";
import { HTTP_BACKEND_URL } from "@repo/common/types";
import axios from "axios";
import { SessionProvider, useSession } from "next-auth/react";
import React, { useState } from "react";

function Ai({
  OpenInputBox,
  setOpenInputBox,
  setExistingShapes,
  roomId,
}: {
  OpenInputBox: boolean;
  setOpenInputBox: any;
  setExistingShapes: any;
  roomId: number;
}) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  console.log(session?.accessToken);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const { socket } = useSocket();

  const handleCreateClick = async () => {
    setInputValue("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${HTTP_BACKEND_URL}/api/v1/chat`,
        { prompt: inputValue },
        {
          headers: {
            Authorization:
              session?.accessToken ||
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTE4OWYwYy1jYWE0LTQ2MTktYmJmNC1hMmMwYjNmZDE2NjIiLCJpYXQiOjE3Mzk2MjA0OTd9.lg7CoP24CLFuCKRJyKQg8ibxXLqwLSkY9TcQDDYVJfQ",
          },
        }
      );

      if (!response.data.success) {
        console.log(response.data.message);
      }

      if (response.data.shape) {
        const newShape = {
          type: "any",
          shape: response.data.shape,
        };

        setExistingShapes((prevShapes: any) => [...prevShapes, newShape]);

        // sending to other users and backedn
        const parsedShap = JSON.stringify(newShape);
        socket.send(
          JSON.stringify({
            type: "chat",
            roomId: roomId,
            message: parsedShap,
          })
        );
      }
    } catch (error) {
      console.error("Error generating UI:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Centered AI input box at the top */}
      <div
        className={`${
          OpenInputBox ? "block" : "hidden"
        } absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#363541] shadow-lg rounded-lg p-4 flex gap-4 items-center border border-gray-600`}
      >
        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type shape prompt..."
          className="w-72 min-w-[200px] border border-gray-600 bg-black text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 resize"
        />

        {/* "Create" Button */}
        <Button
          onClick={handleCreateClick}
          className={`bg-gray-700 text-white hover:bg-gray-600 px-4 py-2 rounded-lg ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}

// Wrapping with SessionProvider in the same file
function AiWithSessionWrapper(props: any) {
  return (
    <SessionProvider>
      <Ai {...props} />
    </SessionProvider>
  );
}

export default AiWithSessionWrapper;
