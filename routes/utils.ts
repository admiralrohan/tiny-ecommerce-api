import { Request, Response, Router } from "express";

const router = Router();

// To show at registration form at FE
router.get("/user-roles", (req: Request, res: Response) => {
  res.json({ success: true, message: "Fetched user roles successfully" });
});

router.get("/products", (req: Request, res: Response) => {
  res.json({ success: true, message: "Fetched list of products successfully" });
});

export default router;
