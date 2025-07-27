/// <reference path="../pb_data/types.d.ts" />

onRecordDelete((e) => {
  $app.runInTransaction((txApp) => {
    const docs = txApp.findRecordsByFilter(
      "documents",
      `source = "${e.record.id}"`
    );
    console.log(
      "Deleting documents for source:",
      JSON.stringify(docs.map((d) => d.id))
    );
    docs.forEach((doc) => {
      txApp.delete(doc);
    });
  });

  e.next();
}, "sources");
