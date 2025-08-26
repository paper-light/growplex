import { z } from "astro:schema";

import { tgNotifier } from "@/notifications/tg";
import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";
import { getEnv } from "@/shared/helpers/get-env";

const PROJECT_ID = getEnv("PROJECT_ID");

const log = logger.child({
  module: "actions:tickets:web-main-cta-send",
});

export const WebMainCTASchema = z.object({
  contact: z.string(),
  message: z.string(),
});

export const webMainCTAHandler = async ({
  contact,
  message,
}: z.infer<typeof WebMainCTASchema>) => {
  const text =
    `📨 *New Web Main CTA Submission*\n\n` +
    `*Contact:* ${contact}\n` +
    `*Message:* ${message}`;
  try {
    tgNotifier.sendMessage(text);
    const lead = await pb.collection("leads").create({
      email: contact,
      tg: contact,
      phone: contact,
      type: "warm",
      level: "warm",
      project: PROJECT_ID,
    });

    return lead;
  } catch (err) {
    log.error(err);
    throw err;
  }
};
