import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  role: string;
  subscriptionStatus: string;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET as string
    ) as AuthUser;
    req.user = {
      id: payload.id,
      role: payload.role,
      subscriptionStatus: payload.subscriptionStatus ?? "free",
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
