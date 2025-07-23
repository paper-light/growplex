/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // remove field
  collection.fields.removeById("relation1553183652")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3519626785")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_484305853",
    "hidden": false,
    "id": "relation1553183652",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "projects",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
