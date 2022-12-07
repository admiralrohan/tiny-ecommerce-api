import { Request, Response, Router } from "express";
import Products from "../models/product";
import Users from "../models/users";

const router = Router();

router.post("/create-catalog", async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    const matchingProducts = await Products.query()
      .whereIn("id", products)
      .andWhere({ ownerId: res.userId });

    // It also covers the case where user tries to add non-existent product
    if (matchingProducts.length !== products.length)
      throw new Error("You can only add your products to the catalog");

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
