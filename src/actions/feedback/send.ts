import { z } from "astro:schema";

import { tgNotifier } from "@/notifications/tg";
import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";
import { getEnv } from "@/shared/helpers/get-env";

const PROJECT_ID = getEnv("PROJECT_ID");

const log = logger.child({
  module: "actions:feedback:send",
});

export const FeedbackSchema = z.object({
  type: z.enum(["feedback", "support"]),
  title: z.string(),
  message: z.string(),
});

export const feedbackHandler = async ({
  type,
  title,
  message,
}: z.infer<typeof FeedbackSchema>) => {
  const text =
    `📨 *New Feedback Submission*\n\n` +
    `*Type:* ${type}\n` +
    `*Title:* ${title}\n` +
    `*Message:* ${message}`;
  try {
    tgNotifier.sendMessage(text);
    const ticket = await pb.collection("tickets").create({
      type,
      title,
      message,
      project: PROJECT_ID,
    });

    return ticket;
  } catch (err) {
    log.error(err);
    throw err;
  }
};
