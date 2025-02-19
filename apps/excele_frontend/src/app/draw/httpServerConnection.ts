import axios from "axios";
import { HTTP_BACKEND_URL } from "@repo/common/types";
export async function HttPServerConnection(roomId: string | number) {
  const res = await axios.get(`${HTTP_BACKEND_URL}/api/v1/chats/${roomId}`);

  const messages = res.data.messages;
  console.log("messages-->", messages);
  //@ts-ignore
  const parsedMessages = messages.map((message) => {
    return JSON.parse(message.message);
  });
  console.log("parsedMessages messages-->", parsedMessages);

  return parsedMessages;
}
