import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { middleware } from "./middleware/middleware";
import { JWT_SECRETE } from "@repo/backend-common/config";
import {
  createNewUserSchema,
  signinSchema,
  createRoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

// *************************************************************************
const app = express();

app.use(cors());
app.use(express.json());
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/v1/signup", async (req, res) => {
  console.log("request reached at /v1/signup endpoint");
  //verify data is not empty
  const parsedData = createNewUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(402).json({
      message: "Invalid Inputs",
      success: false,
    });
  }
  const { name, email, password } = parsedData.data;
  console.log(name, email, password);
  //check in the db (should not present in the db)
  const user = await prismaClient.user.findUnique({
    where: {
      email: email,
    },
  });
  if (user) {
    return res.status(402).json({
      message: "Email already in use (NOTE: use any other email)",
      success: false,
    });
  }

  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  //create an entry for the new user
  const newUser = await prismaClient.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      avatar: null,
    },
  });
  if (!newUser) {
    return res.status(501).json({
      message:
        "Something wrong happed while creating new user. (NOTE: create account again or try again after sometime)",
      success: false,
    });
  }

  res.status(200).json({
    message: "done",
    success: true,
    data: newUser,
  });
});

app.post("/api/v1/signin", async (req, res) => {
  console.log("request reached at /v1/signin endpoint");
  const parsedData = signinSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(402).json({
      message: "Invalid Inputs",
      success: false,
    });
  }
  const { email, password } = parsedData.data;
  // check into the db , is user exist or not (only come down if user in the db)
  const user = await prismaClient.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res.status(404).json({
      message: "Account not found, please create account!!!s",
      success: false,
    });
  }

  // check the password
  const isPasswordCorrect = bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      message: "Wrong Password!!",
      success: false,
    });
  }
  // assing the JWT token
  const secrete = JWT_SECRETE;
  const userId = user.id;
  const jwtToken = jwt.sign({ userId }, secrete ?? "xyz");

  const data = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  res.status(200).json({
    message: "done",
    success: true,
    data: data,
    token: jwtToken,
  });

  // update user table with the accesstoken
  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      accesstoken: jwtToken,
    },
  });

  console.log("updated user-", updatedUser);
});

app.post("/api/v1/create-room", middleware, async (req, res) => {
  console.log("request reached at /v1/create-room endpoint");
  const parsedData = createRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(200).json({
      message: "Invalid inputs",
      success: false,
    });
  }

  const { roomName } = parsedData.data;
  console.log(roomName);
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: roomName,
        //@ts-ignore
        adminId: req.userId,
      },
    });

    if (!room) {
      return res.status(200).json({
        message: "Server Error!! (Note: try again or after something)",
        success: false,
        status: 500,
      });
    }

    return res.status(200).json({
      message: "Room created successfully",
      success: true,
      //@ts-ignore
      roomId: room.id,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      message: "Room must be unique. (NOTE: Use diffrent roon name!)",
      success: false,
      error: error,
      status: 402,
    });
  }
});

app.get("/api/v1/chats/:roomId", async (req, res) => {
  console.log("request reached at load chats");
  try {
    const roomId = Number(req.params.roomId);
    console.log(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "asc",
      },
      take: 50,
    });

    res.json({
      messages,
    });
  } catch (e) {
    console.log(e);
    res.json({
      messages: [],
    });
  }
});

app.get("/api/v1/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: {
      slug,
    },
  });

  res.json({
    room,
  });
});

app.get("/api/v1/findallrooms", middleware, async (req, res) => {
  console.log("request reached at api/v1/findallrooms");

  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        //@ts-ignore
        adminId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("we");
    if (!rooms) {
      return res.status(200).json({
        success: false,
        message: "You have not create any room yet.",
      });
    }

    return res.status(200).json({
      rooms,
      success: true,
      message: "all rooms fetched successfully",
    });
  } catch (error) {
    console.log("we got error -", error);
    return res.status(200).json({
      success: false,
      message: "Error while fetching all rooms data",
      status: 403,
    });
  }
});

app.post("/api/v1/checkroom", middleware, async (req, res) => {
  console.log("request reached at /api/v1/checkroom");

  const { roomId } = req.body;
  console.log(roomId);

  if (!roomId) {
    return res.status(200).json({
      success: false,
      message: "enter correct id",
    });
  }

  const room = await prismaClient.room.findUnique({
    where: {
      id: Number(roomId),
    },
  });

  if (!room) {
    return res.status(200).json({
      success: false,
      message: "Room does'nt exist with the provided RoomID",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Room Exist",
  });
});

//Chat with AI
app.post("/api/v1/chat", middleware, async (req, res) => {
  if (req.method === "POST") {
    const { prompt } = req.body;
    console.log("prompt-", prompt);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            role: "user",
            content: `
            USER PROMPT- ${prompt}
            You're a Canvas shape drawer. Use ctx to draw the specified shape. No Math.random or dynamic functions. Use server-provided literal values for unspecified details:
           
            - Position:random value between x (0-1280), y (0-720)
            - Size:width/height/length random value between(50-200), radius random value between(25-100)
            - Border: strictly use white color for border, no fill unless requested

            Supported shapes: rectangle, square, circle, ellipse, triangle, polygon, and line (or any shape specified by the user).
            1. don't wrap the code inside anything.
            2. Draw user-specified shape. Return only drawing commands with literal values. No variables, comments, or code blocks. Ensure each generation places the shape at a different location within canvas bounds. Double-check output against requirements.
            3. on every request make nsew shape , don't use previous data
            4. don't use Math.random() function or dynamic values
            5. before returning response , always recheck shape , it should follow all the requirements

            replace this [SHAPE_DRAWING_CODE] part of code to make user prompted shape everytime with new coordinates and features.
            6. (important and strictly follow this)on every request response should be same in this formate only nothing else, no metter how many times user made a request.
            7. also don't wrap in Backtick also.

            ctx.strokeStyle = '[replace according to prompt, default white]';
            ctx.beginPath();
            [SHAPE_DRAWING_CODE]
            ctx.stroke();
            
            `,
          },
        ],
      });
      // console.log(completion);
      const shape = completion.choices[0]?.message.content;
      console.log("completion:", shape);

      if (!shape) {
        res.status(200).json({
          message: "shape can not created",
          success: false,
        });
      }

      res.status(200).json({ success: true, shape });
    } catch (error) {
      console.error("Error generating UI:", error);
      res.status(500).json({ error: "Failed to generate UI" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
});

app.listen(3001);
