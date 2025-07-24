/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  $app.runInTransaction((txApp) => {
    if (!e.record.get("name"))
      e.record.set("name", `Agent ${e.record.id.slice(0, 4)}`);

    if (!e.record.get("system"))
      e.record.set("system", "Add >_< after each message");

    if (!e.record.get("provider")) e.record.set("provider", "openai");
  });

  e.next();
}, "agents");
