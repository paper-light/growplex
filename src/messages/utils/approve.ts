import { pb } from "@/shared/lib/pb";

export async function approveMessage(messageId: string) {
  await pb.collection("messages").update(messageId, {
    metadata: {
      approved: true,
    },
  });
}
