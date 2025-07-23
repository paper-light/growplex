/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3332084752")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2250675308",
    "hidden": false,
    "id": "relation1602912115",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "source",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3332084752")

  // remove field
  collection.fields.removeById("relation1602912115")

  return app.save(collection)
})
