import { z } from "astro:schema";
import { tgNotifier } from "@/notifications/tg";
import { logger } from "@/shared/lib/logger";

const log = logger.child({
  module: "actions:notification:tg",
});

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
  try {
    await tgNotifier.sendMessage(text);
  } catch (err) {
    log.error(err);
    throw err;
  }
};
