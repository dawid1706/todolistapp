import InvoiceModel from "../models/invoiceModel.js";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_FILE,
});

const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(BUCKET_NAME);

export const getInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceModel.find({ owner: req.user._id });

    res.status(200).json({
      status: "success",
      results: invoices.length,
      content: invoices,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const createInvoice = async (req, res) => {
  const userId = req.user._id;
  const { name, amount, endsAt } = req.body;
  const invoiceFile = req.file;

  if (!invoiceFile) {
    return res.status(400).json({
      status: "fail",
      message: "Wymagany jest plik faktury w formacie PDF/skanu.",
    });
  }

  const filePath = `invoices/${userId}/${Date.now()}-${invoiceFile.originalname.replace(
    / /g,
    "_"
  )}`;
  const file = bucket.file(filePath);

  try {
    await file.save(invoiceFile.buffer, {
      contentType: invoiceFile.mimetype,
      resumable: false,
    });

    try {
      const newInvoice = await InvoiceModel.create({
        name,
        amount,
        createdAt: new Date(),
        endsAt,
        owner: userId,
        filePath: filePath,
        state: "PENDING",
      });

      res.status(201).json({
        status: "success",
        content: newInvoice,
      });
    } catch (dbError) {
      console.error("Błąd zapisu do DB, usuwanie pliku z GCS...");
      await file
        .delete()
        .catch((e) =>
          console.error("Nie udało się usunąć pliku po błędzie DB:", e)
        );

      throw dbError;
    }
  } catch (err) {
    console.error("Błąd podczas tworzenia faktury:", err);
    res.status(400).json({
      status: "fail",
      message: err.message || "Nie udało się utworzyć faktury.",
    });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        status: "fail",
        message: "Faktura nie znaleziona",
      });
    }

    if (invoice.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Brak uprawnień do usunięcia tej faktury",
      });
    }

    if (invoice.filePath) {
      try {
        await bucket.file(invoice.filePath).delete();
      } catch (gcsError) {
        console.warn(
          "Plik nie istniał w GCS lub błąd usuwania:",
          gcsError.message
        );
      }
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
    const invoice = await InvoiceModel.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        status: "fail",
        message: "Faktura nie znaleziona",
      });
    }

    if (invoice.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "Brak uprawnień do edycji tej faktury",
      });
    }

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      content: updatedInvoice,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
