import { Request, Response, Router } from "express";

const router = Router();

router.get("/list-of-sellers", (req: Request, res: Response) => {
  res.json({ success: true, message: "Fetched list of sellers successfully" });
});

router.get("/seller-catalog/:seller_id", (req: Request, res: Response) => {
  res.json({ success: true, message: "Fetched seller catalog successfully" });
});

router.post("/create-order/:seller_id", (req: Request, res: Response) => {
  res.json({ success: true, message: "Order creation successful" });
});

export default router;
