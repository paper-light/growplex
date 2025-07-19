<script lang="ts">
  import { userProvider } from "../../../user/user.svelte";
  import ThemeSelection from "../features/ThemeSelection.svelte";
  import ChatCreate from "../features/ChatCreate.svelte";
  import DomainConnect from "../../../knowledge/ui/DomainConnect.svelte";
  import { sourcesProvider } from "../../../knowledge/providers/sources.svelte";
  import ChatAvatarUpdate from "../features/ChatAvatarUpdate.svelte";
  import ChatNameUpdate from "../features/ChatNameUpdate.svelte";
  import ChatDomainUpdate from "../features/ChatDomainUpdate.svelte";
  import ChatFirstMessageUpdate from "../features/ChatFirstMessageUpdate.svelte";
  import ChatSelect from "../features/ChatSelect.svelte";

  import Card from "../../../shared/ui/lib/Card.svelte";
  import SourceStatus from "../../../knowledge/ui/SourceStatus.svelte";

  const integartion = $derived(userProvider.integration);
  const currentChat = $derived(userProvider.chat);
  const allChats = $derived(userProvider.project?.expand?.chats || []);

  const sources = $derived(
    sourcesProvider.sources.filter((s) => integartion?.sources?.includes(s.id))
  );
  const webSource = $derived(sources.find((s) => s.type === "web") || null);

  let domain = $derived(currentChat?.domain ?? "");
</script>

<!-- NO CHAT SELECTED -->
{#if !currentChat}
  <div class="flex flex-col items-center justify-center gap-6 py-16">
    <div class="w-full max-w-xl flex flex-col gap-4">
      <ChatCreate size="lg" />
      {#if allChats.length > 0}
        <ChatSelect />
      {/if}
    </div>
  </div>

  <!-- CHAT SELECTED -->
{:else}
  <Card>
    <div class="flex gap-6">
      <ChatAvatarUpdate class="flex-1 max-w-24" />

      <div class="flex-1 space-y-2">
        <ChatNameUpdate />

        <ChatDomainUpdate bind:domain disabled={!!webSource} />
        <DomainConnect
          {domain}
          disabled={!!webSource || !domain.trim()}
          class="flex justify-end"
        />
        {#if webSource}
          <SourceStatus sourceId={webSource.id} />
        {/if}
      </div>
    </div>

    <ChatFirstMessageUpdate />
    <ThemeSelection />
  </Card>
{/if}
