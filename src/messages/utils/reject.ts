import { pb } from "@/shared/lib/pb";

export async function rejectMessage(messageId: string) {
  await pb.collection("messages").update(messageId, {
    metadata: {
      rejected: true,
    },
  });
}
