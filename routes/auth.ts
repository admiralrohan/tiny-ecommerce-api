import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userTypes } from "../configs/constants";
import Tokens from "../models/tokens";
import Users from "../models/users";
import jwtTokenGenerate from "../utils/jwt-token-generate";
// import { jwtSecret, saltRounds } from "../configs/config";

const router = Router();

export const jwtSecret = process.env.JWT_SECRET;
export const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "30d";

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword, type } = req.body;

    if (!username) throw new Error("Username is required");
    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    if (password !== confirmPassword) throw new Error("Passwords should match");
    if (!userTypes.includes(type)) throw new Error("Invalid user type");

    const existingUser = await Users.query().where({ email, type });
    if (existingUser.length > 0) {
      throw new Error(`This email is already used for ${type} type`);
    }

    const hashedPwd = await bcrypt.hash(password, saltRounds);

    const insertedUser = await Users.query().insert({
      username,
      email,
      password: hashedPwd,
      type,
      createdAt: new Date(),
    });

    if (insertedUser.id) {
      // For security reasons
      const user: Partial<Users> = insertedUser;
      delete user.password;

      res.status(200).json({
        success: true,
        message: "User registration successful",
        data: { user },
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: "Couldn't register user",
        error: error.message,
      });
    }
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, type } = req.body;

    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    if (!userTypes.includes(type)) throw new Error("Invalid user type");

    const result = await Users.query().where({ email, type });
    if (result.length !== 1) throw new Error("No user found");

    const [user] = result;
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) throw new Error("Email or password mismatch");

    const token = jwtTokenGenerate(user.id);
    await Tokens.query().insert({
      userId: user.id,
      token,
      loggedInAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: "Couldn't login user",
        error: error.message,
      });
    }
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    if (!req.header("Authorization")) throw new Error("Auth token missing");
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("Token is required");
    if (!jwtSecret) throw new Error("JWT Secret is required");
    const decoded = jwt.verify(token, jwtSecret);
    const userId = (decoded as any).id;

    const result = await Tokens.query()
      .patch({
        loggedOutAt: new Date(),
      })
      .where({
        userId,
        token,
        loggedOutAt: null,
      });

    if (!result) throw new Error();

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: "Couldn't logout user",
        error: error.message,
      });
    }
  }
});

export default router;
