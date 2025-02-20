import axios from "axios";
import { HTTP_BACKEND_URL } from "@repo/common/types";
import { ChatRoomClient } from "./chatRoomClient";

async function getAllChatsOfRoom(roomId: number) {
  console.log("roomId-->",roomId)
  const res = await axios.get(`${HTTP_BACKEND_URL}/api/v1/chats/${roomId}`);
  return res.data.messages;
}

export async function ChatRoomServer() {
  const messages = await getAllChatsOfRoom(13);
  return <ChatRoomClient messages={messages} />;
}
