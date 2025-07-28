<script lang="ts">
  import { X } from "@lucide/svelte";
  import type { ClassValue } from "svelte/elements";

  import { portal } from "../../../shared/actions/portal";
  import Button from "./Button.svelte";

  interface Props {
    open?: boolean;
    id?: string;
    class?: ClassValue;
    children?: any;
    onclose?: () => void;
  }

  let {
    id = "body",
    class: className = "",
    open = $bindable(false),
    children,
    onclose,
  }: Props = $props();
</script>

<div use:portal={id} class={className}>
  <input type="checkbox" class="modal-toggle" bind:checked={open} />
  <div class="modal">
    <div class="modal-box relative">
      <div class="absolute top-2 right-2">
        <Button
          color="neutral"
          style="ghost"
          onclick={() => {
            open = false;
            onclose?.();
          }}
          circle
        >
          <X size={24} />
        </Button>
      </div>

      {@render children()}
    </div>
  </div>
</div>
