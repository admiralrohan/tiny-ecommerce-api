import { Request, Response, Router } from "express";

const router = Router();

router.post("/create-catalog", (req: Request, res: Response) => {
  res.json({ success: true, message: "Creation of seller catalog successful" });
});

router.get("/orders", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Fetched list of received orders successfully",
  });
});

export default router;
