<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let iframeEl: HTMLIFrameElement;

  function postTheme(theme: string) {
    if (iframeEl?.contentWindow) {
      iframeEl.contentWindow.postMessage(
        { type: "theme-change", newTheme: theme },
        "*"
      );
    }
  }

  onMount(() => {
    const htmlEl = document.documentElement;

    const detect = () => {
      const theme = htmlEl.getAttribute("data-theme");
      if (theme) return theme;
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      return mql.matches ? "dark" : "light";
    };

    setTimeout(() => {
      postTheme(detect());
    }, 1000);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          postTheme(htmlEl.getAttribute("data-theme")!);
        }
      }
    });
    observer.observe(htmlEl, { attributes: true });

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (!htmlEl.hasAttribute("data-theme")) {
        postTheme(e.matches ? "dark" : "light");
      }
    };
    mql.addEventListener("change", onChange);

    return () => {
      observer.disconnect();
      mql.removeEventListener("change", onChange);
    };
  });
</script>
