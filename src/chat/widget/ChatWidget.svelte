<script lang="ts">
  import { onMount } from "svelte";
  import ChatToggle from "./ChatToggle.svelte";
  import ChatContainer from "./ChatContainer.svelte";
  import ThemeForward from "./ThemeForward.svelte"

  interface Props {
    id: string;
    domain: string;
    color?: string;
  }

  let { id, domain, color }: Props = $props();

  let isOpen = $state(false);

  function toggle() {
    isOpen = !isOpen;
    sessionStorage.setItem("chat-widget-open", isOpen ? "true" : "false");
  }

  onMount(() => {
    if (sessionStorage.getItem("chat-widget-open") === "true") {
      isOpen = true;
    }

    document.documentElement.style.setProperty(
      "--chat-widget-primary",
      color || "#007aff"
    );
  });
</script>


<ChatToggle {isOpen} onToggle={toggle} />
<ChatContainer {isOpen} {id} {domain} onClose={() => (isOpen = false)} />
