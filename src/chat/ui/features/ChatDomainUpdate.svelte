<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";
  import Input from "../../../shared/ui/lib/Input.svelte";

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
  <Input
    ghost
    size="sm"
    color="neutral"
    oninput={updateDomain}
    bind:value={domain}
    placeholder="Your domain, https://example.com"
    labelPosition="right"
  >
    <Pencil class="size-4" />
  </Input>
</div>
