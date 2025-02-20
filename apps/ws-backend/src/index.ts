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
interface chatUserType {
  userId: string;
  rooms: string[];
  ws: WebSocket;
  username: string;
}
const allUsers: userType[] = [];
const chatAllUsers: chatUserType[] = [];

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

    // *******************************************************
    /*  FROM THIS , CODE OF CHAT (NOT CANVAS CHAT) STARTS    */
    // *******************************************************
    /* 
     when user JOIN chat room:
     {
       "type": "join_chat_room",
       "username":"shivam"
       "roomId":"chat-room1" // number most prob.
     }
     */
    if (parsedData.type == "join_chat_room") {
      try {
        // check that , is user already present in the chatAllUsers list or not
        const user = chatAllUsers.find((user) => user.ws == ws);

        // we are allowed to talk in a multiple rooms at a same time
        if (user) {
          user.rooms.push(parsedData.roomId);
        } else {
          // means join for the first time
          const newUser = {
            userId: userId,
            rooms: [parsedData.roomId],
            ws: ws,
            username: parsedData.username,
          };
          chatAllUsers.push(newUser);
        }
        console.log("user join in a CHAT room,", chatAllUsers.length);
      } catch (error) {
        console.log("Error while joining CHAT room:", error);
      }
    }

    /* 
     when user Leave chat room:
     {
       "type": "leave_chat_room",
       "roomId":"8" 
     }
     */
    if (parsedData.type == "leave_chat_room") {
      try {
        // check is user exist or not
        const user = chatAllUsers.find((user) => user.ws == ws);

        if (!user) {
          return;
        }

        user.rooms = user.rooms.filter((room) => room !== parsedData.roomId);

        console.log(
          `user leaved successfully from room-${parsedData.roomId},`,
          user.rooms.length
        );
      } catch (error) {
        console.log("Error while leaving CHAT room:", error);
      }
    }

    /* 
     when user CHAT in room:
     {
       "type": "chat_chat_room",
       "username":"shivam",
       "message":"hii",
       "roomId":"8" 
     }
     */
    if (parsedData.type == "chat_chat_room") {
      try {
        await prismaClient.chat.create({
          data: {
            //@ts-ignore
            userId: userId,
            message: parsedData.message,
            roomId: Number(parsedData.roomId),
            username: parsedData.username || "any",
          },
        });
        // now we need to emit the message to the respective room
        chatAllUsers.map((user) => {
          if (user.ws !== ws) {
            user.rooms.find((room) => {
              if (room === parsedData.roomId) {
                // means this user is a part of this room, send this mesg to it
                user.ws.send(
                  JSON.stringify({
                    type: "chat_chat_room",
                    username: parsedData.username,
                    message: parsedData.message,
                    roomId: parsedData.roomId,
                  })
                );
              }
            });
          }
        });
      } catch (error) {
        console.log("Error while  CHAT in  chat room:", error);
      }
    }
  });
});
