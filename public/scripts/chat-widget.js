(() => {
  const STYLE_ID = "chat-widget-styles";

  // SVG icons
  const CHAT_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  `;
  const CLOSE_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  `;

  // Inject CSS once
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const css = `
  .chat-widget-toggle {
    background: transparent;
    border: 2px solid var(--chat-widget-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: fixed;
    bottom: 2rem;
    right: 1rem;
    width: 3.5rem;
    height: 3.5rem;
    cursor: pointer;
    z-index: 10000;
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .chat-widget-toggle svg {
    width: 2rem;
    height: 2rem;
    stroke: var(--chat-widget-primary);
    transition: stroke 0.2s ease;
  }
  .chat-widget-toggle:hover {
    background: var(--chat-widget-primary);
  }
  .chat-widget-toggle:hover svg {
    stroke: #fff;
  }
  @media (min-width: 768px) {
    .chat-widget-toggle {
      width: 4rem;
      height: 4rem;
    }
  }

  .chat-widget-container {
    position: fixed;
    /* initial “small” position */
    bottom: 6.5rem;
    right: 1rem;
    width: 480px;
    height: 720px;
    max-width: 90vw;
    max-height: 80vh;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    background: #fff;
    overflow: hidden;
    z-index: 9999;

    /* start off-screen to the right */
    transform: translate3d(120%, 0, 0);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  /* Slide in to place when “open” */
  .chat-widget-container.open {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }

  /* Desktop tweak: nudge farther right, widen */
  @media (min-width: 768px) {
    .chat-widget-container {
      right: 4rem;
      width: 400px;
    }
  }

  /* Mobile: override starting off-screen to bottom */
  @media (max-width: 767px) {
    .chat-widget-container {
      /* ignore horizontal start */
      transform: translate3d(0, 100%, 0);
      /* keep bottom where the “small” state would have been */
      bottom: 6.5rem;
      right: 1rem;
    }
    .chat-widget-container.open {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }

    @media (max-width: 767px) {
    /* when the widget is closed (i.e. no “open” class), ignore all pointer events */
    .chat-widget-container:not(.open) {
      pointer-events: none;
    }
    /* once it opens, restore interactivity */
    .chat-widget-container.open {
      pointer-events: auto;
    }
  }


  /* Fullscreen (mobile or desktop if you want) */
  .chat-widget-container.fullscreen {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
    box-shadow: none;
    /* ensure it’s fully visible */
    transform: translate3d(0,0,0);
    opacity: 1;
  }

  .chat-widget-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  }

  .chat-widget-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    z-index: 10001;
    display: none; /* still toggled via JS */
  }
  .chat-widget-close svg {
    width: 2rem;
    height: 2rem;
    stroke: var(--chat-widget-primary);
  }
`;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  const ChatWidget = {
    _loaded: false,
    _config: null,
    _btn: null,
    _container: null,
    _iframe: null,
    _closeBtn: null,
    _observer: null,
    _mediaQueryList: null,
    _mediaListener: null,

    /**
     * Initialize the chat widget. Safe to call multiple times;
     * real setup only happens once.
     * @param {{id: string, domain: string}} options
     */
    init({ id, domain, color }) {
      if (this._loaded) return;
      this._loaded = true;
      this._config = { ...this._config, id, domain };
      injectStyles();

      color = color || "oklch(85.2% 0.199 91.936)";
      const applyColor = () => {
        document.documentElement.style.setProperty(
          "--chat-widget-primary",
          color
        );
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyColor);
      } else {
        applyColor();
      }

      // Create toggle button
      const btn = document.createElement("button");
      btn.classList.add("chat-widget-toggle");
      btn.setAttribute("aria-label", "Open chat");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "chat-widget-container");
      btn.innerHTML = CHAT_SVG;
      document.body.appendChild(btn);
      this._btn = btn;

      // Create container
      const container = document.createElement("div");
      container.classList.add("chat-widget-container");
      container.id = "chat-widget-container";
      container.setAttribute("role", "dialog");
      container.setAttribute("aria-modal", "true");
      container.setAttribute("aria-hidden", "true");
      document.body.appendChild(container);
      this._container = container;

      // Create iframe
      const iframe = document.createElement("iframe");
      iframe.classList.add("chat-widget-iframe");
      iframe.src = `${domain}/embed/chat/${id}`;
      iframe.title = "Chat";
      iframe.allowTransparency = "true";
      container.appendChild(iframe);
      this._iframe = iframe;

      // Create close button
      const closeBtn = document.createElement("button");
      closeBtn.classList.add("chat-widget-close");
      closeBtn.setAttribute("aria-label", "Close chat");
      closeBtn.innerHTML = CLOSE_SVG;
      container.appendChild(closeBtn);
      this._closeBtn = closeBtn;

      // Helper
      const isMobile = () => window.innerWidth < 768;

      // Open / Close functions
      const openChat = () => {
        const cls = container.classList;
        cls.add("open");
        if (isMobile()) {
          cls.add("fullscreen");
          closeBtn.style.display = "block";
          btn.style.display = "none";
        } else {
          cls.remove("fullscreen");
          closeBtn.style.display = "none";
          btn.style.display = "flex";
          btn.innerHTML = CLOSE_SVG;
        }
        container.setAttribute("aria-hidden", "false");
        btn.setAttribute("aria-expanded", "true");
        sessionStorage.setItem("chat-widget-open", "true");
      };

      const closeChat = () => {
        btn.focus();
        const cls = container.classList;
        cls.remove("open", "fullscreen");
        closeBtn.style.display = "none";
        btn.style.display = "flex";
        btn.innerHTML = CHAT_SVG;
        container.setAttribute("aria-hidden", "true");
        btn.setAttribute("aria-expanded", "false");
        sessionStorage.setItem("chat-widget-open", "false");
      };

      btn.addEventListener("click", () =>
        btn.getAttribute("aria-expanded") === "true" ? closeChat() : openChat()
      );
      closeBtn.addEventListener("click", closeChat);

      // Persist open state
      if (sessionStorage.getItem("chat-widget-open") === "true") {
        openChat();
      }

      // Theme forwarding
      const forwardTheme = (theme) => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            { type: "theme-change", newTheme: theme },
            "*"
          );
        }
      };
      const htmlEl = document.documentElement;
      const detect = () =>
        htmlEl.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      forwardTheme(detect());

      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "attributes" && m.attributeName === "data-theme") {
            forwardTheme(htmlEl.getAttribute("data-theme"));
          }
        }
      });
      observer.observe(htmlEl, { attributes: true });
      this._observer = observer;

      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e) => {
        if (!htmlEl.getAttribute("data-theme")) {
          forwardTheme(e.matches ? "dark" : "light");
        }
      };
      mql.addEventListener("change", listener);
      this._mediaQueryList = mql;
      this._mediaListener = listener;
    },

    /**
     * Completely tear down and remove all DOM, listeners, observers
     */
    destroy() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      if (this._mediaQueryList && this._mediaListener) {
        this._mediaQueryList.removeEventListener("change", this._mediaListener);
        this._mediaQueryList = null;
        this._mediaListener = null;
      }
      if (this._btn) this._btn.remove();
      if (this._container) this._container.remove();
      this._btn = this._container = this._iframe = this._closeBtn = null;
      this._loaded = false;
    },

    /**
     * Reloads the widget:
     * - if iframe still exists, just refresh its content
     * - otherwise completely destroy & re-init
     */
    reload() {
      if (this._iframe && this._iframe.contentWindow) {
        this._iframe.contentWindow.location.reload();
        return;
      }
      this.destroy();
      if (this._config) {
        this.init(this._config);
      }
    },
  };

  window.ChatWidget = ChatWidget;
})();
