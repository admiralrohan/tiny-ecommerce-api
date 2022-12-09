import { app, knex } from "./app";
import { port } from "./configs/config";

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
