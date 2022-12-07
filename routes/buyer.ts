import { Request, Response, Router } from "express";
import Users from "../models/users";

const router = Router();

router.get("/list-of-sellers", async (req: Request, res: Response) => {
  try {
    const listOfSellers = await Users.query()
      .select("id", "username", "email")
      .where({ type: "seller" });

    res.json({
      success: true,
      message: "Fetched list of sellers successfully",
      data: {
        listOfSellers,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: "Couldn't fetch list of sellers",
        error: error.message,
      });
    }
  }
});

router.get("/seller-catalog/:seller_id", (req: Request, res: Response) => {
  res.json({ success: true, message: "Fetched seller catalog successfully" });
});

router.post("/create-order/:seller_id", (req: Request, res: Response) => {
  res.json({ success: true, message: "Order creation successful" });
});

export default router;
