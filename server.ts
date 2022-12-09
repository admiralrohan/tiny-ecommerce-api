import app from "./app";
import { port } from "./configs/config";

const server = app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});
