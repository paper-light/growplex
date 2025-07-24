/// <reference path="../pb_data/types.d.ts" />

onRecordDelete((e) => {
  $app.runInTransaction((txApp) => {
    if (e.record.get("status") !== "preview") return;

    const col = txApp.findCollectionByNameOrId("rooms");
    const room = new Record(col);
    room.set("chat", e.record.get("chat"));
    room.set("status", "preview");
    txApp.save(room);
  });

  e.next();
}, "rooms");
