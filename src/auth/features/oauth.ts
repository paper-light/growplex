import { pb } from "../../shared/lib/pb";

export const oauth2 = async (provider: string) => {
  await pb.collection("users").authWithOAuth2({
    provider,
    query: { expand: "orgMembers,orgMembers.org" },
    createData: {
      metadata: {
        provider,
      },
    },
  });
};
