import express from "express";
import { authGuard } from "../controllers/userController.js";
import { getTodos } from "../controllers/todoController.js";

const router = express.Router();

router.get("/", authGuard, getTodos);
router.post("/create", authGuard, createTodo);
router.delete("/:id", authGuard, deleteTodo);

export default router;
