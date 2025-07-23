/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // remove field
  collection.fields.removeById("relation2729472648")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3332084752",
    "hidden": false,
    "id": "relation2729472648",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "documents",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
