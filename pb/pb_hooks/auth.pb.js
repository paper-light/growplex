// /// <reference path="../pb_data/types.d.ts" />

// routerUse((e) => {
//   const token = e.request.header.get("Authorization");
//   if (!token) return e.next();

//   const user = $app.findAuthRecordByToken(token, "auth");
//   if (user.isSuperuser()) return e.next();

//   $app.expandRecord(user, ["orgMembers"]);
//   const orgMembers = user.expandedAll("orgMembers");

//   const ownedOrgId = orgMembers.find((o) => o.get("role") === "owner");
//   const orgIds = orgMembers.map((o) => o.get("org"));

//   e.request.header.set("X-Org-Id", ownedOrgId);
//   e.request.header.set("X-Org-Ids", orgIds.join(","));

//   return e.next();
// });
