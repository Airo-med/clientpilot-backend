import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientsController";

const router = Router();
router.use(authenticate);
router.get("/", listClients);
router.get("/:id", getClient);
router.post("/", createClient);
router.patch("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
