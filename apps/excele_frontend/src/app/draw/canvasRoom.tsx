"use client";
import { useEffect, useRef, useState } from "react";
import DrawLogic from "./drawLogic";
import { useSocket } from "@repo/common/hooks";
import ColorPanal from "../ourComponents/colorPanal";
import Recording from "../ourComponents/Recording";
import ToolPanal from "../ourComponents/ToolPanal";
import EventType from "../types/event";
import ShareOnCanvas from "../ourComponents/shareOnCanvas";

interface Props {
  roomId: string | number;
}

export default function CanvasRoom({ roomId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentShape, setCurrentShape] = useState("");
  const [activated, setActivated] = useState("");
  const [openColorPanal, setOpenColorPanal] = useState(true);
  const [currentColor, setCurrentColor] = useState("white");
  const [replayFlag, setReplayFlag] = useState(false);
  let events = useRef<EventType[]>([]);
  const startRecording = useRef<boolean>(false);
  const [recording, setRecording] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const { loading, socket } = useSocket();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  //@ts-ignore
  const arr = JSON.parse(localStorage.getItem("Prev_Draw"));
  if (arr && events.current.length == 0) {
    events = arr;
  }
  useEffect(() => {
    //@ts-ignore
    window.currentShape = currentShape;
    //@ts-ignore
    window.CurrentColor = currentColor;
  }, [currentShape, currentColor]);

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

  useEffect(() => {
    if (replayFlag && ctx && !recording) {
      setReplaying(true);

      replayDrawing(ctx);
    }
  }, [replayFlag, ctx, recording]);

  function changeShape(shape: string) {
    if (activated == shape) {
      setActivated("");
      setCurrentShape("");
    } else {
      setActivated(shape);
      setCurrentShape(shape);
    }
  }

  function replayDrawing(replayCtx: CanvasRenderingContext2D) {
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

    const baseTime = events.current[0].timestamp;
    events.current.forEach((event, index) => {
      const delay = event.timestamp - baseTime;
      setTimeout(() => {
        simulateEvent(event, replayCtx);
        if (index === events.current.length - 1) {
          setReplaying(false);
          setReplayFlag(false);
        }
      }, delay);
    });
  }

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

  function toggleRecording() {
    if (recording) {
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
      {/* Share button on canvas */}
      <ShareOnCanvas roomId={roomId} />
      {/* Tools Panel */}
      {canvasRef.current && (
        <ToolPanal
          changeShape={changeShape}
          activated={activated}
          setOpenColorPanal={setOpenColorPanal}
          canvasRef={canvasRef}
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
