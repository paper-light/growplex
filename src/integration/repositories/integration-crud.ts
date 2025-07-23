import { pb } from "../../shared/lib/pb";
import {
  CreateIntegrationDTOSchema,
  UpdateIntegrationDTOSchema,
  type CreateIntegrationDTO,
  type UpdateIntegrationDTO,
} from "../../shared/models/dto/integration";

export const integrationsCrud = {
  async create(raw: CreateIntegrationDTO) {
    const dto = CreateIntegrationDTOSchema.parse(raw);
    const integration = await pb.collection("integrations").create(dto);
    return integration;
  },

  async update(raw: UpdateIntegrationDTO) {
    const dto = UpdateIntegrationDTOSchema.parse(raw);

    const body = {
      ...(dto.name && { name: dto.name }),

      "agents+": dto.addAgents,
      "agents-": dto.removeAgents,
      "sources+": dto.addSources,
      "sources-": dto.removeSources,
      "operators+": dto.addOperators,
      "operators-": dto.removeOperators,
    };

    const integration = await pb
      .collection("integrations")
      .update(dto.id, body);
    return integration;
  },

  async delete(id: string) {
    return await pb.collection("integrations").delete(id);
  },
};
