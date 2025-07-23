/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    const integrations = txApp.findRecordsByFilter(
      "integrations",
      `project = "${e.record.id}"`
    );

    if (integrations.length === 0) {
      console.log(
        "No integrations found, creating default integration...",
        e.record.id
      );

      // Integration
      const col = txApp.findCollectionByNameOrId("integrations");
      const integration = new Record(col);
      integration.set("name", `Integration ${e.record.id.slice(0, 4)}`);
      integration.set("project", e.record.id);
      txApp.save(integration);
    }
  });
}, "projects");
