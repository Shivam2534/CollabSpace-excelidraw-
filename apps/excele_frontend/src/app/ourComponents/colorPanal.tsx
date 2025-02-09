import { Button } from "@/components/ui/button";
import React from "react";

type ColrpanelType = {
  setCurrentColor: any;
  openColorPanal: any;
};
function ColorPanal({ setCurrentColor, openColorPanal }: ColrpanelType) {
  return (
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
  );
}

export default ColorPanal;
