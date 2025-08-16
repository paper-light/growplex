<script lang="ts">
  import {
    Home,
    Bot,
    MessageSquare,
    BookOpen,
    Users,
    ChartBar,
    CreditCard,
    Ticket,
    Rocket,
    Blocks,
    FileUser,
  } from "@lucide/svelte";

  interface Props {
    active: string;
  }

  let { active }: Props = $props();

  function classHeader(names: string[]) {
    const base =
      "flex items-center justify-between w-full rounded-lg p-2 cursor-pointer font-semibold";
    return names.includes(active) ? `${base} text-primary` : `${base} `;
  }

  function linkClass(name: string, disabled = false) {
    const base = "btn btn-block w-full justify-start rounded-lg btn-ghost";
    if (disabled) {
      return `${base} text-base-content/50 cursor-not-allowed opacity-60`;
    }
    return active === name ? `${base} text-primary` : `${base} `;
  }
</script>

<nav class="flex-1 overflow-y-auto">
  <ul class="menu menu-vertical gap-1 w-full">
    <li class="w-full">
      <a href="/app" class={["text-left", linkClass("Home")]}>
        <Home size={18} />
        Home
      </a>
    </li>
    <li class="w-full">
      <a
        href="/app/wizard"
        class={["text-left", linkClass("Integration Wizard")]}
      >
        <Rocket size={18} />
        Integration Wizard
      </a>
    </li>

    <li class="w-full">
      <details class="group block w-full" open={true}>
        <summary
          class={classHeader([
            "Integrations",
            "Agents",
            "Chats",
            "Knowledge",
            "Operators",
          ])}
        >
          <span>Resources</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <a href={`/app/integrations`} class={linkClass("Integrations")}>
              <Blocks size={18} />
              Integrations
            </a>
          </li>

          <li class="w-full">
            <a href={`/app/agents`} class={linkClass("Agents")}>
              <Bot size={18} />
              Agents
            </a>
          </li>
          <li class="w-full">
            <a href={`/app/chats`} class={linkClass("Chats")}>
              <MessageSquare size={18} />
              Chats
            </a>
          </li>
          <li class="w-full">
            <a href={`/app/knowledge`} class={linkClass("Knowledge")}>
              <BookOpen size={18} />
              Knowledge
            </a>
          </li>
          <li class="w-full">
            <span
              class={["text-left", linkClass("Operators", true)]}
              title="Coming soon"
            >
              <Users size={18} />
              Operators
            </span>
          </li>
        </ul>
      </details>
    </li>

    <li class="w-full">
      <details class="group block w-full" open={true}>
        <summary class={classHeader(["Chat Rooms"])}>
          <span>CRM</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <a href={`/app/leads`} class={linkClass("Leads")}>
              <FileUser size={18} />
              Leads
            </a>
          </li>
          <li class="w-full">
            <a href={`/app/chat`} class={linkClass("Messanger")}>
              <MessageSquare size={18} />
              Messanger
            </a>
          </li>
          <li class="w-full">
            <span class={linkClass("Tickets", true)} title="Coming soon">
              <Ticket size={18} />
              Tickets
            </span>
          </li>
        </ul>
      </details>
    </li>

    <li class="w-full">
      <details class="group block w-full" open={true}>
        <summary class={classHeader(["Analytics", "Billing"])}>
          <span>Control</span>
        </summary>

        <ul class="mt-2 space-y-1">
          <li class="w-full">
            <!-- <a href={`/app/analytics`} class={linkClass("Analytics")}>
              <ChartBar size={18} />
              Analytics
            </a> -->
            <span
              class={["text-left", linkClass("Analytics", true)]}
              title="Coming soon"
            >
              <ChartBar size={18} />
              Analytics
            </span>
          </li>
          <li class="w-full">
            <a href={`/app/billing`} class={linkClass("Billing")}>
              <CreditCard size={18} />
              Billing
            </a>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</nav>
