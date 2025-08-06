/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  if (!e.record.get("name")) {
    e.record.set("name", `Source ${e.record.id.slice(0, 4)}`);
  }

  e.next();
}, "sources");

onRecordDelete((e) => {
  $app.runInTransaction((txApp) => {
    const docs = txApp.findRecordsByFilter(
      "documents",
      `source = "${e.record.id}"`
    );

    docs.forEach((doc) => {
      txApp.delete(doc);
    });
  });

  e.next();
}, "sources");
