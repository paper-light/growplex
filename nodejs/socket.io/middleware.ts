import PocketBase from "pocketbase";
import jwt from "jsonwebtoken";

import { ensureAdmin } from "@/auth";
import type { UsersResponse } from "@/shared/models/pocketbase-types";

export function useMiddlewares(io: any) {
  io.use(async (socket: any, next: any) => {
    try {
      await ensureAdmin();

      const token = socket.handshake.auth.token;
      if (token) {
        try {
          const authPb = new PocketBase(process.env.PUBLIC_PB_URL!);
          authPb.authStore.save(token);
          const res = await authPb.collection("users").authRefresh({
            expand: "orgMembers,orgMembers.org",
          });
          const user = res.record as UsersResponse;
          socket.data.user = user;
        } catch (err) {
          console.error("Invalid user token:", err);
        }

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!);
          socket.data.guest = decoded;
        } catch (err) {
          console.error("Invalid Guest token:", err);
        }
      }

      next();
    } catch (err) {
      console.error("⚠️  PocketBase superuser re-auth failed:", err);
      next(new Error("Internal auth error"));
    }
  });
}
