<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { debounce } from "../../../shared/helpers/debounce";
  import Input from "../../../shared/ui/lib/Input.svelte";
  import type { ChatsResponse } from "../../../shared/models/pocketbase-types";
  import { chatCrud } from "../../repositories/chat-crud";

  const DEBOUNCE_TIME = 1.2 * 1000;

  interface Props {
    chat: ChatsResponse | null;
    className?: ClassValue;
  }
  let { chat, className = "" }: Props = $props();

  let chatName = $derived(chat?.name ?? "");

  const updateName = debounce(async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newName = target.value;

    if (newName === chat?.name || !chat) return;

    await chatCrud.update({
      id: chat.id,
      name: newName,
    });
  }, DEBOUNCE_TIME);
</script>

<div class={className}>
  <Input
    color="neutral"
    size="lg"
    ghost
    oninput={updateName}
    bind:value={chatName}
    placeholder="Chat name"
    labelPosition="right"
    class="font-semibold"
  >
    <Pencil class="size-4" />
  </Input>
</div>
