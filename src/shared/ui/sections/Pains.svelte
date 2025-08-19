<script lang="ts">
  import { onMount } from "svelte";

  interface PainPoint {
    title: string;
    description: string;
    icon: string;
    severity?: "low" | "medium" | "high";
  }

  interface Props {
    title: string;
    pains: PainPoint[];
    theme?: "default" | "dark" | "gradient";
  }

  const { title, pains, theme = "default" }: Props = $props();

  let containerRef: HTMLElement | null = $state(null);
  let isVisible = $state(false);

  const severityColors = {
    low: "text-warning",
    medium: "text-orange-500",
    high: "text-error",
  };

  const severityBgColors = {
    low: "bg-warning/10",
    medium: "bg-orange-500/10",
    high: "bg-error/10",
  };

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef) {
      observer.observe(containerRef);
    }

    return () => observer.disconnect();
  });
</script>

<section
  bind:this={containerRef}
  class={[
    "w-full py-16 lg:py-24",
    theme === "dark" && "bg-base-300",
    theme === "gradient" && "bg-gradient-to-br from-warning/5 to-error/5",
  ]}
>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-16 space-y-4">
      <h2 class="text-4xl lg:text-5xl font-bold leading-tight">
        {title}
      </h2>
    </div>

    <!-- Pain Points Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each pains as pain, index}
        <div
          class={[
            "group transition-all duration-700 ease-out",
            isVisible && "opacity-100 translate-y-0",
            !isVisible && "opacity-0 translate-y-8",
          ]}
          style="transition-delay: {index * 100}ms"
        >
          <div
            class="relative flex flex-col items-center text-center p-8 rounded-2xl border transition-all duration-200 bg-base-100 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-warning/30 group-hover:bg-warning/5 h-full"
          >
            <!-- Icon Container -->
            <div
              class="p-6 rounded-2xl bg-warning/10 mb-6 aspect-square flex items-center justify-center border border-warning/20 group-hover:bg-warning/20 group-hover:border-warning/30 group-hover:scale-110 transition-all duration-300"
            >
              <span
                class="text-6xl group-hover:text-7xl transition-all duration-300"
              >
                {@html pain.icon}
              </span>
            </div>

            <!-- Content -->
            <div class="flex-1 space-y-4">
              <h3
                class="text-xl font-bold text-base-content group-hover:text-warning transition-colors"
              >
                {pain.title}
              </h3>
              <p class="text-lg text-base-content/70 leading-relaxed">
                {pain.description}
              </p>
            </div>

            <!-- Pain Indicator -->
            <div
              class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div class="flex space-x-1">
                <div
                  class="w-2 h-2 bg-warning rounded-full animate-pulse"
                ></div>
                <div
                  class="w-2 h-2 bg-warning rounded-full animate-pulse"
                  style="animation-delay: 0.2s"
                ></div>
                <div
                  class="w-2 h-2 bg-warning rounded-full animate-pulse"
                  style="animation-delay: 0.4s"
                ></div>
              </div>
            </div>

            <!-- Bottom Border Indicator -->
            <div
              class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-warning/0 via-warning/50 to-warning/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
