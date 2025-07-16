import { z } from "zod";
import { userProvider } from "../../user/user.svelte";
import { CreateChatDTOSchema } from "../../shared/models/chat/dto";

export async function createChat(raw: z.input<typeof CreateChatDTOSchema>) {
  const dto = CreateChatDTOSchema.parse(raw);

  const newChat = await userProvider.createChat(dto.chat);

  await Promise.all([
    userProvider.updateProject(dto.projectId, { "chats+": [newChat.id] }),
    dto.integrationId &&
      userProvider.updateIntegration(dto.integrationId, { chat: newChat.id }),
  ]);

  return newChat;
}
