import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config({ path: "./.env" });

const server = http.createServer(app);

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log(`DB connection FAILED!`, err.message));

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`✅ API running at ${`http://localhost:${PORT}`}`);
});
