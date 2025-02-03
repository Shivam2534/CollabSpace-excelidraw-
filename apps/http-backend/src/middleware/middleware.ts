import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {JWT_SECRETE} from '@repo/backend-common/config'

export function middleware(req: Request, res: Response, next: NextFunction) {
  console.log("request is at the middleware");
  // extracting the token from header
  const token = req.headers["authorization"] ?? "";

  if (!token) {
    res.status(402).json({
      message: "Unothorised access",
      success: false,
    });
  }

  const secrete = JWT_SECRETE;
  console.log(secrete);
  if (!secrete) {
    res.status(403).json({
      message: "Wrong credentials",
      success: false,
    });
  } else {
    try {
      const decodedToken = jwt.verify(token, secrete);
      if (decodedToken) {
        // @ts-ignore: TODO: Fix this
        req.userId = decodedToken.userId;
        next();
      } else {
        res.status(403).json({
          message: "Unauthorized",
        });
      }
    } catch (error) {
      console.log("error while validating user token", error);
    }
  }
}
