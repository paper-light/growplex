<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { debounce } from "@/shared/helpers/debounce";
  import Input from "@/shared/ui/lib/Input.svelte";
  import type { AgentsResponse } from "@/shared/models/pocketbase-types";
  import { agentCrud } from "@/agent/repositories/agent-crud";

  const DEBOUNCE_TIME = 1.2 * 1000;

  interface Props {
    agent: AgentsResponse | null;
    class?: ClassValue;
  }
  let { agent, class: className = "" }: Props = $props();

  let agentName = $derived(agent?.name ?? "");

  const updateName = debounce(async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newName = target.value;

    if (newName === agent?.name || !agent) return;

    await agentCrud.update({
      id: agent.id,
      name: newName,
    });
  }, DEBOUNCE_TIME);
</script>

<div class={className}>
  <Input
    color="neutral"
    class="font-semibold"
    oninput={updateName}
    bind:value={agentName}
    ghost
    size="xl"
    placeholder="Agent name"
    labelPosition="right"
  >
    <Pencil class="size-4" />
  </Input>
</div>
