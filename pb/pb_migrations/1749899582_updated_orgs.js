/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_484305853",
    "hidden": false,
    "id": "relation1553183652",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "projects",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_484305853",
    "hidden": false,
    "id": "relation1553183652",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "projects",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
