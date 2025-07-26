onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    if (!e.record.get("event")) {
      e.record.set("event", "msg");
      txApp.save(e.record);
    }
  });
}, "messages");
