<script lang="ts">
  import { actions } from "astro:actions";
  import type { ClassValue } from "svelte/elements";
  import { Rocket } from "@lucide/svelte";

  import Button from "../../shared/ui/lib/Button.svelte";
  import Modal from "../../shared/ui/lib/Modal.svelte";
  import { settingsProvider } from "../../user/settings.svelte";
  import { pb } from "../../shared/lib/pb";

  interface Props {
    projectId: string;
    class?: ClassValue;
    domain: string;
    disabled?: boolean;
  }

  const {
    projectId,
    domain,
    class: className = "",
    disabled = false,
  }: Props = $props();

  let open = $state(false);

  async function connect() {
    open = false;

    const res = await actions.indexWeb({
      projectId,
      url: domain,
    });
    if (!res.data?.ok) return;

    const source = await pb.collection("sources").getOne(res.data.sourceId);
    settingsProvider.selectSource(source.id);
  }
</script>

<div class={className}>
  <Button
    color="secondary"
    size="sm"
    style="outline"
    onclick={() => (open = true)}
    {disabled}
  >
    Teach agent about this domain <Rocket class="size-4" />
  </Button>
</div>

<Modal bind:open>
  <div class="flex flex-col gap-4 justify-between">
    <h3 class="text-lg">
      Teach agent about <span class="font-bold">{domain}</span>?
    </h3>
    <p>
      This will run crawling and indexing of the domain and can take up to 1
      hour, depending on the size of the site.
    </p>

    <div class="flex gap-2">
      <Button onclick={connect} class="grow" color="primary">Teach</Button>
      <Button class="grow" onclick={() => (open = false)} color="secondary"
        >Cancel</Button
      >
    </div>
  </div>
</Modal>
