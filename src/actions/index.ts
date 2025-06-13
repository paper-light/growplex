// src/pages/api.ts
import z from "zod";
import { defineAction } from "astro:actions";
import { TG_ID, TG_TOKEN } from "astro:env/server";

export const server = {
  sendTG: defineAction({
    input: z.object({
      contact: z.string(),
      message: z.string(),
      source: z.string(),
    }),
    handler: async ({ contact, message, source }) => {
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
    },
  }),
};
