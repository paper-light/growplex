import { z } from "zod";

export const ChatWidgetPayloadSchema = z.object({
  username: z.string(),
  roomId: z.string(),
});
