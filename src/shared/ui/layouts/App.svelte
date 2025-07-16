<script lang="ts">
  import "../../../auth/pb/pb-on-change";

  import { onMount, untrack } from "svelte";

  import { pb } from "../../lib/pb";
  import { initData } from "../../../user/init-data";
  import { userProvider } from "../../../user/user.svelte";
  import { socketProvider } from "../../../chat/provider/socket.svelte";
  import { roomsProvider } from "../../../chat/provider/rooms.svelte";
  import { sourcesProvider } from "../../../knowledge/providers/sources.svelte";
  import { documentsProvider } from "../../../knowledge/providers/documents.svelte";

  // GLOBAL
  onMount(() => {
    initData();
    socketProvider.connect(pb.authStore.token);

    return () => {
      socketProvider.disconnect();
    };
  });

  // ROOMS
  $effect(() => {
    const chat = userProvider.chat;
    console.log("subscribe rooms with chat:", chat?.id);

    untrack(() => {
      if (chat) roomsProvider.subscribe(chat.id);
    });

    return () => {
      roomsProvider.unsubscribe();
    };
  });

  // SOCKET WITH MESSAGES
  $effect(() => {
    const room = roomsProvider.room;

    untrack(async () => {
      await socketProvider.onlinePromise;
      if (room) socketProvider.joinRoom(room.id);
    });
  });

  // SOURCES
  $effect(() => {
    const project = userProvider.project;
    console.log("subscribe sources with project:", project?.id);

    untrack(() => {
      if (project) sourcesProvider.subscribe(project.id);
    });

    return () => {
      sourcesProvider.unsubscribe();
    };
  });

  // DOCUMENTS
  $effect(() => {
    const source = sourcesProvider.source;
    console.log("subscribe documents with source:", source?.id);

    untrack(() => {
      if (source) documentsProvider.subscribe(source.id);
    });

    return () => {
      documentsProvider.unsubscribe();
    };
  });
</script>
