/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_786199031")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers:each = id",
    "viewRule": "@request.auth.orgMembers:each = id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_786199031")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
