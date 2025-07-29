import { pb } from "@/shared/lib/pb";
import {
  UpdateUserDTOSchema,
  type UpdateUserDTO,
} from "@/shared/models/dto/user";

export const userCrud = {
  async update(raw: UpdateUserDTO) {
    const dto = UpdateUserDTOSchema.parse(raw);
    const user = await pb.collection("users").update(dto.id, dto);
    return user;
  },
};
