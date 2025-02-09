import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
function Recording({
  toggleRecording,
  recording,
  setReplayFlag,
  replaying,
  eventLen,
}: {
  toggleRecording: any;
  recording: any;
  setReplayFlag: any;
  replaying: any;
  eventLen: any;
}) {
  function DeleteLocalRecording() {
    localStorage.removeItem("Prev_Draw");
  }

  return (
    <div className="absolute bottom-7 left-5 flex">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className=" bg-black" onClick={DeleteLocalRecording}>
              <Trash2 className=" text-red-500 text-3xl" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete local recording... </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className=" flex gap-2">
        <Button onClick={toggleRecording} className="bg-[#363541] px-2 py-1">
          {recording ? (
            <span className="text-red-600">Stop Rec.</span>
          ) : (
            <span>Start Rec.</span>
          )}
        </Button>
        <Button className="bg-[#363541] px-2 py-1">
          {replaying ? (
            <span className="text-red-400" onClick={() => setReplayFlag(false)}>
              Pause
            </span>
          ) : (
            <span
              onClick={() => {
                // Trigger replay only if not recording and there are recorded events
                if (!recording) {
                  setReplayFlag(true);
                }
              }}
            >
              Re-play
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default Recording;
