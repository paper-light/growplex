/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_733358252",
    "hidden": false,
    "id": "relation2083417258",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "integrations",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // remove field
  collection.fields.removeById("relation2083417258")

  return app.save(collection)
})
