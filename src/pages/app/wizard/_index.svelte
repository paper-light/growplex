<script lang="ts">
  import ChatConnect from "@/chat/ui/features/crud/ChatConnect.svelte";
  import ChatForm from "@/chat/ui/widgets/ChatForm.svelte";
  import AgentForm from "@/agent/ui/widgets/AgentForm.svelte";
</script>

<div class="h-full flex flex-col p-4 gap-2 overflow-y-auto">
  <ChatConnect />
  <ChatForm />
  <AgentForm />
</div>
