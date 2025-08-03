/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3980638064")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org ?= orgs_via_subscription.id",
    "viewRule": "@request.auth.orgMembers.org ?= orgs_via_subscription.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3980638064")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
