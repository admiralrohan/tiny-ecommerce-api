import express, { Express, Request, Response } from "express";

import dotenv from "dotenv";
dotenv.config();

import authRouter from "./routes/auth";
import buyerRouter from "./routes/buyer";
import sellerRouter from "./routes/seller";
import utilsRouter from "./routes/utils";

import Knex from "knex";
import knexConfig from "./knexfile";
import { Model } from "objection";

const app: Express = express();
const port = process.env.PORT;

// Initialize knex.
const knex = Knex(knexConfig.development);

// Bind all Models to the knex instance. You only
// need to do this once before you use any of
// your model classes.
Model.knex(knex);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/buyer", buyerRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/utils", utilsRouter);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Root route" });
});

app.use((req: Request, res: Response) => {
  res.status(404);

  // respond with json
  if (req.accepts("json")) {
    res.json({ success: false, message: "Route not found" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
