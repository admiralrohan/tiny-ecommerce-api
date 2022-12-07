import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../configs/config";

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.header("Authorization")) throw new Error("Auth token missing");
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new Error("Token is required");
  if (!jwtSecret) throw new Error("JWT Secret is required");
  const decoded = jwt.verify(token, jwtSecret);
  const userId = (decoded as any).id;

  (res as any).userId = userId;
  (res as any).token = token;

  next();
}
