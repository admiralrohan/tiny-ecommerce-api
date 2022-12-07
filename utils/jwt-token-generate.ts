import jwt from "jsonwebtoken";
import { jwtExpiresIn, jwtSecret } from "../configs/config";
import { JwtPayload } from "../interfaces/jwt-payload";

export default function jwtTokenGenerate({
  userId,
  userType,
}: {
  userId: number;
  userType: string;
}) {
  if (!jwtSecret) throw new Error("JWT Secret is required");

  // Adding current time here to prevent chances of duplicate jwt for multiple users
  const jwtPayload: JwtPayload = {
    userId: userId.toString(),
    userType,
    time: Date.now(),
  };

  return jwt.sign(jwtPayload, jwtSecret, { expiresIn: jwtExpiresIn });
}
