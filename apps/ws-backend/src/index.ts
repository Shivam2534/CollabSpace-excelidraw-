import WebSocket, { WebSocketServer } from "ws";
import jwt, { decode, JwtPayload } from "jsonwebtoken";
import { JWT_SECRETE } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

//we are managing in a gloabal state
interface userType {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}
const allUsers: userType[] = [];

function verifyUser(token: string): string | null {
  try {
    const secrete = JWT_SECRETE;
    if (!secrete) {
      return null;
    }
    const decodedToken = jwt.verify(token, secrete);
    if (!decodedToken) {
      return null;
    }

    //@ts-ignore
    return decodedToken.userId;
  } catch (error) {
    return null;
  }
}

wss.on("connection", function connection(ws, req) {
  console.log("New connection made");
  ws.on("error", console.error);
  // extracting token which we are going to send in URl
  const url = req.url;

  const queryParam = new URLSearchParams(url?.split("?")[1]);
  const token = queryParam.get("token") || "";
  const userId = verifyUser(token);
  console.log("userId-->", userId);
  if (userId == null) {
    ws.close();
    return;
  }

  ws.on("message", async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }
    /* 
     when user JOIN the room:
     {
       "type": "join_room",
       "roomId":"chat-room1"
     }
     */
    if (parsedData.type === "join_room") {
      // check user already exist or not in the users list
      const user = allUsers.find((user) => user.ws == ws);

      // if join first time
      if (!user) {
        const newUser = {
          //@ts-ignore
          userId: userId,
          rooms: [parsedData.roomId],
          ws: ws,
        };
        allUsers.push(newUser);
      } else {
        // already a part of any room
        user?.rooms.push(parsedData.roomId);
      }

      console.log("joined successfull", allUsers.length);
    }

    /* 
     when user LEAVE the room:
     {
       "type": "leave_room",
       "roomId":"chat-room1"
     }
     */
    if (parsedData.type === "leave_room") {
      // check user already exist or not in the users list
      const user = allUsers.find((user) => user.ws === ws);

      if (!user) {
        return;
      }

      // remove the roomId from rooms array of user
      user.rooms = user?.rooms.filter((roomid) => roomid !== parsedData.roomId);
      console.log(
        `leaving ${parsedData.roomId} room successfull`,
        allUsers.length,
        allUsers[0]?.rooms.length
      );
    }

    /* 
     when user CHAT in a room:
     {
       "type": "chat",
       "roomId":"chat-room1",
       "message": "hii_room"
     }
     */

    try {
      if (parsedData.type === "chat" && parsedData.message.length > 0) {
        //Optimse it by using queue (IMP)
        await prismaClient.chat.create({
          data: {
            //@ts-ignore
            userId: userId,
            message: parsedData.message,
            roomId: Number(parsedData.roomId),
          },
        });

        allUsers.map((user) => {
          const isPresent = user.rooms.includes(parsedData.roomId);
          if (isPresent) {
            user.ws.send(
              JSON.stringify({
                type: "chat",
                roomId: parsedData.roomId,
                message: parsedData.message,
              })
            );
          }
        });
      }
    } catch (error) {
      console.log("Error while chat:", error);
    }
  });
});
