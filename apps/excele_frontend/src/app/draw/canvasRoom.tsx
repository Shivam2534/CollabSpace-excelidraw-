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

export default function CanvasRoom({ roomId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentShape, setcurrentShape] = useState("rect");
  const [activated, setactivated] = useState("rect");

  const [openColorPanal, setopenColorPanal] = useState(true);
  const [CurrentColor, setCurrentColor] = useState("white");

  const { loading, socket } = useSocket();
  useEffect(() => {
    //@ts-ignore
    window.currentShape = currentShape;
    //@ts-ignore
    window.CurrentColor = CurrentColor;
    console.log("color-", CurrentColor);
  }, [currentShape, setcurrentShape, CurrentColor]);

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
  }, [loading, socket, roomId]);

  function changeShape(shape: string) {
    setactivated(shape);
    setcurrentShape(shape);
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
      <div>
        <div
          className="fixed top-0 left-20 text-white bg-[#363541] w-auto h-14 z-50 flex items-center gap-2 rounded-xl px-2 overflow-hidden m-5"
          //@ts-ignore
          onMouseEnter={() => (canvasRef.current.style.pointerEvents = "none")}
          //@ts-ignore
          onMouseLeave={() => (canvasRef.current.style.pointerEvents = "auto")}
        >
          <Button
            onClick={() => changeShape("rect")}
            className={`${activated == "rect" ? "text-red-400" : "text-white"}`}
          >
            <RectangleHorizontal />
          </Button>
          <Button
            onClick={() => changeShape("circle")}
            className={`${activated == "circle" ? "text-red-400" : "text-white"}`}
          >
            <Circle />
          </Button>
          <Button
            onClick={() => changeShape("pencil")}
            className={`${activated == "pencil" ? "text-red-400" : "text-white"}`}
          >
            <Pencil />
          </Button>
          <Button
            onClick={() => changeShape("arrow")}
            className={`${activated == "arrow" ? "text-red-400" : "text-white"}`}
          >
            <ArrowUp />
          </Button>
          <Button
            onClick={() => changeShape("line")}
            className={`${activated == "line" ? "text-red-400" : "text-white"}`}
          >
            <Minus />
          </Button>
        </div>
        <div className=" fixed top-0 left-0 text-white bg-[#363541] w-16 h-14 z-50 flex items-center gap-2 rounded-xl px-2 overflow-hidden m-5">
          <Button
            className={`text-white`}
            onClick={() => setopenColorPanal((prev) => !prev)}
          >
            <Menu />
          </Button>
        </div>
      </div>

      <div
        className={`${openColorPanal ? "block" : "hidden"} rounded-xl left-5 px-2 py-1 absolute top-32 w-20 h-auto bg-[#363541] flex flex-wrap justify-center items-center`}
      >
        <div className=" flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-red-500 hover:bg-red-500"
            onClick={() => setCurrentColor("red")}
          ></Button>
          <Button
            className="w-8 h-8 bg-red-300  hover:bg-red-300"
            onClick={() => setCurrentColor("light red")}
          ></Button>
        </div>
        <div className=" flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-green-500  hover:bg-red-500"
            onClick={() => setCurrentColor("green")}
          ></Button>
          <Button
            className="w-8 h-8 bg-yellow-400  hover:bg-yellow-400"
            onClick={() => setCurrentColor("yellow")}
          ></Button>
        </div>
        <div className=" flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-white  hover:bg-white "
            onClick={() => setCurrentColor("white")}
          ></Button>
          <Button
            className="w-8 h-8 bg-pink-500  hover:bg-pink-500"
            onClick={() => setCurrentColor("pink")}
          ></Button>
        </div>
        <div className=" flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-blue-600  hover:bg-blue-600"
            onClick={() => setCurrentColor("blue")}
          ></Button>
          <Button
            className="w-8 h-8 bg-blue-300  hover:bg-blue-300"
            onClick={() => setCurrentColor("light blue")}
          ></Button>
        </div>
        <div className=" flex justify-between p-1 gap-1">
          <Button
            className="w-8 h-8 bg-blue-400  hover:bg-blue-400"
            onClick={() => setCurrentColor("blue")}
          ></Button>
          <Button
            className="w-8 h-8 bg-fuchsia-300  hover:bg-fuchsia-300"
            onClick={() => setCurrentColor("fuchsia")}
          ></Button>
        </div>
      </div>
    </div>
  );
}
