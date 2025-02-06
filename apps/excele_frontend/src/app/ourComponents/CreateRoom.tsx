import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader2, X } from "lucide-react";
import React, { useState } from "react";
import { HTTP_BACKEND_URL } from "@repo/common/types";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function CreateRoom({
  IsDialogOpen,
  SuccessMsg,
  inputRef,
  RoomIdRef,
  setIsDialogOpen,
}) {
  const [createRoomLoading, setcreateRoomLoading] = useState(false);
  const { data: session, status } = useSession();
  async function createNewRoom() {
    setcreateRoomLoading(true);
    try {
      const roomName = inputRef.current.value;
      const res = await axios.post(
        `${HTTP_BACKEND_URL}/api/v1/create-room`,
        { roomName },
        {
          headers: {
            Authorization: session?.accessToken,
          },
        }
      );
      if (res.data.success) {
        RoomIdRef.current = res.data.roomId;
        SuccessMsg.current = res.data.message;
      }
    } catch (error) {
      console.log("error-", error);
    } finally {
      setcreateRoomLoading(false);
    }
  }
  const router = useRouter();

  function GototheRoom() {
    router.push(`canvas/${RoomIdRef.current}`);
  }
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        IsDialogOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`w-[420px] bg-gray-900 text-white p-6 rounded-xl shadow-2xl transform transition-all duration-300 ${
          IsDialogOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {/* Header with Title and Close Button */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-gray-200">
            {SuccessMsg.current != null
              ? SuccessMsg.current
              : "Create a New Room"}
          </h2>
          <Button
            onClick={() => setIsDialogOpen(false)}
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
            placeholder="Enter room name"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Room ID Display (After Room is Created) */}
        {RoomIdRef.current && (
          <div className="mt-4 p-3 bg-gray-800 text-center rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300">Room ID:</p>
            <p className="text-lg font-bold text-blue-400">
              {RoomIdRef.current}
            </p>
            <p className="text-sm text-gray-400">
              Share this ID to let others join
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          {!RoomIdRef.current ? (
            <Button
              onClick={createNewRoom}
              className=" py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition flex items-center justify-center"
            >
              {createRoomLoading && <Loader2 className="animate-spin mr-2" />}
              Create Room
            </Button>
          ) : (
            <Button
              onClick={GototheRoom}
              className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition flex items-center justify-center"
            >
              {createRoomLoading && <Loader2 className="animate-spin mr-2" />}
              Enter Room
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;
