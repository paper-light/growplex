<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import { Text, Edit, Mail, Phone } from "@lucide/svelte";

  import { pb } from "@/shared/lib/pb";
  import type { LeadsResponse } from "@/shared/models/pocketbase-types";
  import Input from "@/shared/ui/Input.svelte";
  import Button from "@/shared/ui/Button.svelte";
  import TextArea from "@/shared/ui/TextArea.svelte";

  interface Props {
    class?: ClassValue;
    lead: LeadsResponse | null;
    onSuccess?: (lead: LeadsResponse) => void;
  }

  const { lead, class: className, onSuccess }: Props = $props();

  let name = $derived(lead?.name || "");
  let email = $derived(lead?.email || "");
  let phone = $derived(lead?.phone || "");
  let description = $derived(lead?.description || "");

  const isFormDirty = $derived(
    name !== lead?.name ||
      email !== lead?.email ||
      phone !== lead?.phone ||
      description !== lead?.description
  );

  async function saveLead(e: Event) {
    e.preventDefault();

    if (!isFormDirty || !lead?.id) return;

    const updatedLead = await pb.collection("leads").update(lead.id, {
      name,
      email,
      phone,
      description,
    });

    onSuccess?.(updatedLead);
  }
</script>

<div class={className}>
  <form onsubmit={saveLead}>
    <header
      class="flex items-center justify-between p-4 border-b border-base-300"
    >
      <Input
        size="lg"
        bind:value={name}
        placeholder="Name"
        labelPosition="right"
        legend="Name"
      >
        <Edit size={18} />
      </Input>

      <Button disabled={!isFormDirty} type="submit" color="primary">
        Save
      </Button>
    </header>

    <main class="p-4">
      <div class="flex flex-col gap-4">
        <Input
          class="w-full"
          bind:value={email}
          placeholder="Email"
          labelPosition="right"
          legend="Email"
        >
          <Mail size={12} />
        </Input>
        <Input
          class="w-full"
          bind:value={phone}
          placeholder="Phone"
          labelPosition="right"
          legend="Phone"
        >
          <Phone size={12} />
        </Input>
        <TextArea
          rows={8}
          class="w-full"
          bind:value={description}
          placeholder="Description">Description</TextArea
        >
      </div>
    </main>
  </form>
</div>
