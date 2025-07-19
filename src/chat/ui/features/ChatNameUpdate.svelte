<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";
  import Input from "../../../shared/ui/lib/Input.svelte";

  const DEBOUNCE_TIME = 1.2 * 1000;

  interface Props {
    className?: ClassValue;
  }
  let { className = "" }: Props = $props();

  const currentChat = $derived(userProvider.chat);

  let chatName = $derived(currentChat?.name ?? "");

  const updateName = debounce(async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newName = target.value;

    if (newName === currentChat?.name) return;

    await userProvider.updateChat(currentChat!.id, {
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
