/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // add field
  collection.fields.addAt(7, new Field({
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // remove field
  collection.fields.removeById("relation1914026624")

  return app.save(collection)
})
