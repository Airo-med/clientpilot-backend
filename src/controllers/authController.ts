import { Request, Response } from "express";
import crypto from "crypto";
import { pool } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { toPublicUser } from "../lib/mappers";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validation/schemas";

function signToken(user: {
  id: string;
  role: string;
  subscription_status?: string;
}) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      subscriptionStatus: user.subscription_status ?? "free",
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );
}

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }
  const { name, email, password } = parsed.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, subscription_status, stripe_customer_id, created_at, updated_at`,
      [name, email, hashedPassword]
    );

    const row = result.rows[0];
    const token = signToken(row);
    res.status(201).json({ token, user: toPublicUser(row) });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }
  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);

    const { password: _pw, ...rest } = user;
    res.json({ token, user: toPublicUser(rest) });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }
  const { email } = parsed.data;

  try {
    const result = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (user) {
      const raw = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query(
        `UPDATE users SET password_reset_token = $2, password_reset_expires = $3 WHERE id = $1`,
        [user.id, tokenHash, expires]
      );

      if (process.env.NODE_ENV !== "production") {
        console.info(
          `[forgot-password] email=${email} resetToken(raw)=${raw} (dev only; use in POST /api/auth/reset-password)`
        );
      }
    }

    return res.json({
      message:
        "If an account exists for that email, password reset instructions have been processed.",
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }
  const { token, password } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const result = await pool.query(
      `SELECT id FROM users
       WHERE password_reset_token = $1
         AND password_reset_expires > NOW()`,
      [tokenHash]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users SET
         password = $2,
         password_reset_token = NULL,
         password_reset_expires = NULL,
         updated_at = NOW()
       WHERE id = $1`,
      [user.id, hashedPassword]
    );

    res.json({ message: "Password updated. You can sign in now." });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
};
