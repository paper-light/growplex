/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.orgMembers.org ?= org)",
    "viewRule": "(@request.auth.orgMembers.org ?= org)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner')",
    "viewRule": "(@request.auth.orgMembers.org ?= org) && (org.orgMembers_via_org.role = 'owner')"
  }, collection)

  return app.save(collection)
})
