import { Response } from "express";
import type { Request } from "express";
import { pool } from "../config/db";
import { toProject } from "../lib/mappers";
import {
  FREE_MAX_PROJECTS,
  countProjects,
  isUnlimited,
} from "../lib/limits";
import { getUserPlanFromDb } from "../lib/userPlan";
import { projectCreateSchema, projectUpdateSchema } from "../validation/schemas";

async function assertClientOwned(
  userId: string,
  clientId: string
): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM clients WHERE id = $1 AND user_id = $2`,
    [clientId, userId]
  );
  return Boolean(r.rows[0]);
}

export const listProjects = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const clientId = req.query.clientId;

  try {
    if (typeof clientId === "string" && clientId.length > 0) {
      const ok = await assertClientOwned(userId, clientId);
      if (!ok) {
        return res.status(404).json({ error: "Client not found" });
      }
      const result = await pool.query(
        `SELECT * FROM projects WHERE user_id = $1 AND client_id = $2 ORDER BY created_at DESC`,
        [userId, clientId]
      );
      return res.json({ projects: result.rows.map((r) => toProject(r)) });
    }

    const result = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ projects: result.rows.map((r) => toProject(r)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getProject = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ project: toProject(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const parsed = projectCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }

  const { clientId, title, description, status, notes, attachmentUrl } =
    parsed.data;

  try {
    const plan = await getUserPlanFromDb(pool, userId);
    if (!isUnlimited(plan.role, plan.subscriptionStatus)) {
      const n = await countProjects(pool, userId);
      if (n >= FREE_MAX_PROJECTS) {
        return res.status(403).json({
          error: `Free plan allows up to ${FREE_MAX_PROJECTS} projects. Upgrade to Pro for unlimited projects.`,
        });
      }
    }

    const ok = await assertClientOwned(userId, clientId);
    if (!ok) {
      return res.status(404).json({ error: "Client not found" });
    }

    const projectStatus = status ?? "active";

    const result = await pool.query(
      `INSERT INTO projects (user_id, client_id, title, description, status, notes, attachment_url)
       VALUES ($1, $2, $3, $4, $5::project_status, $6, $7)
       RETURNING *`,
      [
        userId,
        clientId,
        title,
        description ?? null,
        projectStatus,
        notes ?? null,
        attachmentUrl ?? null,
      ]
    );

    res.status(201).json({ project: toProject(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const parsed = projectUpdateSchema.safeParse(req.body);
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

    if (data.title !== undefined) {
      sets.push(`title = $${i++}`);
      vals.push(data.title);
    }
    if (data.description !== undefined) {
      sets.push(`description = $${i++}`);
      vals.push(data.description ?? null);
    }
    if (data.status !== undefined) {
      sets.push(`status = $${i++}`);
      vals.push(data.status);
    }
    if (data.notes !== undefined) {
      sets.push(`notes = $${i++}`);
      vals.push(data.notes ?? null);
    }
    if (data.attachmentUrl !== undefined) {
      sets.push(`attachment_url = $${i++}`);
      vals.push(data.attachmentUrl ?? null);
    }
    sets.push(`updated_at = NOW()`);

    const idPh = i++;
    const userPh = i++;
    vals.push(id, userId);

    const result = await pool.query(
      `UPDATE projects SET ${sets.join(", ")}
       WHERE id = $${idPh} AND user_id = $${userPh}
       RETURNING *`,
      vals
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ project: toProject(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
