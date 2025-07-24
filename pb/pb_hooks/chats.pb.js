/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next();
  $app.runInTransaction((txApp) => {
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
