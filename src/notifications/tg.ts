import { getEnv } from "@/shared/helpers/get-env";

const TG_TOKEN = getEnv("TG_TOKEN");
const TG_ID = getEnv("TG_ID");

class TGNotifier {
  private readonly token: string;
  private readonly chatId: string;

  constructor(token: string, chatId: string) {
    this.token = token;
    this.chatId = chatId;
  }

  async sendMessage(message: string) {
    const resp = await fetch(
      `https://api.telegram.org/bot${this.token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Telegram API error: ${err}`);
    }
  }
}

export const tgNotifier = new TGNotifier(TG_TOKEN, TG_ID);
