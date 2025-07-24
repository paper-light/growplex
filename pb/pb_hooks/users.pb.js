/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  console.log("Creating user with id:", e.record.id);

  $app.runInTransaction((txApp) => {
    const orgCol = txApp.findCollectionByNameOrId("orgs");
    const org = new Record(orgCol);
    org.set("name", `${e.record.get("name")}'s Org`);
    txApp.save(org);
    console.log("Created org with id:", org.id);

    const projectCol = txApp.findCollectionByNameOrId("projects");
    const project = new Record(projectCol);
    project.set("org", org.id);
    txApp.save(project);
    console.log("Created project with id:", project.id);

    const orgMemCol = txApp.findCollectionByNameOrId("orgMembers");
    const orgMem = new Record(orgMemCol);
    orgMem.set("org", org.id);
    orgMem.set("role", "owner");
    txApp.save(orgMem);
    console.log("Created org member with id:", orgMem.id);

    e.record.set("orgMembers+", [orgMem.id]);
  });

  e.next();
}, "users");
