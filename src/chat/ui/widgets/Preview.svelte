<script lang="ts">
  import { X } from "@lucide/svelte";
  import { untrack } from "svelte";
  import type { ClassValue } from "svelte/elements";

  import { userProvider } from "@/user/user.svelte";
  import { roomsProvider } from "@/chat/providers/rooms.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import { socketProvider } from "@/chat/providers/socket.svelte";
  import Chat from "@/chat/ui/widgets/Chat.svelte";
  import { pb } from "@/shared/lib/pb";
  import Man from "@/shared/assets/Man.jpg";

  interface Props {
    class?: ClassValue;
    showCloseButton?: boolean;
    onClose?: () => void;
  }

  const {
    class: className,
    showCloseButton = false,
    onClose,
  }: Props = $props();

  const integrationAgents = $derived(agentsProvider.integrationAgents);
  const agent = $derived(agentsProvider.selectedIntegrationAgent || null);
  const chat = $derived(chatsProvider.selectedIntegrationChat || null);

  const user = $derived(userProvider.user);
  const token = $derived(userProvider.token);

  const room = $derived(
    chat ? roomsProvider.previewRoomMap.get(chat.id) : null
  );

  const previewTheme = $derived((chat?.theme as any)?.preview || "light");

  let containerEl: HTMLElement | null = $state(null);

  $effect(() => {
    if (!chat || !agent) return;

    untrack(async () => {
      if (!room) return;
      const msgs = await pb.collection("messages").getFullList({
        filter: `room = "${room.id}"`,
        sort: "created",
        fields: "id",
      });
      await Promise.all(
        msgs.map((msg) => pb.collection("messages").delete(msg.id))
      );
      socketProvider.leaveRoom(room.id);
      socketProvider.joinRoom(room.id);
    });
  });

  const errors = $derived.by(() => {
    const errs = [];
    if (!agent) errs.push("No agent found");
    if (!chat) errs.push("No chat found");
    if (!token) errs.push("No token found");
    if (!room) errs.push("No room found");
    return errs;
  });

  function handleClose() {
    onClose?.();
  }
</script>

<div
  bind:this={containerEl}
  class={[
    "bg-base-200 shadow-xl flex flex-col w-full h-full min-h-0",
    className,
  ]}
  aria-label="Chat Preview"
  tabindex="-1"
  onintroend={() => containerEl?.focus()}
>
  {#if showCloseButton}
    <div
      class="cursor-pointer z-100 absolute top-2 right-2"
      data-theme={previewTheme}
    >
      <Button size="sm" square onclick={handleClose} style="outline">
        <X class="text-neutral" size={24} />
      </Button>
    </div>
  {/if}

  <div class="flex-1 min-h-0 overflow-hidden">
    {#key chat}
      {#if errors.length > 0}
        <div class="flex flex-col items-center justify-center h-full gap-5">
          {#each errors as error}
            <h1 class="text-2xl font-bold text-nowrap text-error">{error}</h1>
          {/each}
        </div>
      {:else if chat && agent && room && user && containerEl}
        <Chat
          {chat}
          operators={[user]}
          agents={integrationAgents}
          theme={previewTheme}
          root={containerEl}
          {room}
          sender={{
            id: user.id,
            avatar: Man.src,
            name: user.name,
            role: "guest",
          }}
        />
      {:else}
        <div class="flex flex-col items-center justify-center h-full gap-5">
          <p class="text-lg text-base-content/70">No chat preview available</p>
        </div>
      {/if}
    {/key}
  </div>
</div>
