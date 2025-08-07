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
    noPadding?: boolean;
    placement?: "top" | "bottom" | "left" | "right" | "center";
    order?: number;
    transparent?: boolean;

    transition?: boolean;
  }

  let {
    id = "body",
    class: className = "",
    open = $bindable(false),
    children,
    onclose,
    placement = "center",
    backdrop = false,
    noPadding = false,
    transparent = false,
  }: Props = $props();

  let dialogElement: HTMLDialogElement | null = $state(null);

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

  $effect(() => {
    if (open && dialogElement) {
      dialogElement.showModal();
    } else if (!open && dialogElement) {
      dialogElement.close();
    }
  });

  function handleClose() {
    open = false;
    onclose?.();
  }
</script>

<div use:portal={id}>
  <dialog
    style={transparent ? "background: transparent" : ""}
    bind:this={dialogElement}
    class={["modal", placementClass]}
  >
    <div class={["modal-box relative", noPadding && "p-0", className]}>
      <div class="absolute top-2 right-2">
        <Button color="neutral" style="ghost" onclick={handleClose} circle>
          <X size={24} />
        </Button>
      </div>

      {@render children()}
    </div>

    {#if backdrop}
      <form method="dialog" class="modal-backdrop">
        <button onclick={handleClose}>close</button>
      </form>
    {/if}
  </dialog>
</div>
