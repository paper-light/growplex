<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";

  const DEBOUNCE_TIME = 1200;

  interface Props {
    class?: ClassValue;
  }
  let { class: className = "" }: Props = $props();

  const currentAgent = $derived(userProvider.agent);

  let systemInstruction = $derived(currentAgent?.system ?? "");

  const updateSystem = debounce(async (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    const newSystem = target.value;

    if (newSystem === currentAgent?.system) return;

    await userProvider.updateAgent(currentAgent!.id, {
      system: newSystem,
    });
  }, DEBOUNCE_TIME);
</script>

<div class={className}>
  <div class="form-control w-full">
    <label for="systemInstruction" class="label">
      <span class="label-text font-medium">System instruction</span>
    </label>
    <textarea
      id="systemInstruction"
      oninput={updateSystem}
      bind:value={systemInstruction}
      rows="4"
      class="textarea textarea-bordered w-full resize-none"
      placeholder="e.g. 'You are a helpful assistant…'"
    ></textarea>
  </div>
</div>
