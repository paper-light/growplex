import { pb, authProvider } from "./auth.svelte";

export const signIn = async (email: string, password: string) => {
  await pb.collection("users").authWithPassword(email, password);
  authProvider.refreshUser();
};
