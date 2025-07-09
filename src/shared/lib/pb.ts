import PocketBase, { AsyncAuthStore } from "pocketbase";

import { getEnv } from "../helpers/get-env";
import type { TypedPocketBase } from "../models/pocketbase-types";

const PUBLIC_PB_URL = getEnv("PUBLIC_PB_URL");

const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const store = new AsyncAuthStore({
  save: async (serialized: string) => {
    if (isBrowser) localStorage.setItem("pb_auth", serialized);
  },
  initial: isBrowser ? localStorage.getItem("pb_auth") ?? "" : "",
  clear: async () => {
    if (isBrowser) localStorage.removeItem("pb_auth");
  },
});

export const pb = new PocketBase(PUBLIC_PB_URL, store) as TypedPocketBase;
pb.autoCancellation(false);
