/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // update collection data
  unmarshal({
    "createRule": "",
    "listRule": "@request.auth.orgMembers.org.projects:each.knowledgeSources ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects:each.knowledgeSources ?= id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
