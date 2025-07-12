import type { Request, Response, NextFunction } from "express";

import { ensureAdmin } from "../../src/auth";

export async function pbAdminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await ensureAdmin();
    next();
  } catch (err) {
    console.error("[pbAdminMiddleware] Failed to authenticate superuser:", err);
    res.status(500).send("PocketBase superuser authentication failed.");
  }
}
