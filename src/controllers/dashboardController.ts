import { Response } from "express";
import { pool } from "../config/db";
import type { Request } from "express";

export const getDashboardMetrics = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const yearParam = req.query.year;
    const year =
      typeof yearParam === "string" && /^\d{4}$/.test(yearParam)
        ? Number(yearParam)
        : new Date().getFullYear();

    const summary = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM clients WHERE user_id = $1) AS total_clients,
         (SELECT COUNT(*)::int FROM projects WHERE user_id = $1) AS total_projects,
         (SELECT COUNT(*)::int FROM invoices WHERE user_id = $1 AND status = 'paid') AS paid_invoices,
         (SELECT COUNT(*)::int FROM invoices WHERE user_id = $1 AND status = 'unpaid') AS unpaid_invoices,
         (SELECT COALESCE(SUM(amount), 0)::numeric FROM invoices WHERE user_id = $1 AND status = 'paid') AS total_revenue`,
      [userId]
    );

    const monthly = await pool.query(
      `SELECT
         EXTRACT(MONTH FROM COALESCE(paid_at, updated_at))::int AS month,
         COALESCE(SUM(amount), 0)::numeric AS revenue
       FROM invoices
       WHERE user_id = $1
         AND status = 'paid'
         AND EXTRACT(YEAR FROM COALESCE(paid_at, updated_at)) = $2
       GROUP BY 1
       ORDER BY 1`,
      [userId, year]
    );

    const yearly = await pool.query(
      `SELECT
         EXTRACT(YEAR FROM COALESCE(paid_at, updated_at))::int AS year,
         COALESCE(SUM(amount), 0)::numeric AS revenue
       FROM invoices
       WHERE user_id = $1 AND status = 'paid'
       GROUP BY 1
       ORDER BY 1`,
      [userId]
    );

    const s = summary.rows[0];

    res.json({
      totals: {
        clients: s.total_clients,
        projects: s.total_projects,
        paidInvoices: s.paid_invoices,
        unpaidInvoices: s.unpaid_invoices,
        totalRevenue: String(s.total_revenue),
      },
      revenueByMonth: monthly.rows.map((r) => ({
        month: r.month,
        revenue: String(r.revenue),
      })),
      revenueByYear: yearly.rows.map((r) => ({
        year: r.year,
        revenue: String(r.revenue),
      })),
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
};
