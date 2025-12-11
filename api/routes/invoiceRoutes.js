import express from "express";
import { authGuard } from "../controllers/userController.js";
import {
  getInvoices,
  createInvoice,
  deleteInvoice,
  updateInvoice,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", authGuard, getInvoices);
router.post("/create", authGuard, createInvoice);
router.delete("/:id", authGuard, deleteInvoice);
router.put("/:id", authGuard, updateInvoice);

export default router;
