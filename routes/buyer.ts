import { Request, Response, Router } from "express";
import Products from "../models/product";
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

/**
 * Return product IDs
 */
router.get(
  "/seller-catalog/:seller_id",
  async (req: Request, res: Response) => {
    try {
      const { seller_id: sellerId } = req.params;
      const userDetails = await Users.query()
        .select("catalog", "type")
        .findById(sellerId);

      if (!userDetails) throw new Error("User not found");

      const { catalog: productIds, type: userType } = userDetails;
      if (userType !== "seller") throw new Error("User is not a seller");

      const productList = await Products.query().whereIn("id", productIds);

      res.json({
        success: true,
        message: "Fetched seller catalog successfully",
        data: {
          catalog: productList,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: "Couldn't fetch catalog",
          error: error.message,
        });
      }
    }
  }
);

router.post("/create-order/:seller_id", (req: Request, res: Response) => {
  // TODO: Exclude own products
  res.json({ success: true, message: "Order creation successful" });
});

export default router;
