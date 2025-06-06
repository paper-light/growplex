<script lang="ts">
  import { onMount } from "svelte";
  import { nanoid } from "nanoid";
  import { io, Socket } from "socket.io-client";

  let roomId = $state("");
  let username = $state("");
  let socket: Socket | null = $state(null);

  onMount(async () => {
    const savedRoom = localStorage.getItem("chat_room_id");
    if (savedRoom) {
      roomId = savedRoom;
    } else {
      roomId = nanoid(10);
      localStorage.setItem("chat_room_id", roomId);
    }

    const savedUser = localStorage.getItem("chat_username");
    if (savedUser) {
      username = savedUser;
    } else {
      // generate a simple “Anonymous-XXXX” or prompt user in future
      username = `Anonymous-${nanoid(4)}`;
      localStorage.setItem("chat_username", username);
    }

    const CHAT_SERVER_URL = chat.domain;
    socket = io(CHAT_SERVER_URL, {
      // you can pass auth headers or query if needed later
      // auth: { token: "..." },
    });

    // 1.4) When socket is connected, emit join-room
    socket.on("connect", () => {
      console.log("🟢 Connected to server, socket.id =", socket!.id);
      socket!.emit("join-room", { roomId, username });
    });

    // 1.5) Listen for the last 100 messages (or whatever is returned)
    socket.on("chat-history", (history: Message[]) => {
      // Replace the local array so that reactivity updates the UI
      messages = [...history];
      // Scroll to bottom on next tick
      tick().then(() => scrollToBottom());
    });

    // 1.6) When a brand‐new message arrives
    socket.on("new-message", (m: Message) => {
      messages = [...messages, m];
      tick().then(() => scrollToBottom());
    });

    // 1.7) If the server ever emits rate‐limit
    socket.on("rate-limit", (data: { message: string }) => {
      // You can show a toast or disable input
      console.warn("Rate limit from server:", data.message);
      // (Optionally) show a small UI message
    });

    // 1.8) If the server signals the room is closed
    socket.on("room-closed", () => {
      // e.g. show a banner: “Chat is now closed”
      console.log("🔴 Room has been closed by operator.");
    });

    // 1.9) Clean up on unmount
    return () => {
      socket.disconnect();
    };
  });
</script>
