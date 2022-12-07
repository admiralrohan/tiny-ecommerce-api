import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../configs/config";
import Tokens from "../models/tokens";

interface JwtPayload {
  userId: string;
  userType: string;
  time: number;
}

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.header("Authorization")) throw new Error("Auth token missing");
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("Token is required");
    if (!jwtSecret) throw new Error("JWT Secret is required");
    const decoded = jwt.verify(token, jwtSecret);
    const { userId, userType } = decoded as JwtPayload;

    res.userId = Number(userId);
    res.token = token;
    res.userType = userType;

    const result = await Tokens.query().findOne({
      userId,
      token,
      loggedOutAt: null,
    });
    if (!result) throw new Error("Token not found");

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        error: error.message,
      });
    }
  }
}
