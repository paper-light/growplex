<script lang="ts">
  import "@/user/pb-on-change";

  import { onMount, untrack } from "svelte";

  import { pb } from "@/shared/lib/pb";
  import { userProvider } from "@/user/user.svelte";
  import { socketProvider } from "@/chat/providers/socket.svelte";
  import { sourcesProvider } from "@/source/providers/sources.svelte";
  import { documentsProvider } from "@/document/providers/documents.svelte";
  import { projectsProvider } from "@/project/providers/projects.svelte";
  import { agentsProvider } from "@/agent/providers/agents.svelte";
  import { chatsProvider } from "@/chat/providers/chats.svelte";
  import { roomsProvider } from "@/chat/providers/rooms.svelte";
  import { integrationsProvider } from "@/integration/providers/integrations.svelte";
  import { subscriptionProvider } from "@/billing/providers/subscription.svelte";
  import { ticketsProvider } from "@/ticket/providers/tickets.svelte";

  // GLOBAL
  onMount(() => {
    if (pb.authStore.record) userProvider.subscribe(pb.authStore.record.id);

    return () => {
      userProvider.unsubscribe();
    };
  });

  // USER AUTH EFFECT
  $effect(() => {
    console.log("userProvider.token", userProvider.token);
    const token = userProvider.token;
    if (!token) return;

    untrack(() => {
      socketProvider.connect(token);
    });

    return () => {
      socketProvider.disconnect();
    };
  });

  // ORG CHANGE EFFECT
  $effect(() => {
    const org = userProvider.selectedOrg;
    if (!org) return;

    untrack(() => {
      projectsProvider.subscribe(org.id);
      subscriptionProvider.subscribe(org.id);
    });

    return () => {
      projectsProvider.unsubscribe();
      subscriptionProvider.unsubscribe();
    };
  });

  // PROJECT CHANGE EFFECT
  $effect(() => {
    const project = projectsProvider.selectedProject;
    if (!project) return;

    untrack(() => {
      documentsProvider.subscribe(project.id);
      integrationsProvider.subscribe(project.id);
      agentsProvider.subscribe(project.id);
      chatsProvider.subscribe(project.id);
      sourcesProvider.subscribe(project.id);
      roomsProvider.subscribe(project.id);
      ticketsProvider.subscribe(project.id);
    });

    return () => {
      documentsProvider.unsubscribe();
      integrationsProvider.unsubscribe();
      agentsProvider.unsubscribe();
      chatsProvider.unsubscribe();
      sourcesProvider.unsubscribe();
      roomsProvider.unsubscribe();
      ticketsProvider.unsubscribe();
    };
  });

  // SOURCE CHANGE EFFECT
  $effect(() => {
    const source = sourcesProvider.selectedSource;
    if (!source) return;

    untrack(() => {
      documentsProvider.initSource(source.id);
    });
  });

  // ROOM CHANGE EFFECT
  $effect(() => {
    const room = roomsProvider.selectedRoom;
    if (!room || !socketProvider.online) return;

    untrack(() => {
      socketProvider.joinRoom(room.id);
    });

    return () => {
      socketProvider.leaveRoom(room.id);
    };
  });
</script>
