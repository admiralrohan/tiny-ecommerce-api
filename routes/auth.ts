import { Request, Response, Router } from "express";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  res.json({ success: true, message: "User registration successful" });
});

router.post("/login", (req: Request, res: Response) => {
  res.json({ success: true, message: "User login successful" });
});

router.post("/logout", (req: Request, res: Response) => {
  res.json({ success: true, message: "User logout successful" });
});

export default router;
