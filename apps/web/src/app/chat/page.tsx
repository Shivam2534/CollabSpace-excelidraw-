import { HTTP_BACKEND_URL } from "@repo/common/types";
import { ChatRoomClient } from "./chatRoomClient";
import { cache } from "react";

async function getAllChatsOfRoom(roomId: number) {
  try {
    const res = await fetch(`${HTTP_BACKEND_URL}/api/v1/chats/${roomId}`, {
      cache: "force-cache", // Cache results for performance
      next: { revalidate: 60 }, // Revalidate data every 60 seconds
    });
    const data = await res.json();
    return data.messages;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
}
export const cachedGetAllChatsOfRoom = cache(getAllChatsOfRoom);

type paramsType = {
  searchParams: { roomid: number; username: string; user: string };
};
async function ChatRoomServer({ searchParams }: paramsType) {
  const roomid = searchParams.roomid ? searchParams.roomid : null;
  const username = searchParams.username || "Guest"; // Default username if not provided
  let user = null;

  if (searchParams.user) {
    try {
      user = JSON.parse(decodeURIComponent(searchParams.user));
    } catch (error) {
      console.log("Error while Decoding user at server:", error);
      return;
    }
  }

  if (roomid === null) {
    alert("roomId not found");
    return;
  }

  const messages = await cachedGetAllChatsOfRoom(roomid);
  return (
    <ChatRoomClient
      messages={messages}
      username={username}
      roomid={roomid}
      user={user}
    />
  );
}

export default ChatRoomServer;
