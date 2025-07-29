<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { debounce } from "@/shared/helpers/debounce";
  import Input from "@/shared/ui/lib/Input.svelte";
  import type { ChatsResponse } from "@/shared/models/pocketbase-types";
  import { chatCrud } from "@/chat/repositories/chat-crud";

  const DEBOUNCE_TIME = 1.2 * 1000;

  interface Props {
    chat: ChatsResponse | null;
    class?: ClassValue;
    disabled?: boolean;
  }
  let { chat, class: className = "", disabled = false }: Props = $props();

  const domain = $derived(chat?.domain ?? "");

  const updateDomain = debounce(async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newDomain = target.value;

    if (newDomain === chat?.domain || disabled || !chat) return;

    await chatCrud.update({
      id: chat.id,
      domain: newDomain,
    });
  }, DEBOUNCE_TIME);
</script>

<div class={className}>
  <Input
    {disabled}
    ghost
    size="sm"
    color="neutral"
    oninput={updateDomain}
    value={domain}
    placeholder="Your domain, https://example.com"
    labelPosition="right"
  >
    <Pencil class="size-4" />
  </Input>
</div>
