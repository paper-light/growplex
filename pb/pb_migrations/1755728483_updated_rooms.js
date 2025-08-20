/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.orgMembers.org ?= chat.project.org\n&&\n  chat.project.org.orgMembers_via_org.role = 'owner'\n&&\ntype != 'chatWidget'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.orgMembers.org ?= chat.project.org\n&&\n  chat.project.org.orgMembers_via_org.role = 'owner'\n&&\nstatus != 'chatWidget'"
  }, collection)

  return app.save(collection)
})
