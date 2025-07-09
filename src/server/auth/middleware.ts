import type { AuthRecord } from "pocketbase";
import type { Request, Response, NextFunction } from "express";

import { pb } from "@/shared/lib/pb";
import { getEnv } from "@/shared/helpers/get-env";

const PB_ID = getEnv("PB_ID");
const PB_PASSWORD = getEnv("PB_PASSWORD");

export async function pbAdminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
      const authData = await pb
        .collection("_superusers")
        .authWithPassword(PB_ID, PB_PASSWORD);

      pb.authStore.save(authData.token, authData.record as AuthRecord);
    }

    next();
  } catch (err) {
    console.error("[pbAdminMiddleware] Failed to authenticate superuser:", err);
    res.status(500).send("PocketBase superuser authentication failed.");
  }
}
