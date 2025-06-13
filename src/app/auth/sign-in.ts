import { authProvider } from "./auth.svelte";

export const signIn = async (email: string, password: string) => {
  await authProvider.pb
    .collection("users")
    .authWithPassword(email, password, { expand: "subscription" });
};
