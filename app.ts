import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "Root route" });
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
