<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";
  import Input from "../../../shared/ui/lib/Input.svelte";

  const DEBOUNCE_TIME = 1.2 * 1000;

  interface Props {
    class?: ClassValue;
  }
  let { class: className = "" }: Props = $props();

  const currentAgent = $derived(userProvider.agent);

  let agentName = $derived(currentAgent?.name ?? "");

  const updateName = debounce(async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newName = target.value;

    if (newName === currentAgent?.name) return;

    await userProvider.updateAgent(currentAgent!.id, {
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
