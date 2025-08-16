/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    if (e.record.get("type") !== "chatWidget") return;

    const col = txApp.findCollectionByNameOrId("leads");
    const lead = new Record(col);
    lead.set("type", "warm");
    txApp.save(lead);

    e.record.set("lead", lead.id);
    txApp.save(e.record);
  });
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
    room.set("status", "preview");
    txApp.save(room);
  });

  e.next();
}, "rooms");
