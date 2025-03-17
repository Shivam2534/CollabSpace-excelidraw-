import React, { useState } from "react";
import { ShareIcons } from "../share icons/ShareIcons";

function Video_Call_Invite() {
  const [isCallStarted, setisCallStarted] = useState(false);
  const [toggleShareDropDown, settoggleShareDropDown] = useState(false);
  function startVideoCall() {
    setisCallStarted((p) => !p);
    settoggleShareDropDown((p) => !p);
    // window.open("https://zoom-meeting-app-amz4.vercel.app/", "_blank");
  }

  return (
    <div className="lg:w-1/4 mt-8 lg:mt-0 flex flex-col gap-5">
      {/* Upper Box - Watch Together */}
      <div
        className={`bg-gray-800 rounded-lg p-4 mb-6 transition-all duration-300 ${
          isCallStarted ? "order-2" : "order-1"
        }`}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Watch Together
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Invite friends to watch and video chat at the same time.
        </p>
        <button
          onClick={startVideoCall}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition-colors"
        >
          {isCallStarted ? "End Video Call" : "Start Video Call"}
        </button>

        <div
          className={`${
            isCallStarted || toggleShareDropDown ? "block" : "hidden"
          } h-14 mt-4 rounded-md flex items-center p-2`}
        >
          <ShareIcons />
        </div>

        <div className="mt-6 border-t border-gray-700 pt-4">
          <h4 className="font-medium mb-2">Friends Online</h4>
          <div className="space-y-3">
            {["Harsh"].map((friend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2">
                    <span className="text-xs">{friend.charAt(0)}</span>
                  </div>
                  <span>{friend}</span>
                </div>
                <button
                  onClick={() => settoggleShareDropDown((p) => !p)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                >
                  Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Box - iFrame */}
      <div
        className={`transition-all duration-300 ${
          isCallStarted ? "order-1" : "order-2"
        }`}
      >
        {isCallStarted && (
          <iframe
            src="https://zoom-meeting-app-amz4.vercel.app/sender"
            style={{ width: "100%", height: "500px", border: "none" }}
            allow="camera; microphone"
          />
        )}
      </div>
    </div>
  );
}

export default Video_Call_Invite;
