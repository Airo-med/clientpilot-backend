import { Response } from "express";
import type { Request } from "express";
import Stripe from "stripe";
import { pool } from "../config/db";
import {
  FREE_MAX_CLIENTS,
  FREE_MAX_INVOICES,
  FREE_MAX_PROJECTS,
  countClients,
  countInvoices,
  countProjects,
} from "../lib/limits";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export const getSubscription = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const { rows } = await pool.query(
      `SELECT subscription_status, stripe_customer_id FROM users WHERE id = $1`,
      [userId]
    );
    const row = rows[0];
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }

    const [clientCount, invoiceCount, projectCount] = await Promise.all([
      countClients(pool, userId),
      countInvoices(pool, userId),
      countProjects(pool, userId),
    ]);

    const status = String(row.subscription_status ?? "free").toLowerCase();

    res.json({
      subscriptionStatus: status,
      stripeCustomerId: row.stripe_customer_id ?? null,
      limits: {
        clients: {
          used: clientCount,
          max: status === "pro" ? null : FREE_MAX_CLIENTS,
        },
        invoices: {
          used: invoiceCount,
          max: status === "pro" ? null : FREE_MAX_INVOICES,
        },
        projects: {
          used: projectCount,
          max: status === "pro" ? null : FREE_MAX_PROJECTS,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID_PRO?.trim();
  const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";

  if (!stripe || !priceId) {
    return res.status(503).json({
      error:
        "Billing is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID_PRO.",
    });
  }

  try {
    const userResult = await pool.query(
      `SELECT email, stripe_customer_id FROM users WHERE id = $1`,
      [userId]
    );
    const user = userResult.rows[0];
    if (!user?.email) {
      return res.status(400).json({ error: "User email missing" });
    }

    let customerId = user.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await pool.query(
        `UPDATE users SET stripe_customer_id = $2 WHERE id = $1`,
        [userId, customerId]
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard?checkout=success`,
      cancel_url: `${frontendUrl}/pricing?checkout=cancel`,
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
