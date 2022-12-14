import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../configs/config";
import { JwtPayload } from "../interfaces/jwt-payload";
import Tokens from "../models/tokens";

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
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const { userId, userType } = decoded;

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
