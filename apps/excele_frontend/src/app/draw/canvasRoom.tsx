"use client";
import { useEffect, useRef, useState } from "react";
import DrawLogic from "./drawLogic";
import { useSocket } from "@repo/common/hooks";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  RectangleHorizontal,
  Circle,
  ArrowUp,
  Minus,
  Menu,
} from "lucide-react";

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
  const events = useRef<EventType[]>([]);
  const startRecording = useRef<boolean>(false);
  const [recording, setRecording] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const { loading, socket } = useSocket();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

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
      // DrawLogic attaches event listeners and records events
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
      // Optionally, you can add a final "end" event here if needed
    } else {
      // Start recording: clear previous events and set the flag

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
      <div>
        <div
          className="fixed top-0 left-20 text-white bg-[#363541] w-auto h-14 z-50 flex items-center gap-2 rounded-xl px-2 overflow-hidden m-5"
          onMouseEnter={() => (canvasRef.current!.style.pointerEvents = "none")}
          onMouseLeave={() => (canvasRef.current!.style.pointerEvents = "auto")}
        >
          <Button
            onClick={() => changeShape("rect")}
            className={`${activated === "rect" ? "text-red-400" : "text-white"}`}
          >
            <RectangleHorizontal />
          </Button>
          <Button
            onClick={() => changeShape("circle")}
            className={`${activated === "circle" ? "text-red-400" : "text-white"}`}
          >
            <Circle />
          </Button>
          <Button
            onClick={() => changeShape("pencil")}
            className={`${activated === "pencil" ? "text-red-400" : "text-white"}`}
          >
            <Pencil />
          </Button>
          <Button
            onClick={() => changeShape("arrow")}
            className={`${activated === "arrow" ? "text-red-400" : "text-white"}`}
          >
            <ArrowUp />
          </Button>
          <Button
            onClick={() => changeShape("line")}
            className={`${activated === "line" ? "text-red-400" : "text-white"}`}
          >
            <Minus />
          </Button>
        </div>
        <div className="fixed top-0 left-0 text-white bg-[#363541] w-16 h-14 z-50 flex items-center gap-2 rounded-xl px-2 overflow-hidden m-5">
          <Button
            className="text-white"
            onClick={() => setOpenColorPanal((prev) => !prev)}
          >
            <Menu />
          </Button>
        </div>
      </div>
      {/* Color Panel */}
      <div
        className={`${
          openColorPanal ? "block" : "hidden"
        } rounded-xl left-5 px-2 py-1 absolute top-32 w-20 h-auto bg-[#363541] flex flex-wrap justify-center items-center`}
      >
        <div className="flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-red-500 hover:bg-red-500"
            onClick={() => setCurrentColor("red")}
          />
          <Button
            className="w-8 h-8 bg-red-300 hover:bg-red-300"
            onClick={() => setCurrentColor("light red")}
          />
        </div>
        <div className="flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-green-500 hover:bg-green-500"
            onClick={() => setCurrentColor("green")}
          />
          <Button
            className="w-8 h-8 bg-yellow-400 hover:bg-yellow-400"
            onClick={() => setCurrentColor("yellow")}
          />
        </div>
        <div className="flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-white hover:bg-white"
            onClick={() => setCurrentColor("white")}
          />
          <Button
            className="w-8 h-8 bg-pink-500 hover:bg-pink-500"
            onClick={() => setCurrentColor("pink")}
          />
        </div>
        <div className="flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-blue-600 hover:bg-blue-600"
            onClick={() => setCurrentColor("blue")}
          />
          <Button
            className="w-8 h-8 bg-blue-300 hover:bg-blue-300"
            onClick={() => setCurrentColor("light blue")}
          />
        </div>
        <div className="flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-blue-400 hover:bg-blue-400"
            onClick={() => setCurrentColor("blue")}
          />
          <Button
            className="w-8 h-8 bg-fuchsia-300 hover:bg-fuchsia-300"
            onClick={() => setCurrentColor("fuchsia")}
          />
        </div>
      </div>
      {/* Recording and Replay Controls */}
      <div className="absolute bottom-7 left-5 flex gap-2">
        <Button onClick={toggleRecording} className="bg-[#363541] px-2 py-1">
          {recording ? (
            <span className="text-red-600">Stop Rec.</span>
          ) : (
            <span>Start Rec.</span>
          )}
        </Button>
        <Button
          onClick={() => {
            // Trigger replay only if not recording and there are recorded events
            if (!recording && events.current.length > 0) {
              setReplayFlag(true);
            }
          }}
          className="bg-[#363541] px-2 py-1"
        >
          {replaying ? (
            <span
              className="text-red-400"
              onClick={() => setReplayFlag(false)}
            >
              Pause
            </span>
          ) : (
            <span>Re-play</span>
          )}
        </Button>
      </div>
    </div>
  );
}
