/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_733358252")

  // remove field
  collection.fields.removeById("relation1704850090")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_733358252")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3861817060",
    "hidden": false,
    "id": "relation1704850090",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "chats",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
