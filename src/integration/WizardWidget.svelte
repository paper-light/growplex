<script lang="ts">
  import AgentForm from "../agent/AgentForm.svelte";
  import ChatForm from "../chat/ui/ChatForm.svelte";
</script>

<div class="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
  <!-- Chat Form -->
  <ChatForm />

  <!-- Agent Form -->
  <AgentForm />
</div>
