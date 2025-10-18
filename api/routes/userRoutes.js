import express from "express";
import {
  authGuard,
  getUserProfile,
  login,
  signup,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/getUser", authGuard, getUserProfile);

export default router;
