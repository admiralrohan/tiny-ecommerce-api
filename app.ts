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
import { verifyToken } from "./middlewares/verify-token";
import { allowIfBuyer } from "./middlewares/allow-if-buyer";
import { allowIfSeller } from "./middlewares/allow-if-seller";

const app: Express = express();

// Initialize knex.
// TODO: Setup `prod` deployment here
const knex = Knex(knexConfig.dev);

// Bind all Models to the knex instance. You only
// need to do this once before you use any of
// your model classes.
Model.knex(knex);

app.use(express.json());

app.use("/api/auth", authRouter);
// Auth middlewares are used here to reduce redundancy across all request handlers
app.use("/api/buyer", verifyToken, allowIfBuyer, buyerRouter);
app.use("/api/seller", verifyToken, allowIfSeller, sellerRouter);
app.use("/api/utils", utilsRouter);

// Can be used for Server health checks by AWS
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

export { app, knex };
