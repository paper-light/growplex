<script lang="ts">
  import { userProvider } from "../../../user/user.svelte";
  import DomainConnect from "../../../knowledge/ui/DomainConnect.svelte";
  import { sourcesProvider } from "../../../knowledge/providers/sources.svelte";
  import ChatAvatarUpdate from "../features/ChatAvatarUpdate.svelte";
  import ChatNameUpdate from "../features/ChatNameUpdate.svelte";
  import ChatDomainUpdate from "../features/ChatDomainUpdate.svelte";
  import ChatFirstMessageUpdate from "../features/ChatFirstMessageUpdate.svelte";
  import ChatSelect from "../features/ChatSelect.svelte";

  import Card from "../../../shared/ui/lib/Card.svelte";
  import SourceStatus from "../../../knowledge/ui/SourceStatus.svelte";

  import ThemeSelection from "./ThemeSelection.svelte";

  const integartion = $derived(userProvider.integration);
  const currentChat = $derived(userProvider.chat);

  const sources = $derived(
    sourcesProvider.sources.filter((s) => integartion?.sources?.includes(s.id))
  );
  const webSource = $derived(sources.find((s) => s.type === "web") || null);

  let domain = $derived(currentChat?.domain ?? "");
</script>

<Card title="Chat" class="space-y-4 max-w-2xl mx-auto">
  <div class="space-y-4">
    <ChatSelect />

    <div class="flex gap-6">
      <ChatAvatarUpdate class="flex-1 max-w-24" />

      <div class="flex-1 space-y-2">
        <ChatNameUpdate />

        <ChatDomainUpdate bind:domain disabled={!!webSource} />
        <DomainConnect {domain} disabled={!!webSource || !domain.trim()} />
        {#if webSource}
          <SourceStatus sourceId={webSource.id} />
        {/if}
      </div>
    </div>

    <ChatFirstMessageUpdate />
    <ThemeSelection />
  </div>
</Card>
