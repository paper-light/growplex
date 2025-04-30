import PocketBase, { AsyncAuthStore } from "pocketbase";

function initUserProvider() {
  if (!window.localStorage) {
    return "";
  }
  return localStorage.getItem("pb_auth") ?? "";
}

const store = new AsyncAuthStore({
  save: async (serialized: string) => {
    localStorage.setItem("pb_auth", serialized);
  },
  initial: initUserProvider(),
  clear: async () => {
    localStorage.removeItem("pb_auth");
  },
});

export const pb = new PocketBase(import.meta.env.PUBLIC_PB_URL, store);
