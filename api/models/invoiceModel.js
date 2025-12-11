import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "nameRequired"],
  },
  amount: {
    type: Number,
    required: [true, "amountRequired"],
  },
  state: {
    type: String,
    default: "active",
    required: [true, "stateRequired"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endsAt: {
    type: Date,
  },
  filePath: {
    type: String,
    required: [true, "fileIdRequired"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "ownerRequired"],
  },
});

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;
