import { z } from "zod";

import { RoomsStatusOptions } from "../pocketbase-types";

export const CreateRoomDTOSchema = z.object({
  chat: z.string(),
  status: z.enum(RoomsStatusOptions),
});
export type CreateRoomDTO = z.infer<typeof CreateRoomDTOSchema>;
