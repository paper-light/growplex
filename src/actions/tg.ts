import { TG_ID, TG_TOKEN } from "astro:env/server";
import z from "zod";

export const TGSchema = z.object({
  contact: z.string(),
  message: z.string(),
  source: z.string(),
});

export const tgHandler = async ({
  contact,
  message,
  source,
}: z.infer<typeof TGSchema>) => {
  const text =
    `📨 *New Contact Submission*\n\n` +
    `*Contact:* ${contact}\n` +
    `*Message:* ${message}\n` +
    `*Source:* ${source}`;
  const resp = await fetch(
    `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_ID,
        text,
        parse_mode: "Markdown",
      }),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Telegram API error: ${err}`);
  }
  return { success: true };
};
