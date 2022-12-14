import { Request, Response, Router } from "express";
import { userTypes } from "../configs/constants";
import { allowIfSeller } from "../middlewares/allow-if-seller";
import { verifyToken } from "../middlewares/verify-token";
import Products from "../models/product";

const router = Router();

// To show at registration form at FE
router.get("/user-roles", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Fetched user roles successfully",
    data: userTypes,
  });
});

router.get("/products", verifyToken, async (req: Request, res: Response) => {
  try {
    const productList = await Products.query().orderBy("id", "DESC");

    res.json({
      success: true,
      message: "Fetched list of products successfully",
      data: {
        productList,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: "Couldn't fetch product list",
        error: error.message,
      });
    }
  }
});

router.post(
  "/products",
  verifyToken,
  allowIfSeller,
  async (req: Request, res: Response) => {
    try {
      const { name, price, isActive } = req.body;

      if (!name) throw new Error("Name is required");
      if (!price) throw new Error("Price is required");
      if (!isActive) throw new Error("isActive is required");

      const insertedResult = await Products.query().insert({
        name,
        price,
        isActive,
        ownerId: res.userId,
        createdAt: new Date(),
      });

      if (!insertedResult) throw new Error("DB error");

      res.json({
        success: true,
        message: "Created product successfully",
        data: {},
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: "Couldn't create new product",
          error: error.message,
        });
      }
    }
  }
);

router.patch(
  "/products/:id",
  verifyToken,
  allowIfSeller,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // eg. If user passes string instead of number
      if (isNaN(Number(id))) throw new Error("Invalid product id");

      const productDetail = await Products.query().findById(Number(id));
      if (productDetail?.ownerId !== res.userId)
        throw new Error("You can't update products created by others");

      await Products.query().findById(Number(id)).patch(req.body);

      res.json({
        success: true,
        message: "Updated product successfully",
        data: {},
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: "Couldn't update product",
          error: error.message,
        });
      }
    }
  }
);

export default router;
