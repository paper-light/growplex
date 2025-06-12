/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_692221206")

  // remove field
  collection.fields.removeById("relation2171001370")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_692221206")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2338068732",
    "hidden": false,
    "id": "relation2171001370",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "operators",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
