/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_786199031")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3519626785",
    "hidden": false,
    "id": "relation1914026624",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "org",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_786199031")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3519626785",
    "hidden": false,
    "id": "relation1914026624",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "org",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
