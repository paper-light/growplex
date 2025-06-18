/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org.projects.knowledgeSources:each ?= id",
    "viewRule": "@request.auth.orgMembers.org.projects.knowledgeSources:each ?= id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
