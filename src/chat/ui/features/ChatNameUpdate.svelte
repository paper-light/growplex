<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Pencil } from "@lucide/svelte";

  import { userProvider } from "../../../user/user.svelte";
  import { debounce } from "../../../shared/helpers/debounce";

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
  <div class="form-control w-full flex items-center gap-2 hover:cursor-pointer">
    <input
      id="chatName"
      type="text"
      oninput={updateName}
      bind:value={chatName}
      required
      class="input input-ghost w-full input-lg font-semibold focus:outline-none"
      placeholder="Chat name"
    />
    <label for="chatName" class="label">
      <Pencil class="size-4" />
    </label>
  </div>
</div>
