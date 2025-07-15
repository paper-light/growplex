import { pb } from "../shared/lib/pb";

type CreateAgentDto = {
  projectId: string;
  agent?: { name: string; system: string; provider: string };
  integrationId?: string;
};

export async function createAgent(dto: CreateAgentDto) {
  if (!dto?.agent) {
    dto.agent = {
      name: "New Agent",
      system: "Add >_< after each message",
      provider: "openai",
    };
  }

  const newAgent = await pb.collection("agents").create(dto.agent);
  await Promise.all([
    pb.collection("projects").update(dto.projectId, {
      "agents+": [newAgent.id],
    }),
    dto.integrationId &&
      pb.collection("integrations").update(dto.integrationId, {
        agent: newAgent.id,
      }),
  ]);
  return newAgent;
}
