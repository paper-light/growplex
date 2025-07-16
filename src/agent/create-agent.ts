import { userProvider } from "../user/user.svelte";
import { CreateAgentDTOSchema } from "../shared/models/agent/dto";
import { z } from "zod";

export async function createAgent(raw: z.input<typeof CreateAgentDTOSchema>) {
  const dto = CreateAgentDTOSchema.parse(raw);

  const newAgent = await userProvider.createAgent(dto.agent);
  await Promise.all([
    userProvider.updateProject(dto.projectId, {
      "agents+": [newAgent.id],
    }),
    dto.integrationId &&
      userProvider.updateIntegration(dto.integrationId, {
        agent: newAgent.id,
      }),
  ]);
  return newAgent;
}
