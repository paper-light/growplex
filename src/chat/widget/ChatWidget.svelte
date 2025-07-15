<script lang="ts">
  import { onMount } from "svelte";
  import ChatToggle from "./ChatToggle.svelte";
  import ChatContainer from "./ChatContainer.svelte";
  import { ChatWidgetPayloadSchema } from "../lib/models";

  interface Props {
    chatId: string;
    domain: string;
    color?: string;
  }

  let { chatId, domain, color }: Props = $props();

  let token = $state("");

  let isOpen = $state(false);

  function toggle(state: boolean) {
    isOpen = state;
    sessionStorage.setItem("chat-widget-open", isOpen ? "true" : "false");
  }

  onMount(async () => {
    const payloadStr = localStorage.getItem("chat-widget-payload");
    const payload = payloadStr
      ? ChatWidgetPayloadSchema.parse(JSON.parse(payloadStr))
      : null;

    const body = JSON.stringify({
      chatId,
      roomId: payload?.roomId,
      username: payload?.username,
    });
    console.log(payload, body);

    const response = await fetch(`${domain}/api/chat/auth`, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      console.error("Failed to authenticate chat widget");
      return;
    }

    const { token: t, payload: p } = await response.json();
    localStorage.setItem("chat-widget-payload", JSON.stringify(p));
    token = t;

    if (sessionStorage.getItem("chat-widget-open") === "true") isOpen = true;

    document.documentElement.style.setProperty(
      "--chat-widget-primary",
      color || "#007aff"
    );
  });
</script>

{#if token}
  <ChatToggle {isOpen} onToggle={() => toggle(true)} />
  <ChatContainer
    {token}
    {isOpen}
    {chatId}
    {domain}
    onClose={() => toggle(false)}
  />
{/if}
