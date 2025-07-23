/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3705076665")

  // remove field
  collection.fields.removeById("relation1923043739")

  // remove field
  collection.fields.removeById("relation800313582")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3705076665")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3085411453",
    "hidden": false,
    "id": "relation1923043739",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "room",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_484305853",
    "hidden": false,
    "id": "relation800313582",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "project",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
