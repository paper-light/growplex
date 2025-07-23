/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "createRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner')",
    "deleteRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner')",
    "updateRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
})
