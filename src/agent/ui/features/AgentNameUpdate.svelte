<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";

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
  <div class="form-control w-full flex items-center gap-2 hover:cursor-pointer">
    <input
      id="agentName"
      type="text"
      oninput={updateName}
      bind:value={agentName}
      required
      class="input input-ghost w-full input-lg font-semibold focus:outline-none"
      placeholder="Agent name"
    />
    <label for="agentName" class="label">
      <Pencil class="size-4" />
    </label>
  </div>
</div>
