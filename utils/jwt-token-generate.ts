import jwt from "jsonwebtoken";
// import { jwtExpiresIn, jwtSecret } from "../configs/config";

export const jwtSecret = process.env.JWT_SECRET;
export const saltRounds = process.env.SALT_ROUNDS || 10;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "30d";

export default function jwtTokenGenerate(userId: number) {
  if (!jwtSecret) throw new Error("JWT Secret is required");

  return jwt.sign({ id: userId.toString(), time: Date.now() }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}
