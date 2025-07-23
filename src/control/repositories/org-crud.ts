import { pb } from "../../shared/lib/pb";
import {
  UpdateOrgDTOSchema,
  type UpdateOrgDTO,
} from "../../shared/models/dto/org";

export const orgCrud = {
  async update(raw: UpdateOrgDTO) {
    const dto = UpdateOrgDTOSchema.parse(raw);
    const org = await pb.collection("orgs").update(dto.id, dto);
    return org;
  },
};
