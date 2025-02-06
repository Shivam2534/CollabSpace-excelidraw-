import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_BACKEND_URL } from "@repo/common/types";

function EnterRoom({
  IsEnterRoomDialogOpen,
  setIsEnterRoomDialogOpen,
  session,
}) {
  const inputRef = useRef(null);
  const [loading, setloading] = useState(false);
  const [msg, setmsg] = useState("");

  const router = useRouter();
  async function GototheRoom() {
    setloading(true);
    try {
      //@ts-ignore
      const roomId = inputRef.current.value;
      const res = await axios.post(
        `${HTTP_BACKEND_URL}/api/v1/checkroom`,
        {
          roomId,
        },
        {
          headers: {
            Authorization: session?.accessToken,
          },
        }
      );
      if (res.data.success) {
        router.push(`canvas/${roomId}`);
      } else {
        setmsg(res.data.message);
      }
    } catch (error) {
      console.log(error);
      setmsg("Error while joining");
    } finally {
      setloading(false);
    }
  }
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        IsEnterRoomDialogOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`w-[420px] bg-gray-900 text-white p-6 rounded-xl shadow-2xl transform transition-all duration-300 ${
          IsEnterRoomDialogOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {/* Header with Title and Close Button */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-gray-200">Join Room</h2>
          <Button
            onClick={() => setIsEnterRoomDialogOpen(false)}
            className="p-2 rounded-full hover:bg-gray-700 transition"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </Button>
        </div>

        {/* Room Name Input */}
        <div className="mt-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter room Id"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {msg.length > 0 && (
          <div className="mt-4 p-3 bg-gray-800 text-center rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300">No Room Found</p>
            <p className="text-lg font-bold text-blue-400">{msg}</p>
            <p className="text-sm text-gray-400">
              Please enter correct room Id
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            onClick={GototheRoom}
            className=" py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition flex items-center justify-center"
          >
            Enter Room
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EnterRoom;
