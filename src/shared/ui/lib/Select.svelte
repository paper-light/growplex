<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    onChange: (e: Event) => void;
    selectedValue?: string;
    size?: "sm" | "md" | "lg";
    options: { value: string; label: string }[];
    children: Snippet;
  }

  let {
    children,
    onChange,
    selectedValue = $bindable(),
    options,
    size = "md",
  }: Props = $props();

  const sizesMap = {
    sm: "select-sm",
    md: "select-md",
    lg: "select-lg",
  };
</script>

<select
  class={["select select-bordered w-full", sizesMap[size]]}
  onchange={onChange}
>
  <option value="">{@render children()}</option>
  {#each options as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>
