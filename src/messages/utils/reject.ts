import { pb } from "@/shared/lib/pb";

export async function rejectMessage(messageId: string) {
  const msg = await pb.collection("messages").getOne(messageId);
  if (!msg) throw new Error("Message not found");

  await pb.collection("messages").update(messageId, {
    metadata: {
      ...(msg.metadata || {}),
      rejected: true,
    },
  });
}
