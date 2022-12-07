import { NextFunction, Request, Response } from "express";

/**
 * Expected to called after `verifyToken` middleware. So it can get `userType`
 */
export async function allowIfBuyer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (res.userType !== "buyer")
      throw new Error("Route is only available for buyers");

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
