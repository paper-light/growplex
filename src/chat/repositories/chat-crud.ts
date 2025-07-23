import { pb } from "../../shared/lib/pb";
import {
  CreateChatDTOSchema,
  type CreateChatDTO,
  UpdateChatDTOSchema,
  type UpdateChatDTO,
} from "../../shared/models/dto/chat";

export const chatCrud = {
  async create(raw: CreateChatDTO) {
    const dto = CreateChatDTOSchema.parse(raw);
    const chat = await pb.collection("chats").create(dto);
    return chat;
  },

  async update(raw: UpdateChatDTO) {
    const dto = UpdateChatDTOSchema.parse(raw);
    const chat = await pb.collection("chats").update(dto.id, dto);
    return chat;
  },

  async delete(id: string) {
    return await pb.collection("chats").delete(id);
  },
};
