import { pb } from "./auth.svelte";

export const signIn = async (email: string, password: string) => {
  await pb.collection("users").authWithPassword(email, password, {
    expand: "orgMembers,orgMembers.org,orgMembers.org.projects",
  });
};
