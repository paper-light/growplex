<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  import { userProvider } from "../../../user/user.svelte";
  import Select from "../../../shared/ui/lib/Select.svelte";

  interface Props {
    class?: ClassValue;
    size?: "sm" | "md" | "lg";
  }
  let { class: className = "", size = "md" }: Props = $props();

  const integartion = $derived(userProvider.integration);
  const allChats = $derived(userProvider.project?.expand?.chats || []);

  let value = $state("");

  const options = $derived.by(() => {
    return allChats.map((chat) => ({
      value: chat.id,
      label: chat.name || chat.id,
    }));
  });

  async function onchange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !integartion) return;
    await userProvider.updateIntegration(integartion.id, {
      chat: id,
    });
  }
</script>

<div class={className}>
  <Select bind:value {onchange} {options} color="neutral" {size}>
    Select from project…
  </Select>
</div>
