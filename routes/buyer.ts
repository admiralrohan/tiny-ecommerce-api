import { Request, Response, Router } from "express";
import Orders from "../models/order";
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

      // eg. If user passes string instead of number
      if (isNaN(Number(sellerId))) throw new Error("Invalid seller_id");

      const userDetails = await Users.query()
        .select("catalog", "type")
        .findById(Number(sellerId));

      if (!userDetails) throw new Error("User not found");

      const { catalog: productIds, type: userType } = userDetails;
      if (userType !== "seller") throw new Error("User is not a seller");

      const productList = await Products.query()
        .whereIn("id", productIds)
        .andWhere({ isActive: true })
        // Rest info is irrelevant from buyer's POV
        .select("id", "name", "price");

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

router.post("/create-order/:seller_id", async (req: Request, res: Response) => {
  try {
    const { seller_id: sellerId } = req.params;
    const { productIds } = req.body;

    if (productIds.length === 0)
      throw new Error("You need products to create order");

    const buyerDetails = await Users.query().findById(res.userId);
    const sellerDetails = await Users.query().findById(Number(sellerId));

    if (!buyerDetails) throw new Error("Buyer not found");
    if (!sellerDetails) throw new Error("Seller not found");

    if (sellerDetails.type !== "seller")
      throw new Error("User is not a seller");
    if (buyerDetails.email === sellerDetails.email)
      throw new Error("Can't buy from same user");

    // Check if all products are included in seller catalog
    const filteredList = productIds.filter((productId: number) =>
      sellerDetails.catalog.includes(productId)
    );
    if (filteredList.length !== productIds.length)
      throw new Error("You can only add products from the seller catalog");

    // Validation done, now create the order
    const insertedResult = await Orders.query().insert({
      buyerId: res.userId,
      sellerId: Number(sellerId),
      productIds,
      createdAt: new Date(),
    });
    if (!insertedResult.id) throw new Error("DB error");

    res.json({
      success: true,
      message: "Order creation successful",
      data: {},
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: "Couldn't create order",
        error: error.message,
      });
    }
  }
});

export default router;
