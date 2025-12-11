import InvoiceModel from "../models/invoiceModel.js";
import { Storage } from "@google-cloud/storage";
import multer from "multer";

// --- Konfiguracja Google Cloud Storage ---
// WAŻNE: Upewnij się, że następujące zmienne środowiskowe są ustawione w pliku .env:
// GCS_PROJECT_ID: ID Twojego projektu Google Cloud
// GCS_KEY_FILE: Ścieżka do Twojego pliku klucza GCS (np. ./gcs-key.json)
// GCS_BUCKET_NAME: Nazwa Twojego bucketu GCS
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_FILE,
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
// --- Koniec konfiguracji GCS ---


// --- Konfiguracja Multer ---
// Przechowuje plik w pamięci jako bufor
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // limit rozmiaru pliku 10MB
  },
});
// --- Koniec konfiguracji Multer ---


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
  const { invoiceNumber, contractor, amount, status, issueDate, dueDate } = req.body;
  const invoiceFile = req.file;

  let filePath = null;

  try {
    // Jeśli plik został przesłany, wrzuć go na Google Cloud Storage
    if (invoiceFile) {
      filePath = `invoices/${userId}/${Date.now()}-${invoiceFile.originalname.replace(/ /g, "_")}`;
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: invoiceFile.mimetype,
      });

      await new Promise((resolve, reject) => {
        blobStream.on("error", (err) => {
          reject(err);
        });
        blobStream.on("finish", () => {
          resolve();
        });
        blobStream.end(invoiceFile.buffer);
      });
    }

    // Utwórz wpis faktury w bazie danych
    const newInvoice = await InvoiceModel.create({
      invoiceNumber,
      contractor,
      amount: Number(amount),
      status,
      issueDate,
      dueDate,
      owner: userId,
      filePath: filePath, // Zapisz ścieżkę pliku GCS
    });

    res.status(201).json({
      status: "success",
      content: newInvoice,
    });

  } catch (err) {
    console.error("Błąd podczas tworzenia faktury:", err);
    // Jeśli wystąpił błąd po przesłaniu pliku, usuń plik z GCS
    if (filePath) {
      try {
        await bucket.file(filePath).delete();
      } catch (deleteError) {
        console.error("Nie udało się usunąć pliku z GCS po błędzie tworzenia faktury:", deleteError);
      }
    }
    res.status(400).json({
      status: "fail",
      message: "Nie udało się utworzyć faktury.",
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

    // Jeśli istnieje ścieżka do pliku, usuń plik z GCS
    if (invoice.filePath) {
      try {
        await bucket.file(invoice.filePath).delete();
      } catch (gcsError) {
        console.warn(
          `Plik ${invoice.filePath} nie istniał w GCS lub błąd usuwania:`,
          gcsError.message
        );
      }
    }

    // Usuń fakturę z bazy danych
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

export const getDownloadUrl = async (req, res) => {
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
        message: "Brak uprawnień do tej faktury",
      });
    }

    if (!invoice.filePath) {
      return res.status(404).json({
        status: "fail",
        message: "Dla tej faktury nie ma zapisanego pliku.",
      });
    }

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const [url] = await bucket.file(invoice.filePath).getSignedUrl(options);

    res.status(200).json({
      status: "success",
      url: url,
    });

  } catch (err) {
    console.error("Błąd podczas generowania URL pobierania:", err);
    res.status(500).json({
      status: "fail",
      message: "Nie udało się wygenerować adresu URL do pobrania pliku.",
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