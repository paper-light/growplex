/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    if (!e.record.get("name")) {
      e.record.set("name", `Project ${e.record.id.slice(0, 4)}`);
    }

    const col = txApp.findCollectionByNameOrId("integrations");
    const integration = new Record(col);
    integration.set("project", e.record.id);
    txApp.save(integration);

    txApp.save(e.record);
  });
}, "projects");
