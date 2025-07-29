import { ChatWidgetPayloadSchema } from "@/chat/lib/models";

export async function authGuest(chatId: string, payloadStr: string) {
  const payload = payloadStr
    ? ChatWidgetPayloadSchema.parse(JSON.parse(payloadStr))
    : null;

  const body = JSON.stringify({
    chatId,
    roomId: payload?.roomId,
    username: payload?.username,
  });

  // Auth for guest users
  const response = await fetch(`/api/chat/auth`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 200) {
    console.error("Failed to authenticate chat widget");
    return null;
  }

  return await response.json();
}
