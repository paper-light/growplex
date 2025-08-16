/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    // INIT ROOM WITH MESSAGE
    if (e.record.get("chat")) {
      const chat = txApp.findRecordById("chats", e.record.get("chat"));
      const integration = txApp.findRecordById(
        "integrations",
        chat.get("integration")
      );

      console.log("Creating room before agent fetch");
      const agent = txApp.findRecordById(
        "agents",
        integration.get("agents")[0]
      );

      console.log("Creating room before message init");
      const col = txApp.findCollectionByNameOrId("messages");
      const msg = new Record(col);
      msg.set("room", e.record.id);
      msg.set("content", chat.get("firstMessage"));
      msg.set("role", "assistant");
      msg.set("event", "message");
      msg.set("visible", true);

      msg.set("sentBy", agent.get("name"));
      txApp.save(msg);
    }
  });
}, "rooms");

onRecordUpdate((e) => {
  $app.runInTransaction((txApp) => {
    if (e.record.get("type") !== "chatWidget" || e.record.get("lead")) return;
    const col = txApp.findCollectionByNameOrId("leads");
    const lead = new Record(col);
    lead.set("type", "warm");
    txApp.save(lead);

    e.record.set("lead", lead.id);
    txApp.save(e.record);
  });

  e.next();
}, "rooms");

onRecordDelete((e) => {
  $app.runInTransaction((txApp) => {
    if (e.record.get("lead")) {
      const lead = txApp.findRecordById("leads", e.record.get("lead"));
      if (lead) txApp.delete(lead);
    }

    if (e.record.get("type") !== "chatPreview" || e.record.get("chat") === "")
      return;

    const col = txApp.findCollectionByNameOrId("rooms");
    const room = new Record(col);
    room.set("chat", e.record.get("chat"));
    room.set("type", "chatPreview");
    txApp.save(room);
  });

  e.next();
}, "rooms");
