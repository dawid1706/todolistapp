import express from "express";
import { authGuard } from "../controllers/userController.js";
import {
  getTodos,
  createTodo,
  deleteTodo,
  toggleStatus,
} from "../controllers/todoController.js";

const router = express.Router();

router.get("/", authGuard, getTodos);
router.post("/create", authGuard, createTodo);
router.delete("/:id", authGuard, deleteTodo);
router.put("/:id", authGuard, toggleStatus);
export default router;
