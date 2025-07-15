import { pb } from "../../shared/lib/pb";

type CreateChatDto = {
  chat?: FormData;
  integrationId?: string;
  projectId: string;
};

export async function createChat(dto: CreateChatDto) {
  if (!dto?.chat) {
    dto.chat = new FormData();
    dto.chat.append("name", "New Chat");
    dto.chat.append("firstMessage", "Hello, how are you?");
  }

  const newChat = await pb.collection("chats").create(dto.chat);
  await Promise.all([
    pb.collection("projects").update(dto.projectId, { "chats+": [newChat.id] }),
    dto.integrationId &&
      pb
        .collection("integrations")
        .update(dto.integrationId, { chat: newChat.id }),
  ]);

  return newChat;
}
