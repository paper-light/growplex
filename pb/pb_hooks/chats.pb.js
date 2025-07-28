/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    // Set default values
    if (!e.record.get("name"))
      e.record.set("name", `Chat ${e.record.id.slice(0, 4)}`);

    if (!e.record.get("firstMessage"))
      e.record.set(
        "firstMessage",
        "Hello! I am your support agent. You can ask me anything."
      );

    const theme = JSON.parse(e.record.get("theme"));
    if (!theme) {
      const initTheme = {
        preview: "light",
        production: "light",
        config: {},
      };
      console.log("Creating default theme for chat", e.record.id, initTheme);
      e.record.set("theme", JSON.stringify(initTheme));
    }
    txApp.save(e.record);

    // Create a preview room for the chat
    const col = txApp.findCollectionByNameOrId("rooms");
    const room = new Record(col);
    room.set("chat", e.record.id);
    room.set("status", "preview");
    txApp.save(room);
  });
}, "chats");

onRecordUpdate((e) => {
  $app.runInTransaction((txApp) => {
    const domain = e.record.get("domain");
    const tgToken = e.record.get("tgToken");
    if (domain) {
      console.log("Checking domain", domain);
      const allChats = txApp.findRecordsByFilter(
        "chats",
        `domain = "${domain}"`
      );
      const selfUpdate =
        allChats.length === 1 && allChats[0].id === e.record.id;
      if (!selfUpdate && allChats.length > 0)
        throw new Error("Domain already in use");
    }
    if (tgToken) {
      console.log("Checking telegram token", tgToken);
      const allChats = txApp.findRecordsByFilter(
        "chats",
        `tgToken = "${tgToken}"`
      );
      const selfUpdate =
        allChats.length === 1 && allChats[0].id === e.record.id;
      if (!selfUpdate && allChats.length > 0)
        throw new Error("Telegram token already in use");
    }
  });

  e.next();
}, "chats");
