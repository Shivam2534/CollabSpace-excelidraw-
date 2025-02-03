import { z } from "zod";

export const createNewUserSchema = z.object({
  email: z
    .string()
    .min(4, { message: "Username length must be more than 4 character" })
    .max(20, { message: "Username length must be less than 20 character" }),
  password: z.string().min(3),
  name: z.string(),
});

export const signinSchema = z.object({
  email: z
    .string()
    .min(4, { message: "Username length must be more than 4 character" })
    .max(20, { message: "Username length must be less than 20 character" }),
  password: z.string().min(3),
});

export const createRoomSchema = z.object({
  roomName: z.string(),
});

export const HTTP_BACKEND_URL = "http://localhost:3001";
export const WS_BACKEND_URL = "http://localhost:8080";
