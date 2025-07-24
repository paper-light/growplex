<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    iframeEl: HTMLIFrameElement;
    listenTheme?: boolean;
  }

  let { iframeEl, listenTheme = false }: Props = $props();

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
    };

    setTimeout(() => {
      const theme = detect();
      if (theme) postTheme(theme);
    }, 1000);

    if (!listenTheme) return;

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
