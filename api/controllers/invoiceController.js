import InvoiceModel from "../models/invoiceModel.js";

export const getInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceModel.find({ owner: req.user._id });

    res.status(200).json({
      status: "success",
      content: invoices,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const newInvoice = await InvoiceModel.create(req.body);
    res.status(201).json({
      status: "success",
      content: newInvoice,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const deleteInvoide = async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        status: "fail",
        message: "Invoice not found",
      });
    }

    if (invoice.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to delete this invoice",
      });
    }

    await InvoiceModel.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      content: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoiceTemp = await InvoiceModel.findById(req.params.id);

    if (!invoiceTemp) {
      return res.status(404).json({
        status: "fail",
        message: "Invoice not found",
      });
    }

    if (invoice.owner !== req.user._id) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this invoice",
      });
    }

    const invoice = await InvoiceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      content: invoice,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
