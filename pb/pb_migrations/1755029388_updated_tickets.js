/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.orgMembers.org ?= message.room.chat.project.org",
    "viewRule": "@request.auth.orgMembers.org ?= message.room.chat.project.org"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
