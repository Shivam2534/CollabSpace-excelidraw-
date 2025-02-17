"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  RectangleHorizontal,
  Circle,
  ArrowUp,
  Minus,
  Menu,
  Plus,
  Hand,
  AlignVerticalJustifyStartIcon,
} from "lucide-react";
import { HttPServerConnection } from "../draw/httpServerConnection";
import shapeType from "../types/shape";
import Ai from "./Ai";

type ToolPanalType = {
  changeShape: (shape: string) => void;
  activated: string;
  setOpenColorPanal: React.Dispatch<React.SetStateAction<any>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  events: any;
  roomId: number;
};

function ToolPanal({
  changeShape,
  activated,
  setOpenColorPanal,
  canvasRef,
  roomId,
}: ToolPanalType) {
  // Store the shapes fetched from the server.
  const [existingShapes, setExistingShapes] = useState<shapeType[]>([]);
  // Scale and pan state.
  const [scale, setScale] = useState(1.0);
  const [translatePos, setTranslatePos] = useState({ x: 0, y: 0 });
  // Use refs for dragging state to avoid stale closures.
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialTranslateRef = useRef({ x: 0, y: 0 });
  const scaleMultiplier = 0.8;

  // Use a ref for the activated tool so that our event handlers always have the latest value.
  const activatedRef = useRef(activated);
  useEffect(() => {
    activatedRef.current = activated;
  }, [activated]);

  // Fetch shapes once when the component mounts (or when roomId changes).
  useEffect(() => {
    async function getAllTheShapes() {
      const shapes: shapeType[] = await HttPServerConnection(roomId);
      setExistingShapes(shapes);
    }
    getAllTheShapes();
  }, [roomId]);

  // Setup canvas panning using mouse events.
  // These handlers work only if the active tool is "hand".
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (activatedRef.current !== "hand") return;
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      initialTranslateRef.current = { ...translatePos };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || activatedRef.current !== "hand") return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setTranslatePos({
        x: initialTranslateRef.current.x + dx,
        y: initialTranslateRef.current.y + dy,
      });
    };

    const handleMouseUp = () => {
      if (activatedRef.current !== "hand") return;
      isDraggingRef.current = false;
    };

    // Add the event listeners once.
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [canvasRef, translatePos]);

  // Draw helper functions.
  const canvas_arrow = (
    ctx: CanvasRenderingContext2D,
    fromx: number,
    fromy: number,
    tox: number,
    toy: number,
    color: string
  ) => {
    ctx.beginPath();
    const headlen = 10; // length of head in pixels
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 6),
      toy - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(tox, toy);
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 6),
      toy - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const canvas_line = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  // Redraw the canvas based on the current scale, translation, and shapes.
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Reset the transform and clear the canvas in default coordinates.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // Apply pan and zoom transformations.
    ctx.translate(translatePos.x, translatePos.y);
    ctx.scale(scale, scale);
    console.log("Size of before-", existingShapes.length);

    // Draw each shape.
    existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        ctx.strokeStyle = shape.color;
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(
          shape.x,
          shape.y,
          shape.radius,
          shape.startAngle,
          shape.endAngle
        );
        ctx.strokeStyle = shape.color;
        ctx.stroke();
      } else if (shape.type === "arrow") {
        canvas_arrow(
          ctx,
          shape.fromx,
          shape.fromy,
          shape.tox,
          shape.toy,
          shape.color
        );
      } else if (shape.type === "line") {
        canvas_line(
          ctx,
          shape.startX,
          shape.startY,
          shape.endX,
          shape.endY,
          shape.color
        );
      } else if (shape.type === "pencil") {
        ctx.strokeStyle = shape.color;
        ctx.beginPath();
        if (shape.path.length > 0) {
          ctx.moveTo(shape.path[0].x, shape.path[0].y);
          shape.path.forEach((point) => ctx.lineTo(point.x, point.y));
          ctx.stroke();
        }
      } else if (shape.type === "any") {
        console.log("Size of after-", existingShapes.length, shape.shape);
        eval(shape.shape);
      }
    });
    ctx.restore();
  };

  // Re-draw whenever scale, translation, or shapes change.
  useEffect(() => {
    draw();
  }, [scale, translatePos, existingShapes]);

  const [OpenInputBox, setOpenInputBox] = useState(false);

  return (
    <div>
      {/* Top tool panel for selecting shapes and the hand tool */}
      <div
        className="fixed top-0 left-20 text-white bg-[#363541] w-auto h-14 z-50 flex items-center gap-2 rounded-xl px-2 overflow-hidden m-5"
        onMouseEnter={() => {
          if (canvasRef.current) canvasRef.current.style.pointerEvents = "none";
        }}
        onMouseLeave={() => {
          if (canvasRef.current) canvasRef.current.style.pointerEvents = "auto";
        }}
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
        {/* Hand tool button – when active, drawing is disabled and only panning is allowed */}
        <Button
          onClick={() => changeShape("hand")}
          className={`${activated === "hand" ? "text-red-400" : "text-white"}`}
        >
          <Hand />
        </Button>
        <Button
          onClick={() => setOpenInputBox((p) => !p)}
          className={`${activated === "ai" ? "text-red-400" : "text-white"}`}
        >
          AI
        </Button>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <Ai
          OpenInputBox={OpenInputBox}
          setOpenInputBox={setOpenInputBox}
          setExistingShapes={setExistingShapes}
          roomId={roomId}
        />
      </div>

      {/* Left menu for toggling the color panel */}
      <div className="fixed top-0 left-0 text-white bg-[#363541] w-16 h-14 z-50 flex items-center gap-2 rounded-xl px-2 overflow-hidden m-5">
        <Button
          className="text-white"
          onClick={() => setOpenColorPanal((prev: any) => !prev)}
        >
          <Menu />
        </Button>
      </div>

      {/* Bottom-right controls for zooming */}
      <div className="absolute bottom-0 right-0 flex flex-col z-50">
        <Button
          className="text-white"
          onClick={() => {
            // Zoom in: dividing by scaleMultiplier increases the scale.
            setScale((prev) => prev / scaleMultiplier);
          }}
        >
          <Plus />
        </Button>
        <Button
          className="text-white"
          onClick={() => {
            // Zoom out: multiplying by scaleMultiplier decreases the scale.
            setScale((prev) => prev * scaleMultiplier);
          }}
        >
          <Minus />
        </Button>
      </div>
    </div>
  );
}

export default ToolPanal;
