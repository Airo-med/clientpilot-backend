import { Response } from "express";
import type { Request } from "express";
import PDFDocument from "pdfkit";
import { pool } from "../config/db";
import { toInvoice } from "../lib/mappers";
import {
  FREE_MAX_INVOICES,
  countInvoices,
  isUnlimited,
} from "../lib/limits";
import { getUserPlanFromDb } from "../lib/userPlan";
import { invoiceCreateSchema, invoiceUpdateSchema } from "../validation/schemas";

async function assertProjectOwned(
  userId: string,
  projectId: string
): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM projects WHERE id = $1 AND user_id = $2`,
    [projectId, userId]
  );
  return Boolean(r.rows[0]);
}

export const listInvoices = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projectId = req.query.projectId;
  const status = req.query.status;

  try {
    const conditions: string[] = [`user_id = $1`];
    const params: unknown[] = [userId];
    let i = 2;

    if (typeof projectId === "string" && projectId.length > 0) {
      conditions.push(`project_id = $${i++}`);
      params.push(projectId);
    }
    if (status === "paid" || status === "unpaid") {
      conditions.push(`status = $${i++}`);
      params.push(status);
    }

    const result = await pool.query(
      `SELECT * FROM invoices WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
      params
    );
    res.json({ invoices: result.rows.map((r) => toInvoice(r)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM invoices WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ invoice: toInvoice(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const parsed = invoiceCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }

  const { projectId, amount, dueDate, status } = parsed.data;

  try {
    const plan = await getUserPlanFromDb(pool, userId);
    if (!isUnlimited(plan.role, plan.subscriptionStatus)) {
      const n = await countInvoices(pool, userId);
      if (n >= FREE_MAX_INVOICES) {
        return res.status(403).json({
          error: `Free plan allows up to ${FREE_MAX_INVOICES} invoices. Upgrade to Pro for unlimited invoices.`,
        });
      }
    }

    const ok = await assertProjectOwned(userId, projectId);
    if (!ok) {
      return res.status(404).json({ error: "Project not found" });
    }

    const invStatus = status ?? "unpaid";
    const paidAt = invStatus === "paid" ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO invoices (user_id, project_id, amount, due_date, status, paid_at)
       VALUES ($1, $2, $3, $4::date, $5::invoice_status, $6)
       RETURNING *`,
      [userId, projectId, amount, dueDate, invStatus, paidAt]
    );

    res.status(201).json({ invoice: toInvoice(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const parsed = invoiceUpdateSchema.safeParse(req.body);
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

    if (data.amount !== undefined) {
      sets.push(`amount = $${i++}`);
      vals.push(data.amount);
    }
    if (data.dueDate !== undefined) {
      sets.push(`due_date = $${i++}::date`);
      vals.push(data.dueDate);
    }
    if (data.status !== undefined) {
      sets.push(`status = $${i++}::invoice_status`);
      vals.push(data.status);
      if (data.status === "paid") {
        sets.push(`paid_at = COALESCE(paid_at, NOW())`);
      } else {
        sets.push(`paid_at = NULL`);
      }
    }
    if (data.pdfUrl !== undefined) {
      sets.push(`pdf_url = $${i++}`);
      vals.push(data.pdfUrl ?? null);
    }
    sets.push(`updated_at = NOW()`);

    const idPh = i++;
    const userPh = i++;
    vals.push(id, userId);

    const result = await pool.query(
      `UPDATE invoices SET ${sets.join(", ")}
       WHERE id = $${idPh} AND user_id = $${userPh}
       RETURNING *`,
      vals
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ invoice: toInvoice(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM invoices WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const downloadInvoicePdf = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const plan = await getUserPlanFromDb(pool, userId);
    if (!isUnlimited(plan.role, plan.subscriptionStatus)) {
      return res.status(403).json({
        error:
          "PDF export is included with Pro. Upgrade your plan to download invoices as PDF.",
      });
    }
    const inv = await pool.query(
      `SELECT i.*, p.title AS project_title, c.name AS client_name
       FROM invoices i
       JOIN projects p ON p.id = i.project_id
       JOIN clients c ON c.id = p.client_id
       WHERE i.id = $1 AND i.user_id = $2`,
      [id, userId]
    );

    if (!inv.rows[0]) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const row = inv.rows[0];

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${String(row.id).slice(0, 8)}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text("Invoice", { underline: true });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Invoice ID: ${row.id}`);
    doc.text(`Client: ${row.client_name}`);
    doc.text(`Project: ${row.project_title}`);
    doc.text(`Amount: ${String(row.amount)}`);
    doc.text(`Status: ${row.status}`);
    doc.text(`Due: ${row.due_date}`);
    doc.text(`Created: ${row.created_at}`);
    doc.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
};
