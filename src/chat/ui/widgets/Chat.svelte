<script lang="ts">
  import { untrack } from "svelte";

  import Pantheon from "@/shared/assets/Pantheon.jpg";
  import {
    type ChatsResponse,
    type AgentsResponse,
    type RoomsResponse,
    type UsersResponse,
  } from "@/shared/models/pocketbase-types";
  import { pb } from "@/shared/lib/pb";
  import Messages from "@/messages/ui/widgets/Messages.svelte";

  import { socketProvider, type Sender } from "@/chat/providers/socket.svelte";
  import { injectTheme } from "@/chat/utils/injectTheme";

  import Interactions from "./Interactions.svelte";
  interface Props {
    chat: ChatsResponse;
    agents: AgentsResponse[];
    operators: UsersResponse[];
    root: HTMLElement;
    room: RoomsResponse;
    sender: Sender;
    theme?: string;
  }

  const { root, chat, theme, room, agents, sender, operators }: Props =
    $props();

  const chatAvatar = chat.avatar
    ? pb.files.getURL(chat, chat.avatar)
    : Pantheon.src;

  const messages = $derived.by(() => {
    if (!room) return [];
    const history = socketProvider.histories.get(room.id);
    return history || [];
  });

  const online = $derived(socketProvider.online);

  $effect(() => {
    socketProvider.attachSender(sender);
  });

  $effect(() => {
    if (!theme || !root) return;

    root.setAttribute("data-theme", theme);

    // Config theme
    const themeData = (chat.theme as any)?.config[theme as any];
    injectTheme(themeData || {}, root);
  });

  $effect(() => {
    if (!room || !socketProvider.online) return;

    untrack(() => {
      socketProvider.joinRoom(room.id);
    });

    return () => {
      socketProvider.leaveRoom(room.id);
    };
  });
</script>

<div
  class="w-full h-full flex flex-col bg-base-100 shadow-lg px-4 pt-4 relative min-h-0 overflow-hidden max-h-full"
  style="height: 100%; max-height: 100%;"
>
  <header
    class="flex items-center justify-between border-b border-base-300 px-4 py-3 flex-shrink-0"
  >
    <div class="flex items-center space-x-3">
      <div class="avatar">
        <div
          class="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center"
        >
          <img alt="avatar" src={chatAvatar} />
        </div>
      </div>
      <div class="flex flex-col">
        <h2 class="text-lg font-semibold text-base-content">
          {chat.name || "Support Chat"}
        </h2>
        <span
          class="text-xs"
          class:text-gray-500={!online}
          class:text-primary={online}
        >
          {online ? "Online" : "Offline"}
        </span>
      </div>
    </div>
    <div class="flex items-center space-x-2"></div>
  </header>

  <main class="flex-1 overflow-hidden">
    <Messages {agents} {operators} {messages} {sender} />
  </main>

  <footer
    class="
      flex-shrink-0
      border-t border-base-300
      bg-base-100
    "
  >
    <Interactions {room} {sender} />
  </footer>
</div>
