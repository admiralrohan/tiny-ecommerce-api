import jwt from "jsonwebtoken";
import { jwtExpiresIn, jwtSecret } from "../configs/config";

export default function jwtTokenGenerate(userId: number) {
  if (!jwtSecret) throw new Error("JWT Secret is required");

  return jwt.sign({ id: userId.toString(), time: Date.now() }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}
