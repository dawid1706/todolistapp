import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, "invoiceNumberRequired"],
  },
  contractor: {
    type: String,
    required: [true, "contractorRequired"],
  },
  amount: {
    type: Number,
    required: [true, "amountRequired"],
  },
  status: {
    type: String,
    enum: ["PENDING", "PAID", "OVERDUE"],
    default: "PENDING",
    required: [true, "statusRequired"],
  },
  issueDate: {
    type: Date,
    required: [true, "issueDateRequired"],
  },
  dueDate: {
    type: Date,
    required: [true, "dueDateRequired"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "ownerRequired"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  filePath: {
    type: String,
    required: false,
  },
});

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;

