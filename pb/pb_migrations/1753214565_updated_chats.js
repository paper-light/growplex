/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.orgMembers.org ?= project.org)",
    "viewRule": "(@request.auth.orgMembers.org ?= project.org)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
