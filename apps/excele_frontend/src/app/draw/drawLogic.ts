import path from "path";
import { HttPServerConnection } from "./httpServerConnection";
import shapeType from "../types/shape";
import eventType from "../types/event";
import { canvas_arrow } from "../ourComponents/ShapFun";
import { canvas_line } from "../ourComponents/ShapFun";

export default async function DrawLogic(
  canvas: HTMLCanvasElement,
  roomId: string | number,
  socket: WebSocket,
  events: eventType,
  ctx: CanvasRenderingContext2D,
  startRecording: boolean
) {
  let startTime: number | null = null;
  let pauseStartTime: number | null = null;
  let pausetime: number = 0;

  if (!ctx) {
    return;
  }

  // Connecting to the HTTP server and getting back pre-existing chats/shapes
  const existingShapes: shapeType[] = await HttPServerConnection(roomId);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type == "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape);
      clearCanvasBoard(ctx, canvas.width, canvas.height);
    }
  };

  function clearCanvasBoard(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    console.log("cleared");
    ctx.clearRect(0, 0, width, height);

    // rendering the prev stored shapes
    existingShapes.map((shape) => {
      if (shape.type == "rect") {
        ctx.strokeStyle = shape.color;
        //@ts-ignore
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type == "circle") {
        ctx.beginPath();
        ctx.arc(
          //@ts-ignore
          shape.x,
          shape.y,
          shape.radius,
          shape.startAngle,
          shape.endAngle
        );
        ctx.strokeStyle = shape.color;
        ctx.stroke();
      } else if (shape.type == "arrow") {
        canvas_arrow(
          ctx,
          shape.fromx,
          shape.fromy,
          shape.tox,
          shape.toy,
          shape.color
        );
      } else if (shape.type == "line") {
        canvas_line(
          ctx,
          shape.startX,
          shape.startY,
          shape.endX,
          shape.endY,
          shape.color
        );
      } else if (shape.type == "pencil") {
        ctx.strokeStyle = shape.color;
        ctx.beginPath();
        ctx.moveTo(shape.path[0].x, shape.path[0].y);
        shape.path.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      } else if (shape.type === "any") {
        eval(shape.shape);
      }
    });
  }

  clearCanvasBoard(ctx, canvas.width, canvas.height);

  let baseTimestampOffset =
    events.current.length > 0
      ? events.current[events.current.length - 1].timestamp
      : 0;
  function recordEvent(type: string, data: { x: number; y: number }) {
    if (startTime === null) return;
    const timestamp = baseTimestampOffset + Date.now() - startTime - pausetime;
    events.current.push({ type, timestamp, data });
  }

  let isClickedOnCanvas = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isClickedOnCanvas = true;
    console.log("mousedown");
    if (startRecording.current) {
      if (startTime == null) {
        // writing first time
        startTime = Date.now();
        pausetime = 0;
      } else if (pauseStartTime != null) {
        pausetime = Date.now() - pauseStartTime - 1000; // i am adding 2 sec so ,that is take time to start new phase
        pauseStartTime = null;
      }
      recordEvent("start", { x: e.clientX, y: e.clientY });
    }

    startX = e.clientX;
    startY = e.clientY;
    if (window.currentShape) {
      currentPath.length = 0;
      currentPath.push({ x: startX, y: startY });
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    isClickedOnCanvas = false;
    console.log("mouseup");
    if (startRecording.current) {
      recordEvent("end", { x: e.clientX, y: e.clientY });
      pauseStartTime = Date.now();
      localStorage.setItem("Prev_Draw", JSON.stringify(events));
    }

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    let newShape;
    //@ts-ignore
    if (window.currentShape == "rect") {
      newShape = {
        type: "rect",
        color: window.CurrentColor,
        x: startX,
        y: startY,
        width,
        height,
      };
      //@ts-ignore
    } else if (window.currentShape == "circle") {
      const finalX = width + startX;
      const finalY = height + startY;
      const dist = Math.sqrt(
        Math.pow(finalX - startX, 2) + Math.pow(finalY - startY, 2)
      );

      newShape = {
        type: "circle",
        color: window.CurrentColor,
        x: startX,
        y: startY,
        radius: dist,
        startAngle: 0,
        endAngle: 2 * Math.PI,
      };
      //@ts-ignore
    } else if (window.currentShape == "arrow") {
      newShape = {
        type: "arrow",
        color: window.CurrentColor,
        fromx: startX,
        fromy: startY,
        tox: e.clientX,
        toy: e.clientY,
      };
      //@ts-ignore
    } else if (window.currentShape == "line") {
      newShape = {
        type: "line",
        color: window.CurrentColor,
        startX,
        startY,
        endX: e.clientX,
        endY: e.clientY,
      };
      //@ts-ignore
    } else if (window.currentShape == "pencil") {
      newShape = {
        type: "pencil",
        color: window.CurrentColor,
        path: currentPath,
      };
    }

    // send msg only when there is a msg
    if (window.currentShape != "") {
      const parsedShap = JSON.stringify(newShape);
      socket.send(
        JSON.stringify({
          type: "chat",
          roomId: roomId,
          message: parsedShap,
        })
      );
    }
  });

  const currentPath: { x: number; y: number }[] = [];

  canvas.addEventListener("mousemove", (e) => {
    if (isClickedOnCanvas) {
      console.log("mousemove");
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      
      if (startRecording.current) {
        recordEvent("draw", { x: e.clientX, y: e.clientY });
      }

      clearCanvasBoard(ctx, canvas.width, canvas.height);
      //@ts-ignore
      if (window.currentShape == "rect") {
        // Draw new rectangle
        ctx.strokeStyle = window.CurrentColor;
        ctx.strokeRect(startX, startY, width, height);
        //@ts-ignore
      } else if (window.currentShape == "circle") {
        const finalX = width + startX;
        const finalY = height + startY;
        const dist = Math.sqrt(
          Math.pow(finalX - startX, 2) + Math.pow(finalY - startY, 2)
        );
        ctx.beginPath();
        ctx.arc(startX, startY, dist, 0, 2 * Math.PI);
        ctx.strokeStyle = window.CurrentColor;
        ctx.stroke();
        //@ts-ignore
      } else if (window.currentShape == "arrow") {
        canvas_arrow(
          ctx,
          startX,
          startY,
          e.clientX,
          e.clientY,
          window.CurrentColor
        );
        //@ts-ignore
      } else if (window.currentShape == "line") {
        canvas_line(
          ctx,
          startX,
          startY,
          e.clientX,
          e.clientY,
          window.CurrentColor
        );
        //@ts-ignore
      } else if (window.currentShape == "pencil") {
        currentPath.push({ x: e.clientX, y: e.clientY });
        ctx.strokeStyle = window.CurrentColor;
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      }
    }
  });
}
