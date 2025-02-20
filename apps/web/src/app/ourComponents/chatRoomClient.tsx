"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "@repo/common/hooks";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ChatRoomClient(messages: any) {
  const [chats, setChats] = useState(messages.messages || []);
  const inputRef = useRef(null);
  const { loading, socket } = useSocket();

  useEffect(() => {
    if (!loading && socket) {
      socket.send(
        JSON.stringify({
          type: "join_chat_room",
          roomId: 13,
        })
      );

      socket.onmessage = (event) => {
        const parsedMsg = JSON.parse(event.data);
        if (parsedMsg.type === "chat_chat_room") {
          setChats((prevchat) => [
            ...prevchat,
            { message: parsedMsg.message, sender: parsedMsg.sender || "other" },
          ]);
        }
      };
    }
  }, [socket, loading]);

  function sendMsg() {
    const msg = inputRef.current.value;
    if (msg && socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat_chat_room",
          roomId: 13,
          message: msg,
          sender: "you",
        })
      );
      setChats((prevchat: any) => [
        ...prevchat,
        { message: msg, sender: "you" },
      ]);
      inputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-900 p-4">
      <div className="w-full max-w-xl bg-gray-800 text-white rounded-lg shadow-lg p-4 space-y-6">
        {/* Chat Header */}
        <div className="flex justify-between space-x-4">
          <div className=" flex gap-5">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-white">Sofia Davis</p>
              <p className="text-sm text-gray-400">m@example.com</p>
            </div>
          </div>
          {/* <Button className="ml-0 bg-gray-700 rounded-full p-1 hover:bg-gray-600">
            <Icon icon="mdi:plus" className="text-white w-5 h-5" />
          </Button> */}
        </div>

        {/* Chat Messages */}
        <div
          className=" max-h-[600px] overflow-y-auto border border-gray-700 rounded-lg p-3 space-y-2 bg-gray-900"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {chats.map((chat, ind) => (
            <div
              key={ind}
              className={`max-w-[80%] w-fit p-2 px-3 rounded-xl ${
                chat.sender === "you"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <p>{chat.message}</p>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className="w-full p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button
            type="button"
            onClick={sendMsg}
            className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none"
          >
            <Icon icon="mdi:send" className="text-white w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
