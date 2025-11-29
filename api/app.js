import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import todoRouter from "./routes/invoiceRoutes.js";
import dayjs from "dayjs";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = dayjs().format("DD-MM-YYYY HH:mm:ss");
  console.log(
    `new request made to ${req.path} on ${req.requestTime} from ${req.ip}`
  );
  next();
});

app.use("/api/user", userRouter);
app.use("/api/todo", todoRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl}!`,
  });
});

export default app;
