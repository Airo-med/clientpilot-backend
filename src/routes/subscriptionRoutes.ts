import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  getSubscription,
  createCheckoutSession,
} from "../controllers/subscriptionController";

const router = Router();
router.use(authenticate);
router.get("/", getSubscription);
router.post("/checkout-session", createCheckoutSession);

export default router;
