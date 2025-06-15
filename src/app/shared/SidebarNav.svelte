<script lang="ts">
  interface Props {
    active: string;
  }

  let { active }: Props = $props();

  let open = $state(true);

  function linkClass(name: string) {
    const base = "btn btn-block w-full justify-start rounded-lg";
    return active === name
      ? `${base} btn-primary btn-outline`
      : `${base} btn-ghost`;
  }
</script>

<nav class="flex-1 overflow-y-auto">
  <ul class="menu menu-vertical gap-2 w-full">
    <li class="w-full">
      <!-- bind:open makes this default-open, and keeps `open` in sync -->
      <details class="group block w-full" bind:open>
        <summary
          class="flex items-center justify-between w-full rounded-lg p-2 cursor-pointer
                 hover:bg-base-200
                 group-open:text-primary
                 group-open:font-semibold"
        >
          <span class="text-lg">ThaliaAI</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <a href="/app/integrations" class={linkClass("Integrations")}>
              Integrations
            </a>
          </li>
          <li class="w-full">
            <a href="/app/chat-rooms" class={linkClass("Chat Rooms")}>
              Chat Rooms
            </a>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</nav>
