<script lang="ts">
  import { chatProvider } from "../chat/chat.svelte";
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
      <a href="/app" class={["text-left", linkClass("Home")]}> Home </a>
    </li>

    <li class="w-full">
      <details class="group block w-full" open={true}>
        <summary class={classHeader(["Agents", "Chats", "Knowledge"])}>
          <span>Resources</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <a href="/app/agents" class={linkClass("Agents")}> Agents </a>
          </li>
          <li class="w-full">
            <a href="/app/chats" class={linkClass("Chats")}> Chats </a>
          </li>
          <li class="w-full">
            <a href="/app/knowledge" class={linkClass("Knowledge")}>
              Knowledge
            </a>
          </li>
          <li class="w-full">
            <a href="/app/operators" class={linkClass("Operators")}>
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
              Configure Integrations
            </a>
          </li>
          <li class="w-full">
            <a href={`/app/chat/${roomId}`} class={linkClass("Chat Rooms")}>
              Chat Rooms
            </a>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</nav>
