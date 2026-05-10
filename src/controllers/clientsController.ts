import { Response } from "express";
import type { Request } from "express";
import { pool } from "../config/db";
import { toClient } from "../lib/mappers";
import {
  FREE_MAX_CLIENTS,
  countClients,
  isUnlimited,
} from "../lib/limits";
import { getUserPlanFromDb } from "../lib/userPlan";
import { clientCreateSchema, clientUpdateSchema } from "../validation/schemas";

export const listClients = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    const result = await pool.query(
      `SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ clients: result.rows.map((r) => toClient(r)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getClient = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM clients WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json({ client: toClient(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const createClient = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const parsed = clientCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }

  try {
    const plan = await getUserPlanFromDb(pool, userId);
    if (!isUnlimited(plan.role, plan.subscriptionStatus)) {
      const n = await countClients(pool, userId);
      if (n >= FREE_MAX_CLIENTS) {
        return res.status(403).json({
          error: `Free plan allows up to ${FREE_MAX_CLIENTS} clients. Upgrade to Pro for unlimited clients.`,
        });
      }
    }

    const { name, email, phone } = parsed.data;
    const result = await pool.query(
      `INSERT INTO clients (user_id, name, email, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, email ?? null, phone ?? null]
    );

    res.status(201).json({ client: toClient(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const parsed = clientUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }

  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;

    if (data.name !== undefined) {
      sets.push(`name = $${i++}`);
      vals.push(data.name);
    }
    if (data.email !== undefined) {
      sets.push(`email = $${i++}`);
      vals.push(data.email ?? null);
    }
    if (data.phone !== undefined) {
      sets.push(`phone = $${i++}`);
      vals.push(data.phone ?? null);
    }
    sets.push(`updated_at = NOW()`);

    const idPh = i++;
    const userPh = i++;
    vals.push(id, userId);

    const result = await pool.query(
      `UPDATE clients SET ${sets.join(", ")}
       WHERE id = $${idPh} AND user_id = $${userPh}
       RETURNING *`,
      vals
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json({ client: toClient(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
