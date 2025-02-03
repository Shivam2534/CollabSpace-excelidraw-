"use client";
import { useEffect, useRef } from "react";
import DrawLogic from "./drawLogic";
import { useSocket } from "@repo/common/hooks";

interface Props {
  roomId: string | number;
}

export default function CanvasRoom({ roomId }: Props) {
  console.log("id reched in CanvasRoom", roomId);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  //now connecting to the server, to chat
  const { loading, socket } = useSocket();
  
  useEffect(() => {
    if (!loading && socket && canvasRef.current) {
      const canvas = canvasRef.current;
      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
        })
      );
      DrawLogic(canvas, roomId, socket);
    }
  }, [loading, socket]);

  if (loading) {
    return <div>Connecting to server...</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      width={1536}
      height={729}
      className="bg-[#121212] w-auto h-auto"
    ></canvas>
  );
}
