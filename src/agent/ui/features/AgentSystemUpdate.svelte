<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { debounce } from "../../../shared/helpers/debounce";
  import TextArea from "../../../shared/ui/lib/TextArea.svelte";
  import type { AgentsResponse } from "../../../shared/models/pocketbase-types";
  import { agentCrud } from "../../repositories/agent-crud";

  const DEBOUNCE_TIME = 1200;

  interface Props {
    agent: AgentsResponse | null;
    class?: ClassValue;
  }
  let { agent, class: className = "" }: Props = $props();

  let systemInstruction = $derived(agent?.system ?? "");

  const updateSystem = debounce(async (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    const newSystem = target.value;

    if (newSystem === agent?.system || !agent) return;

    await agentCrud.update({
      id: agent.id,
      system: newSystem,
    });
  }, DEBOUNCE_TIME);
</script>

<div class={className}>
  <TextArea
    class="w-full"
    color="neutral"
    oninput={updateSystem}
    bind:value={systemInstruction}
    rows={4}
    placeholder="e.g. 'You are a helpful assistant…'"
  >
    <span class="font-medium">System instruction</span>
  </TextArea>
</div>
