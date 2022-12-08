import { Request, Response, Router } from "express";
import Orders from "../models/order";
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

router.get("/orders", async (req: Request, res: Response) => {
  /** Attach properties from `Users` */
  interface OrderPlus extends Orders {
    buyerName: string;
    buyerEmail: string;
  }

  try {
    const ordersResponse = (await Orders.query()
      .alias("o")
      .join("users as u", "u.id", "=", "o.buyerId")
      .select(
        "o.id",
        "o.buyerId",
        "u.email as buyerEmail",
        "u.username as buyerName",
        "o.productIds",
        "o.createdAt",
        "o.completedAt"
      )) as OrderPlus[];

    // Find unique productIDs
    const uniqueProductIds = new Set<number>();
    ordersResponse.forEach((order) => {
      order.productIds.forEach((productId) => {
        uniqueProductIds.add(productId);
      });
    });

    // Remove "ownerId", redundant info
    const productList = await Products.query()
      .select("id", "name", "price", "isActive", "createdAt")
      .whereIn("id", Array.from(uniqueProductIds));

    // Construct the final response
    const orders = ordersResponse.map((order) => {
      return {
        id: order.id,
        buyerId: order.buyerId,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        // Ideally maps are better in these scenarios than array traverse,
        // but here the no of products shouldn't be too many
        products: order.productIds.map((productId) =>
          productList.find((productDetail) => productDetail.id === productId)
        ),
        createdAt: order.createdAt,
        completedAt: order.completedAt,
      };
    });

    res.json({
      success: true,
      message: "Fetched list of received orders successfully",
      data: {
        orders,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: "Couldn't fetch list of orders",
        error: error.message,
      });
    }
  }
});

export default router;
