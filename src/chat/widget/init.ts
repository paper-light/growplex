import { mount, unmount } from "svelte";
import ChatWidget from "./ChatWidget.svelte";

type WidgetProps = {
  chatId: string;
  domain: string;
  color?: string;
  initTheme?: string;
  listenTheme?: boolean;
};

type WidgetAPI = {
  $on?(evt: string, cb: (e: any) => void): () => void;
  $set?(props: Partial<WidgetProps>): void;
} & Record<string, any>;

let app: WidgetAPI | null = null;

export function init(opts: WidgetProps) {
  const target = document.getElementById("chat-widget-root") || document.body;
  if (!app) {
    app = mount(ChatWidget, {
      target,
      props: opts,
      intro: true,
    });
    (window as any).ChatWidget._loaded = true;
  } else if (typeof app.$set === "function") {
    app.$set!(opts);
  } else {
    unmount(app, { outro: false });
    app = mount(ChatWidget, {
      target,
      props: opts,
    });
  }
}

export function reload(opts?: { color: string }) {
  const target = document.getElementById("chat-widget-root") || document.body;
  target.style.setProperty("--chat-widget-primary", opts?.color || "#007aff");
}

export async function destroy() {
  if (app) {
    await unmount(app, { outro: true });
    app = null;
    (window as any).ChatWidget._loaded = false;
  }
}

// finally, wire it up on window
(window as any).ChatWidget = { init, reload, destroy };
