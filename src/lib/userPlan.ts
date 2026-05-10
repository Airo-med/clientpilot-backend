import type { Pool } from "pg";

export async function getUserPlanFromDb(
  pool: Pool,
  userId: string
): Promise<{ role: string; subscriptionStatus: string }> {
  const { rows } = await pool.query<{
    role: string;
    subscription_status: string | null;
  }>(`SELECT role, subscription_status FROM users WHERE id = $1`, [userId]);
  const row = rows[0];
  return {
    role: row?.role ?? "user",
    subscriptionStatus: row?.subscription_status ?? "free",
  };
}
