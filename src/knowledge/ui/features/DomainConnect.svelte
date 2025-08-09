<script lang="ts">
  import { actions } from "astro:actions";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { Rocket } from "@lucide/svelte";

  import Button from "@/shared/ui/Button.svelte";
  import Modal from "@/shared/ui/Modal.svelte";
  import { settingsProvider } from "@/user/settings.svelte";
  import Input from "@/shared/ui/Input.svelte";

  interface Props {
    class?: ClassValue;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    color?:
      | "primary"
      | "secondary"
      | "accent"
      | "info"
      | "success"
      | "warning"
      | "error"
      | "neutral";
    style?: "solid" | "outline" | "ghost" | "link" | "dash" | "soft";
    children?: Snippet;

    projectId: string;
    integrationId?: string;
    sourceId?: string;
    domain?: string;
    disabled?: boolean;
  }

  const {
    projectId,
    integrationId,
    sourceId,
    domain = "",
    size = "md",
    color = "secondary",
    style = "solid",
    class: className = "",
    disabled = false,
    children,
  }: Props = $props();

  let open = $state(false);
  let value = $derived(domain);

  $effect(() => {
    if (!open) value = "";
  });

  async function connect() {
    if (!value) return;

    open = false;

    const res = await actions.indexWeb({
      projectId,
      url: value,
      integrationId,
      sourceId,
    });
    if (!res.data?.ok) return;

    settingsProvider.selectSource(res.data.sourceId);
  }
</script>

<div class={className}>
  <Button {color} {size} {style} onclick={() => (open = true)} {disabled}>
    {#if children}
      {@render children()}
    {:else}
      Load your domain <Rocket class="size-4" />
    {/if}
  </Button>
</div>

<Modal bind:open>
  <div class="flex flex-col gap-4 justify-between">
    <Input
      bind:value
      placeholder="Domain"
      onkeydown={(e) => {
        if (e.key === "Enter") connect();
      }}
    />
    <p>
      This will run crawling and indexing of the domain and can take up to 1
      hour, depending on the size of the site.
      <br />
      <br />
      <span class="text-lg font-semibold"
        >This will cost you 0.01 gas per page.</span
      >
    </p>

    <div class="flex gap-2">
      <Button onclick={connect} class="grow" color="primary">Teach</Button>
      <Button class="grow" onclick={() => (open = false)} color="secondary"
        >Cancel</Button
      >
    </div>
  </div>
</Modal>
