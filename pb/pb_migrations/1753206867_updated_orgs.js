/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // update collection data
  unmarshal({
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org ?= id",
    "updateRule": "@request.auth.orgMembers.org ?= id && @request.auth.orgMembers.role = \"owner\"",
    "viewRule": "@request.auth.orgMembers.org ?= id"
  }, collection)

  return app.save(collection)
})
