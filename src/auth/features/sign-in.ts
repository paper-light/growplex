import { pb } from "../../shared/lib/pb";

export const signIn = async (email: string, password: string) => {
  await pb
    .collection("users")
    .authWithPassword(email, password, { expand: "orgMembers,orgMembers.org" });
};
