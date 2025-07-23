/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "@request.auth.orgMembers.org.projects:each ?= id",
    "listRule": "@request.auth.orgMembers.org.projects:each ?= id",
    "updateRule": "@request.auth.orgMembers.org.projects:each ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects:each ?= id"
  }, collection)

  return app.save(collection)
})
