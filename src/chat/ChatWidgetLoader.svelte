<script lang="ts">
  import {
    PUBLIC_CHAT_WIDGET_DOMAIN,
    PUBLIC_CHAT_WIDGET_ID,
  } from "astro:env/client";
  import { onMount } from "svelte";

  function boot() {
    const id = PUBLIC_CHAT_WIDGET_ID;
    const domain = PUBLIC_CHAT_WIDGET_DOMAIN;
    if (!window.ChatWidget) return;
    if (!window.ChatWidget._loaded) {
      window.ChatWidget.init({
        id,
        domain,
        color: "var(--color-yellow-500)",
      });
    } else {
      window.ChatWidget.reload({
        id,
        domain,
        color: "var(--color-yellow-500)",
      });
    }
  }

  function ensureWidget() {
    console.log("ensureWidget");
    if (
      typeof window !== "undefined" &&
      (!window.ChatWidget || !window.ChatWidget._loaded)
    ) {
      boot();
    }
  }

  onMount(() => {
    if (typeof window !== "undefined" && (window as any).__chatWidgetLoaded) {
      boot();
    } else {
      (window as any).__chatWidgetLoaded = true;
      const script = document.createElement("script");
      script.src = `${PUBLIC_CHAT_WIDGET_DOMAIN}/scripts/chat-widget.js`;
      script.dataset.chatId = PUBLIC_CHAT_WIDGET_ID;
      script.async = true;
      script.onload = boot;
      document.body.appendChild(script);
    }

    console.log("add event listener");
    window.addEventListener("astro:page-load", ensureWidget);
  });
</script>
