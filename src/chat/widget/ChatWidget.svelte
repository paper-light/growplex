<script lang="ts">
  import { onMount } from "svelte";
  import ChatToggle from "./ChatToggle.svelte";
  import ChatContainer from "./ChatContainer.svelte";

  interface Props {
    id: string;
    domain: string;
    color?: string;
  }

  let { id, domain, color }: Props = $props();

  let authed = $state(false);
  let isOpen = $state(false);

  function toggle(state: boolean) {
    isOpen = state;
    sessionStorage.setItem("chat-widget-open", isOpen ? "true" : "false");
  }

  onMount(async () => {
    const response = await fetch(`${domain}/api/chat/auth`, {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      console.error("Failed to authenticate chat widget");
      return;
    }

    const { token, payload } = await response.json();
    sessionStorage.setItem("chat-widget-token", token);
    sessionStorage.setItem("chat-widget-payload", JSON.stringify(payload));
    authed = true;

    if (sessionStorage.getItem("chat-widget-open") === "true") isOpen = true;

    document.documentElement.style.setProperty(
      "--chat-widget-primary",
      color || "#007aff"
    );
  });
</script>

{#if authed}
  <ChatToggle {isOpen} onToggle={() => toggle(true)} />
  <ChatContainer {isOpen} {id} {domain} onClose={() => toggle(false)} />
{/if}
