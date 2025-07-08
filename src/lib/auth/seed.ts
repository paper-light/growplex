import { pb } from "../../shared/pb";

export async function seed(userId: string, provider: "google" | null = null) {
  const user = await pb.collection("users").getOne(userId);
  if (user.orgMembers.length > 0) {
    throw new Error("user already seeded");
  }

  if (provider) {
    await pb.collection("users").update(userId, {
      metadata: { provider },
    });
  }

  const agent = await pb.collection("agents").create({
    name: "Example Agent",
    system: "Add >_< after each message",
    provider: "openai",
  });

  const chat = await pb.collection("chats").create({
    name: "Default Chat",
    theme: {
      light: {},
      dark: {},
    },
    firstMessage: "Hello, how are you?",
    domain: "https://example.com",
  });

  const integration = await pb.collection("integrations").create({
    name: "Default Integration",
    agent: agent.id,
    chat: chat.id,
  });
  const project = await pb.collection("projects").create({
    name: "Default",
    integrations: [integration.id],
    agents: [agent.id],
    chats: [chat.id],
  });
  const org = await pb.collection("orgs").create({
    name: `${user.name}'s Org`,
    projects: [project.id],
  });

  const { items } = await pb.collection("orgMembers").getList(1, 1, {
    filter: `org = "${org.id}" && role = "owner"`,
  });
  if (items.length > 0) {
    throw new Error("owner already exists");
  }

  const orgMem = await pb.collection("orgMembers").create({
    org: org.id,
    role: "owner",
  });

  await pb.collection("users").update(user.id, {
    orgMembers: [orgMem.id],
  });
}
