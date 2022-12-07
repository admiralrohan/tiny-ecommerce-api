import { Request, Response, Router } from "express";
import Users from "../models/users";

const router = Router();

router.post("/create-catalog", async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    // TODO: Check if all products belong to the seller
    const insertedResult = await Users.query().findById(res.userId).patch({
      catalog: products,
    });

    if (!insertedResult) throw new Error("DB insertion failed");

    res.json({
      success: true,
      message: "Created seller catalog",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: "Couldn't create new catalog",
        error: error.message,
      });
    }
  }
});

router.get("/orders", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Fetched list of received orders successfully",
  });
});

export default router;
