import { pb } from "../../shared/lib/pb";
import {
  CreateRoomDTOSchema,
  type CreateRoomDTO,
} from "../../shared/models/dto/room";

export const roomCrud = {
  create: async (raw: CreateRoomDTO) => {
    const dto = CreateRoomDTOSchema.parse(raw);
    const room = await pb.collection("rooms").create(dto);
    return room;
  },

  delete: async (id: string) => {
    await pb.collection("rooms").delete(id);
  },
};
