<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";

  const DEBOUNCE_TIME = 1.2 * 1000;

  interface Props {
    class?: ClassValue;
    disabled?: boolean;
    domain?: string;
  }
  let {
    class: className = "",
    disabled = false,
    domain = $bindable(),
  }: Props = $props();

  const currentChat = $derived(userProvider.chat);

  const updateDomain = debounce(async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newDomain = target.value;

    if (newDomain === currentChat?.domain || disabled) return;

    await userProvider.updateChat(currentChat!.id, {
      domain: newDomain,
    });
  }, DEBOUNCE_TIME);
</script>

<div class={className}>
  <div class="form-control w-full flex items-center gap-2 hover:cursor-pointer">
    <input
      {disabled}
      id="chatDomain"
      type="text"
      oninput={updateDomain}
      bind:value={domain}
      class="input w-full font-semibold"
      placeholder="Your domain, https://example.com"
    />
    <label for="chatDomain" class="label">
      <Pencil class="size-4" />
    </label>
  </div>
</div>
