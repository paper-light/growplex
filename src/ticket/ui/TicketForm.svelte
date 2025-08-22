<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Edit } from "@lucide/svelte";

  import { pb } from "@/shared/lib/pb";
  import type {
    MessagesResponse,
    TicketsResponse,
    AgentsResponse,
    UsersResponse,
    RoomsResponse,
  } from "@/shared/models/pocketbase-types";
  import Input from "@/shared/ui/Input.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import TextArea from "@/shared/ui/TextArea.svelte";
  import Select from "@/shared/ui/Select.svelte";
  import Messages from "@/messages/ui/widgets/Messages.svelte";
  import { userProvider } from "@/user/user.svelte";
  import Man from "@/shared/assets/Man.jpg";
  import type { Sender } from "@/chat/providers/socket.svelte";
  import { settingsProvider } from "@/user/settings.svelte";
  import { navigate } from "astro:transitions/client";

  const TICKET_PRIORITIES = [
    { value: "low", label: "Low", color: "info" },
    { value: "medium", label: "Medium", color: "warning" },
    { value: "high", label: "High", color: "error" },
  ];

  interface Props {
    class?: ClassValue;
    ticket: TicketsResponse | null;
    onSuccess?: (ticket: TicketsResponse) => void;
    onChatNavigate?: () => void;
  }

  const {
    ticket,
    class: className,
    onSuccess,
    onChatNavigate,
  }: Props = $props();

  let title = $derived(ticket?.title || "");
  let description = $derived(ticket?.description || "");
  let priority = $derived(ticket?.priority || "");
  let done = $derived(ticket?.done || false);

  let room: RoomsResponse | null = $state(null);
  let messages: MessagesResponse[] = $state([]);
  let agents: AgentsResponse[] = $state([]);
  let operators: UsersResponse[] = $state([]);

  const user = $derived(userProvider.user);
  const avatar = $derived(
    user?.avatar ? pb.files.getURL(user, user.avatar) : Man.src
  );
  const sender: Sender = $derived({
    id: user?.id || "",
    avatar,
    name: user?.name || "Admin",
    role: "operator",
  });

  const isFormDirty = $derived(
    title !== ticket?.title ||
      description !== ticket?.description ||
      priority !== ticket?.priority ||
      done !== ticket?.done
  );

  async function loadTicketMessages(ticketMessageId: string) {
    const msg = await pb.collection("messages").getOne(ticketMessageId);
    const msgs = (
      await pb.collection("messages").getFullList({
        filter: `room = "${msg.room}" && visible = true && created <= "${msg.created}"`,
        sort: "-created",
        limit: 30,
      })
    ).reverse();

    console.log(msg, msgs);

    const r = await pb.collection("rooms").getOne(msg.room, {
      expand:
        "chat,chat.integration,chat.integration.agents,chat.integration.operators",
    });

    const agents = (r?.expand as any)?.chat.expand.integration?.expand?.agents;
    const operators = (r?.expand as any)?.chat.expand.integration?.expand
      ?.operators;

    return { msgs, agents, operators, r };
  }

  $effect(() => {
    if (ticket?.message) {
      loadTicketMessages(ticket.message).then(
        ({ msgs, agents, operators, r }) => {
          messages = msgs;
          agents = agents || [];
          operators = operators || [];
          room = r || null;
        }
      );
    }
  });

  async function saveTicket(e: Event) {
    e.preventDefault();

    if (!isFormDirty || !ticket) return;

    const updatedTicket = await pb.collection("tickets").update(ticket.id, {
      title,
      description,
      priority,
      done,
    });

    onSuccess?.(updatedTicket);
  }
</script>

<div class={["h-full min-h-0", className]}>
  <form onsubmit={saveTicket} class="flex flex-col h-full min-h-0">
    <header
      class="flex items-center justify-between p-4 border-b border-base-300 flex-shrink-0"
    >
      <div class="flex items-center gap-4 flex-1">
        <Input
          class="flex-1"
          bind:value={title}
          placeholder="Title"
          labelPosition="right"
          legend="Title"
        >
          <Edit size={18} />
        </Input>

        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">Done:</span>
          <input type="checkbox" class="toggle toggle-sm" bind:checked={done} />
        </div>
      </div>

      <Button disabled={!isFormDirty} type="submit" color="primary">Save</Button
      >
    </header>

    <main class="flex flex-col flex-1 min-h-0 p-4">
      <div class="space-y-4 flex-shrink-0">
        <div class="flex flex-col gap-4">
          <Select
            class="w-full"
            bind:value={priority}
            options={TICKET_PRIORITIES}
          >
            Priority
          </Select>
        </div>

        <div class="flex flex-col gap-4">
          <TextArea
            rows={8}
            class="w-full"
            bind:value={description}
            placeholder="Description">Description</TextArea
          >
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-hidden">
        <Messages class="h-full" {messages} {agents} {operators} {sender} />
      </div>

      <div class="flex-shrink-0 pt-4">
        <Button
          style="outline"
          class="w-full"
          onclick={() => {
            if (!room) return;
            settingsProvider.selectRoom(room.id);
            navigate(`/app/chat`);
            onChatNavigate?.();
          }}
        >
          Go to chat
        </Button>
      </div>
    </main>
  </form>
</div>
