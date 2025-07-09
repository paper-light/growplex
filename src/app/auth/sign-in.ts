import { pb } from "../../shared/lib/pb";
import { authProvider } from "./auth.svelte";

export const signIn = async (email: string, password: string) => {
  await pb.collection("users").authWithPassword(email, password);
  await authProvider.refreshUser();
  await authProvider.subscribeUser();
};
