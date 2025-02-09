"use client";
import { useEffect, useRef, useState } from "react";
import DrawLogic from "./drawLogic";
import { useSocket } from "@repo/common/hooks";
import { Button } from "@/components/ui/button";

import ColorPanal from "../ourComponents/colorPanal";
import Recording from "../ourComponents/Recording";
import ToolPanal from "../ourComponents/ToolPanal";

interface Props {
  roomId: string | number;
}

type EventType = {
  type: string;
  timestamp: number;
  data: { x: number; y: number };
};

export default function CanvasRoom({ roomId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentShape, setCurrentShape] = useState("rect");
  const [activated, setActivated] = useState("rect");
  const [openColorPanal, setOpenColorPanal] = useState(true);
  const [currentColor, setCurrentColor] = useState("white");
  const [replayFlag, setReplayFlag] = useState(false);
  let events = useRef<EventType[]>([]);
  const startRecording = useRef<boolean>(false);
  const [recording, setRecording] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const { loading, socket } = useSocket();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const arr = JSON.parse(localStorage.getItem("Prev_Draw"));
  if (arr && events.current.length == 0) {
    events = arr;
  }
  // Update globals (for DrawLogic, if needed)
  useEffect(() => {
    //@ts-ignore
    window.currentShape = currentShape;
    //@ts-ignore
    window.CurrentColor = currentColor;
  }, [currentShape, currentColor]);

  // Initialize DrawLogic when socket is ready
  useEffect(() => {
    if (!loading && socket && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      setCtx(context);

      socket.send(JSON.stringify({ type: "join_room", roomId }));

      //@ts-ignore
      DrawLogic(canvas, roomId, socket, events, context, startRecording);
    }
  }, [loading, socket, roomId]);

  // Trigger replay when replayFlag is set and we're not recording
  useEffect(() => {
    if (replayFlag && ctx && !recording) {
      setReplaying(true);

      replayDrawing(ctx);
    }
  }, [replayFlag, ctx, recording]);

  // Change shape handler
  function changeShape(shape: string) {
    setActivated(shape);
    setCurrentShape(shape);
  }

  // Replay the drawing using recorded events
  function replayDrawing(replayCtx: CanvasRenderingContext2D) {
    // Clear the canvas for a fresh replay
    replayCtx.clearRect(
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    );
    console.log("Starting replay with", events.current.length, "events");

    if (events.current.length === 0) {
      console.log("No events recorded.");
      setReplaying(false);
      setReplayFlag(false);
      return;
    }

    // Use the timestamp of the first event as the base
    const baseTime = events.current[0].timestamp;
    events.current.forEach((event, index) => {
      const delay = event.timestamp - baseTime;
      setTimeout(() => {
        simulateEvent(event, replayCtx);
        // When the last event has been replayed, clear replay state
        if (index === events.current.length - 1) {
          setReplaying(false);
          setReplayFlag(false);
        }
      }, delay);
    });
  }

  // Simulate a recorded event on the canvas
  function simulateEvent(
    event: EventType,
    replayCtx: CanvasRenderingContext2D
  ) {
    console.log("Event is-", event);
    switch (event.type) {
      case "start":
        replayCtx.beginPath();
        replayCtx.moveTo(event.data.x, event.data.y);
        break;
      case "draw":
        replayCtx.lineTo(event.data.x, event.data.y);
        replayCtx.stroke();
        break;
      case "end":
        replayCtx.lineTo(event.data.x, event.data.y);
        replayCtx.stroke();
        break;
      default:
        break;
    }
  }

  // Toggle recording state: start new recording or stop current one
  function toggleRecording() {
    if (recording) {
      // Stop recording: signal DrawLogic to stop recording further events
      startRecording.current = false;
      setRecording(false);
    } else {
      startRecording.current = true;
      setRecording(true);
    }
  }

  if (loading) {
    return <div>Connecting to server...</div>;
  }

  return (
    <div className="relative overflow-hidden">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="bg-[#121212] w-auto h-auto"
      ></canvas>
      {/* Tools Panel */}
      {canvasRef.current && (
        <ToolPanal
          changeShape={changeShape}
          activated={activated}
          setOpenColorPanal={setOpenColorPanal}
          canvasRef={canvasRef}
          events={events}
          roomId={roomId}
        />
      )}
      {/* Color Panel */}
      <ColorPanal
        setCurrentColor={setCurrentColor}
        openColorPanal={openColorPanal}
      />
      {/* Recording and Replay Controls */}
      <Recording
        toggleRecording={toggleRecording}
        recording={recording}
        setReplayFlag={setReplayFlag}
        replaying={replaying}
        eventLen={events.current.length}
      />
    </div>
  );
}
