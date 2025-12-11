import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import app from "./app.js";

const server = http.createServer(app);

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log(`DB connection FAILED!`, err.message));

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`✅ API running at ${`http://localhost:${PORT}`}`);
});
