export function formatConnectionScript(chatId: string, theme: string) {
  return `
<script src="https://growplex.dev/scripts/chat-widget.js"><\/script>

<script>
  (function () {
    if (!window.ChatWidget) return;

    const theme = document.documentElement.getAttribute("data-theme");
    const open = localStorage.getItem("chat-widget-open") === "true";

    if (!window.ChatWidget) return;
    window.ChatWidget.init({
      chatId: ${chatId},
      domain: "https://growplex.dev",
      listenTheme: false, // if true, will listen html data-theme attribute
      // initTheme: theme || ${theme}, // you can set any default theme here
      initOpen: open,
    });
  })();
<\/script>`.trim();
}
