/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3705076665",
    "hidden": false,
    "id": "relation680616395",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "lead",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // remove field
  collection.fields.removeById("relation680616395")

  return app.save(collection)
})
