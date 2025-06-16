import { mount, unmount } from "svelte";
import ChatWidget from "./ChatWidget.svelte";

type WidgetAPI = {
  $on?(evt: string, cb: (e: any) => void): () => void;
  $set?(props: Partial<{ id: string; domain: string; color?: string }>): void;
} & Record<string, any>;

let app: WidgetAPI | null = null;

export function init(opts: { id: string; domain: string; color?: string }) {
  if (!app) {
    app = mount(ChatWidget, {
      target: document.body,
      props: opts,
      intro: true,
    });
    (window as any).ChatWidget._loaded = true;
  } else if (typeof app.$set === "function") {
    app.$set!(opts); 
  } else {
    unmount(app, { outro: false });
    app = mount(ChatWidget, {
      target: document.body,
      props: opts,
    });
  }
}

export function reload(opts?: { id: string; domain: string; color?: string }) {
  init(opts ?? (app as any));
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
