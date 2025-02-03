"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient(messages) {
  const [chats, setChats] = useState(messages.messages);
  const inputRef = useRef(null);
  const { loading, socket } = useSocket();

  useEffect(() => {
    if (!loading && socket) {
      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId: "3",
        })
      );

      socket.onmessage = (event) => {
        const parsedMsg = JSON.parse(event.data);
        if (parsedMsg.type === "chat") {
          setChats((prevchat) => [...prevchat, { message: parsedMsg.message }]);
        }
      };
    }
  }, [socket, loading]);

  function sendMsg() {
    const msg = inputRef.current.value;
    if (msg && socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat",
          roomId: "3",
          message: msg,
        })
      );
    }
  }

  return (
    <div>
      <div>
        {chats.map((chat, ind) => (
          <div key={ind}>{chat.message}</div>
        ))}
      </div>
      <div>
        <input ref={inputRef} type="text" placeholder="type msg..." />
        <button type="button" onClick={sendMsg}>
          Send
        </button>
      </div>
    </div>
  );
}
