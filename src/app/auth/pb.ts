import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase, { AsyncAuthStore } from "pocketbase";

const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const store = new AsyncAuthStore({
  save: async (serialized: string) => {
    if (isBrowser) {
      localStorage.setItem("pb_auth", serialized);
    }
  },
  initial: isBrowser ? localStorage.getItem("pb_auth") ?? "" : "",
  clear: async () => {
    if (isBrowser) {
      localStorage.removeItem("pb_auth");
    }
  },
});

export const pb = new PocketBase(PUBLIC_PB_URL, store);
