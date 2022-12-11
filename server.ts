import app from "./app";
import { port } from "./configs/config";

import Knex from "knex";
import knexConfig from "./knexfile";
import { Model } from "objection";

// Initialize knex.
// TODO: Setup `prod` deployment here
const knex = Knex(knexConfig.dev);

// Bind all Models to the knex instance. You only
// need to do this once before you use any of
// your model classes.
Model.knex(knex);

const server = app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

// listen for the signal interruption (ctrl-c)
process.on("SIGINT", async () => {
  await knex.destroy();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await knex.destroy();
  server.close(() => {
    console.log("Server closed");
  });
});
