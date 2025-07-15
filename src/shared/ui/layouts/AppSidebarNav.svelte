<script lang="ts">
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
  import { chatProvider } from "../../../chat/provider/chat.svelte";

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

  function linkClass(name: string, disabled = false) {
    const base = "btn btn-block w-full justify-start rounded-lg btn-ghost";
    if (disabled) {
      return `${base} text-base-content/50 cursor-not-allowed opacity-60`;
    }
    return active === name ? `${base} text-primary` : `${base} `;
  }

  const disabledLinks = [
    "Agents",
    "Chats",
    "Knowledge",
    "Operators",
    "Analytics",
    "Billing",
  ];
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
      <a href="/app/wizard" class={["text-left", linkClass("Wizard")]}>
        <Rocket size={18} />
        Integration Wizard
      </a>
    </li>

    <li class="w-full">
      <details class="group block w-full" open={true}>
        <summary class={classHeader(["Agents", "Chats", "Knowledge"])}>
          <span>Resources</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <span
              class={["text-left", linkClass("Agents", true)]}
              title="Coming soon"
            >
              <Bot size={18} />
              Agents
            </span>
          </li>
          <li class="w-full">
            <span
              class={["text-left", linkClass("Chats", true)]}
              title="Coming soon"
            >
              <MessageSquare size={18} />
              Chats
            </span>
          </li>
          <li class="w-full">
            <span
              class={["text-left", linkClass("Knowledge", true)]}
              title="Coming soon"
            >
              <BookOpen size={18} />
              Knowledge
            </span>
          </li>
          <li class="w-full">
            <span
              class={["text-left", linkClass("Operators", true)]}
              title="Coming soon"
            >
              <Users size={18} />
              Operators
            </span>
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
            <span class={linkClass("Tickets", true)} title="Coming soon">
              <Ticket size={18} />
              Tickets
            </span>
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
            <span class={linkClass("Analytics", true)} title="Coming soon">
              <ChartBar size={18} />
              Analytics
            </span>
          </li>
          <li class="w-full">
            <span class={linkClass("Billing", true)} title="Coming soon">
              <CreditCard size={18} />
              Billing
            </span>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</nav>
