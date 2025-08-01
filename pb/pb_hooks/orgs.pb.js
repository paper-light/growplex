/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  console.log("Creating org with id:", e.record.id);

  $app.runInTransaction((txApp) => {
    const subSub = txApp.findCollectionByNameOrId("subscriptions");
    const sub = new Record(subSub);

    const tier = txApp.findRecordById("tiers", "rdb5ipldiw79jag");

    sub.set("tier", tier.id);
    txApp.save(sub);

    const created = sub.getDateTime("created");
    const ended = new Date(created);
    ended.setDate(ended.getDate() + 10);

    sub.set("subscribed", created);
    sub.set("ended", ended);

    txApp.save(sub);

    e.record.set("subscription", sub.id);
    e.record.set("earlyAdopter", "Free");
  });

  e.next();
}, "orgs");

onRecordDelete((e) => {
  console.log("Deleting org with id:", e.record.id);

  $app.runInTransaction((txApp) => {
    const sub = txApp.findRecordById(
      "subscriptions",
      e.record.get("subscription")
    );
    txApp.delete(sub);
  });

  e.next();
}, "orgs");
