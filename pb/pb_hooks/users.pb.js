onRecordCreate((e) => {
  $app.runInTransaction((txApp) => {
    // PROJECT
    const projectCol = txApp.findCollectionByNameOrId("projects");
    const project = new Record(projectCol);
    project.set("name", "Default");
    txApp.save(project);

    const orgCol = txApp.findCollectionByNameOrId("orgs");
    const org = new Record(orgCol);
    org.set("name", `${e.record.get("name")}'s Org`);
    org.set("projects+", [project.id]);
    txApp.save(org);

    // ORG MEMBER
    const orgMemCol = txApp.findCollectionByNameOrId("orgMembers");
    const orgMem = new Record(orgMemCol);

    orgMem.set("org", org.id);
    orgMem.set("role", "owner");
    txApp.save(orgMem);

    e.record.set("orgMembers+", [orgMem.id]);
  });

  e.next();
}, "users");
