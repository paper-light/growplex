import { ChatWidgetPayloadSchema } from "@/chat/lib/models";
import { getEnv } from "@/shared/helpers/get-env";

const ENV = getEnv("ENV");
const domain =
  ENV === "local"
    ? "http://localhost:2999"
    : ENV === "dev"
    ? "https://dev.growplex.dev"
    : "https://growplex.dev";

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
  const response = await fetch(`${domain}/api/chat/auth`, {
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
