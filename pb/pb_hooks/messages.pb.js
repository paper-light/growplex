onRecordCreate((e) => {
  e.next();

  $app.runInTransaction((txApp) => {
    if (!e.record.get("event")) {
      e.record.set("event", "message");
      txApp.save(e.record);
    }
  });
}, "messages");
