import express from "express";
import { authGuard } from "../controllers/userController.js";
import {
  getInvoices,
  createInvoice,
  deleteInvoice,
  updateInvoice,
  getDownloadUrl,
  upload,
  sendNotifications,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", authGuard, getInvoices);
router.get("/:id/download", authGuard, getDownloadUrl);
router.post("/create", authGuard, upload.single("file"), createInvoice);
router.delete("/:id", authGuard, deleteInvoice);
router.put("/:id", authGuard, updateInvoice);
router.get("/cron", sendNotifications);

export default router;
