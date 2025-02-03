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
// *************************************************************************
const app = express();

app.use(cors());
app.use(express.json());

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
  console.log(name,email,password)
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
});

app.post("/api/v1/create-room", middleware, async (req, res) => {
  console.log("request reached at /v1/create-room endpoint");

  const parsedData = createRoomSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(402).json({
      message: "Invalid inputs",
      success: false,
    });
  }
  const { roomName } = parsedData.data;

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: roomName,
        //@ts-ignore
        adminId: req.userId,
      },
    });
    if (!room) {
      return res.status(500).json({
        message: "Server Error!! (Note: try again or after something)",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Room created successfully",
      success: true,
      //@ts-ignore
      roomId: room.id,
    });
  } catch (error) {
    return res.status(402).json({
      message: "Room must be unique. (NOTE: Use diffrent roon name!)",
      success: false,
      error: error,
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
        id: "desc",
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

app.listen(3001);
