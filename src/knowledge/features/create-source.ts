import { userProvider } from "../../user/user.svelte";

import { pb } from "../../shared/lib/pb";
import {
  type CreateSourceDTO,
  CreateSourceDTOSchema,
} from "../../shared/models/knowledge/dto";

export async function createSource(raw: CreateSourceDTO) {
  const dto = CreateSourceDTOSchema.parse(raw);

  const source = await pb.collection("sources").create({
    name: dto.name,
    type: dto.type,
    metadata: {
      domain: dto.metadata.domain,
    },
  });
  await Promise.all([
    userProvider.updateProject(userProvider.project!.id, {
      "sources+": [source.id],
    }),
    userProvider.updateIntegration(userProvider.integration!.id, {
      "sources+": [source.id],
    }),
  ]);
}
