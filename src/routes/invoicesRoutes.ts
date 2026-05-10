import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
} from "../controllers/invoicesController";

const router = Router();
router.use(authenticate);
router.get("/", listInvoices);
router.get("/:id/pdf", downloadInvoicePdf);
router.get("/:id", getInvoice);
router.post("/", createInvoice);
router.patch("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

export default router;
