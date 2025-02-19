"use client";

import { useState } from "react";
import { Link, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function ShareOnCanvas({ roomId }: { roomId: number }) {
  const [openShareModal, setOpenShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStartSession = () => {
    // Implement your session start logic here
    console.log("Starting session for room:", roomId);
  };

  const handleExportLink = () => {
    // Implement your link export logic here
    const link = `http://localhost:3002/canvas/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        onClick={() => setOpenShareModal(true)}
        className="absolute top-5 right-5 bg-[#A8A5FF] hover:bg-[#908ec6] text-black font-medium"
      >
        Share
      </Button>

      {/* Modal Overlay */}
      {openShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm" // bg-black/50
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenShareModal(false);
          }}
        >
          {/* Modal Content */}
          <div className="relative w-full max-w-md mx-4 bg-[#1C1C1C] rounded-xl p-8 space-y-8 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setOpenShareModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Live Collaboration Section */}
            <div className="space-y-4 text-center">
              <h2
                className="text-2xl font-semibold text-[#A8A5FF]"
                style={{
                  textShadow: "0 0 20px rgba(168, 165, 255, 0.3)",
                }}
              >
                Live collaboration
              </h2>
              <p className="text-gray-300">
                Invite people to collaborate on your drawing.
              </p>
              <p className="text-sm text-gray-400 px-4">
                Don't worry, the session is end-to-end encrypted, and fully
                private. Not even our server can see what you draw.
              </p>
              <Button
                className=" disabled cursor-not-allowed w-full bg-[#A8A5FF] hover:bg-[#908ec6] text-black font-medium py-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                // onClick={handleStartSession}
              >
                <Play className="w-4 h-4 mr-2" />
                Start new room
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-gray-400 bg-[#1C1C1C]">
                  Or
                </span>
              </div>
            </div>

            {/* Shareable Link Section */}
            <div className="space-y-4 text-center">
              <h2
                className="text-2xl font-semibold text-[#A8A5FF]"
                style={{
                  textShadow: "0 0 20px rgba(168, 165, 255, 0.3)",
                }}
              >
                Shareable link
              </h2>
              <p className="text-gray-300">Export as a read-only link.</p>
              <Button
                className={`
                  w-full bg-[#A8A5FF] hover:bg-[#908ec6] text-black font-medium py-6 
                  rounded-lg transition-all duration-200 transform 
                  hover:scale-[1.02] active:scale-[0.98]
                  ${copied ? "bg-green-500 hover:bg-green-600" : ""}
                `}
                onClick={handleExportLink}
              >
                <Link className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Click to copy link"}
              </Button>
            </div>

            {/* Additional Features */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Room ID: {roomId} • Secure Connection
              </p>
            </div>

            {/* Modal Animation Styles */}
            <style jsx>{`
              @keyframes modalFadeIn {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              .modal-content {
                animation: modalFadeIn 0.3s ease-out;
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
}

export default ShareOnCanvas;
