<script lang="ts">
  import { chatProvider } from "../chat/chat.svelte";
  import {
    Home,
    Bot,
    MessageSquare,
    BookOpen,
    Users,
    Settings,
    ChartBar,
    CreditCard,
    Ticket,
    Rocket,
  } from "@lucide/svelte";

  interface Props {
    active: string;
  }

  const currentRoom = $derived(chatProvider.currentRoom);

  let { active }: Props = $props();

  let roomId = $state("");
  $effect(() => {
    currentRoom.then((room) => {
      if (room) roomId = room.id;
    });
  });

  function classHeader(names: string[]) {
    const base =
      "flex items-center justify-between w-full rounded-lg p-2 cursor-pointer font-semibold";
    return names.includes(active) ? `${base} text-primary` : `${base} `;
  }

  function linkClass(name: string) {
    const base = "btn btn-block w-full justify-start rounded-lg btn-ghost";
    return active === name ? `${base} text-primary` : `${base} `;
  }
</script>

<nav class="flex-1 overflow-y-auto">
  <ul class="menu menu-vertical gap-1 w-full">
    <li class="w-full">
      <a href="/app" class={["text-left", linkClass("Home")]}>
        <Home size={18} />
        Home
      </a>
    </li>
    <li class="w-full">
      <a
        href="/app/integrations/wizard"
        class={["text-left", linkClass("Wizard")]}
      >
        <Rocket size={18} />
        Integrations Wizard
      </a>
    </li>

    <li class="w-full">
      <details class="group block w-full" open={true}>
        <summary class={classHeader(["Agents", "Chats", "Knowledge"])}>
          <span>Resources</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <a href="/app/agents" class={linkClass("Agents")}>
              <Bot size={18} />
              Agents
            </a>
          </li>
          <li class="w-full">
            <a href="/app/chats" class={linkClass("Chats")}>
              <MessageSquare size={18} />
              Chats
            </a>
          </li>
          <li class="w-full">
            <a href="/app/knowledge" class={linkClass("Knowledge")}>
              <BookOpen size={18} />
              Knowledge
            </a>
          </li>
          <li class="w-full">
            <a href="/app/operators" class={linkClass("Operators")}>
              <Users size={18} />
              Operators
            </a>
          </li>
        </ul>
      </details>
    </li>

    <li class="w-full">
      <details class="group block w-full" open={true}>
        <summary class={classHeader(["Integrations", "Chat Rooms"])}>
          <span>Messanger</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <a href="/app/integrations" class={linkClass("Integrations")}>
              <Settings size={18} />
              Configure
            </a>
          </li>
          <li class="w-full">
            <a href={`/app/chat/${roomId}`} class={linkClass("Chat Rooms")}>
              <MessageSquare size={18} />
              Chat Rooms
            </a>
          </li>
          <li class="w-full">
            <a href={`/app/tickets`} class={linkClass("Tickets")}>
              <Ticket size={18} />
              Tickets
            </a>
          </li>
        </ul>
      </details>
    </li>

    <li class="w-full">
      <details class="group block w-full" open={true}>
        <summary class={classHeader(["Analytics", "Billing"])}>
          <span>Control</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <a href="/app/analytics" class={linkClass("Analytics")}>
              <ChartBar size={18} />
              Analytics
            </a>
          </li>
          <li class="w-full">
            <a href={`/app/billing`} class={linkClass("Billing")}>
              <CreditCard size={18} />
              Billing
            </a>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</nav>
