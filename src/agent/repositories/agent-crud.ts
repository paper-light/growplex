import { pb } from "../../shared/lib/pb";
import {
  CreateAgentDTOSchema,
  type CreateAgentDTO,
  UpdateAgentDTOSchema,
  type UpdateAgentDTO,
} from "../../shared/models/dto/agent";

export const agentCrud = {
  async create(raw: CreateAgentDTO) {
    const dto = CreateAgentDTOSchema.parse(raw);

    const newAgent = await pb.collection("agents").create(dto);
    if (dto.integrationId) {
      await pb.collection("integrations").update(dto.integrationId, {
        "agents+": [newAgent.id],
      });
    }
    return newAgent;
  },

  async update(raw: UpdateAgentDTO) {
    const dto = UpdateAgentDTOSchema.parse(raw);
    const agent = await pb.collection("agents").update(dto.id, dto);
    return agent;
  },

  async delete(id: string) {
    return await pb.collection("agents").delete(id);
  },
};
