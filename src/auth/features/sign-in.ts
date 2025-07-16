import { pb } from "../../shared/lib/pb";
import { initData } from "../../user/init-data";

export const signIn = async (email: string, password: string) => {
  await pb.collection("users").authWithPassword(email, password);
  await initData();
};
