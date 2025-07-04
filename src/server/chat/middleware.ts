import PocketBase from "pocketbase";

import { pb } from "@/lib/config/pb";
import jwt from "jsonwebtoken";
import { UserSchema } from "@/models/user";

export async function ensureSuperuser() {
  if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
    const PB_ID = process.env.PB_ID!;
    const PB_PASSWORD = process.env.PB_PASSWORD!;
    const authData = await pb
      .collection("_superusers")
      .authWithPassword(PB_ID, PB_PASSWORD);
    pb.authStore.save(authData.token, authData.record);
  }
}

export function useMiddlewares(io: any) {
  io.use(async (socket: any, next: any) => {
    try {
      await ensureSuperuser();

      const token = socket.handshake.auth.token;
      if (token) {
        try {
          const authPb = new PocketBase(process.env.PUBLIC_PB_URL!);
          authPb.authStore.save(token);
          const res = await authPb.collection("users").authRefresh({
            expand: "orgMembers,orgMembers.org,orgMembers.org.projects",
          });
          const user = UserSchema.parse(res.record);
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
