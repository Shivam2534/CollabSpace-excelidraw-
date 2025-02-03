import { HttPServerConnection } from "./httpServerConnection";

interface shapeType {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default async function DrawLogic(
  canvas: HTMLCanvasElement,
  roomId: string | number,
  socket: WebSocket
) {
  console.log("Draw logic called");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  // Connecting to the HTTP server and getting back pre-existing chats/shapes
  // const existingShapes: shapeType[] = [];
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
    // Clear previous rectangle
    ctx.clearRect(0, 0, width, height);

    // rendering the prev stored shapes
    existingShapes.map((shape) => {
      if (shape.type == "rect") {
        ctx.strokeStyle = "white";
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }
    });
  }
  clearCanvasBoard(ctx, canvas.width, canvas.height);

  let isClickedOnCanvas = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isClickedOnCanvas = true;
    console.log("mousedown");

    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    isClickedOnCanvas = false;
    console.log("mouseup");
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    const newShape: shapeType = {
      type: "rect",
      x: startX,
      y: startY,
      width,
      height,
    };

    const parsedShap = JSON.stringify(newShape);
    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: roomId,
        message: parsedShap,
      })
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isClickedOnCanvas) {
      console.log("mousemove");
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvasBoard(ctx, canvas.width, canvas.height);

      // Draw new rectangle
      ctx.strokeStyle = "white";
      ctx.strokeRect(startX, startY, width, height);
    }
  });
}
