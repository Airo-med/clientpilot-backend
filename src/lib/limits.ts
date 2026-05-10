import type { Pool } from "pg";

export const FREE_MAX_CLIENTS = 3;
export const FREE_MAX_INVOICES = 3;
export const FREE_MAX_PROJECTS = 3;

export async function countClients(pool: Pool, userId: string): Promise<number> {
  const { rows } = await pool.query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM clients WHERE user_id = $1`,
    [userId]
  );
  return Number(rows[0]?.c ?? 0);
}

export async function countInvoices(pool: Pool, userId: string): Promise<number> {
  const { rows } = await pool.query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM invoices WHERE user_id = $1`,
    [userId]
  );
  return Number(rows[0]?.c ?? 0);
}

export async function countProjects(pool: Pool, userId: string): Promise<number> {
  const { rows } = await pool.query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM projects WHERE user_id = $1`,
    [userId]
  );
  return Number(rows[0]?.c ?? 0);
}

export function isUnlimited(role: string, subscriptionStatus: string): boolean {
  if (role === "admin") return true;
  return String(subscriptionStatus).toLowerCase() === "pro";
}
