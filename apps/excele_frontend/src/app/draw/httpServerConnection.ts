import axios from "axios";
import { HTTP_BACKEND_URL } from "@repo/common/types";
export async function HttPServerConnection(roomId: string | number) {
  console.log("roomId reache to httpServer component");
  
  const res = await axios.get(`${HTTP_BACKEND_URL}/api/v1/chats/${roomId}`);
  console.log("http-res->", res.data);

  const messages = res.data.messages;
  console.log("messages-",messages)
  const parsedMessages = messages.map((message) => {
    console.log("message00-",message)
    return JSON.parse(message.message);
  });
  console.log("parsedMessages-",parsedMessages)
  //   return res.data.messages;
  return parsedMessages;
}
