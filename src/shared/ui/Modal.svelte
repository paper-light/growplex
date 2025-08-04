<script lang="ts">
  import { X } from "@lucide/svelte";
  import type { ClassValue } from "svelte/elements";

  import { portal } from "@/shared/actions/portal";

  import Button from "./Button.svelte";

  interface Props {
    open?: boolean;
    id?: string;
    class?: ClassValue;
    children?: any;
    onclose?: () => void;
    backdrop?: boolean;
    placement?: "top" | "bottom" | "left" | "right" | "center";
    order?: number;
  }

  let {
    id = "body",
    class: className = "",
    open = $bindable(false),
    children,
    onclose,
    placement = "center",
    backdrop = true,
  }: Props = $props();

  let placementClass = $derived.by(() => {
    switch (placement) {
      case "top":
        return "modal-top";
      case "bottom":
        return "modal-bottom";
      case "left":
        return "modal-start";
      case "right":
        return "modal-end";
      case "center":
        return "modal-middle";
    }
  });
</script>

<div use:portal={id}>
  <input type="checkbox" class="modal-toggle" bind:checked={open} />
  <div class={["modal", placementClass]}>
    {#if backdrop}
      <button
        aria-label="Close modal"
        class="modal-backdrop"
        onclick={() => onclose?.()}
      ></button>
    {/if}
    <div class={["modal-box relative", className]}>
      <div class="absolute top-2 right-2">
        <Button
          color="neutral"
          style="ghost"
          onclick={() => {
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
