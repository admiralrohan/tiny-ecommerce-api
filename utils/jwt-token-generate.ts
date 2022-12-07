import jwt from "jsonwebtoken";
import { jwtExpiresIn, jwtSecret } from "../configs/config";

export default function jwtTokenGenerate({
  userId,
  userType,
}: {
  userId: number;
  userType: string;
}) {
  if (!jwtSecret) throw new Error("JWT Secret is required");

  // Using current time here to prevent chances of duplicate jwt for multiple users
  return jwt.sign(
    { userId: userId.toString(), userType, time: Date.now() },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
    }
  );
}
