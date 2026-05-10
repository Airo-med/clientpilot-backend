import { Request, Response } from "express";
import Stripe from "stripe";
import { pool } from "../config/db";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export const stripeWebhook = async (req: Request, res: Response) => {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !whSecret) {
    res.status(503).send("Stripe webhook not configured");
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (typeof sig !== "string") {
    res.status(400).send("Missing stripe-signature");
    return;
  }

  let event: Stripe.Event;
  try {
    const raw = req.body;
    if (!Buffer.isBuffer(raw)) {
      res.status(400).send("Invalid body");
      return;
    }
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", msg);
    res.status(400).send(`Webhook Error: ${msg}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.userId;
        if (uid && session.mode === "subscription") {
          const customer = session.customer;
          const customerId =
            typeof customer === "string" ? customer : customer?.id ?? null;
          await pool.query(
            `UPDATE users SET
               subscription_status = 'pro',
               stripe_customer_id = COALESCE($2, stripe_customer_id),
               updated_at = NOW()
             WHERE id = $1`,
            [uid, customerId]
          );
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer.id;
        await pool.query(
          `UPDATE users SET subscription_status = 'free', updated_at = NOW()
           WHERE stripe_customer_id = $1`,
          [customerId]
        );
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};
