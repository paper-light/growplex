/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // add field
  collection.fields.addAt(7, new Field({
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

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_733358252",
    "hidden": false,
    "id": "relation4259933595",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "integration",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // remove field
  collection.fields.removeById("relation800313582")

  // remove field
  collection.fields.removeById("relation4259933595")

  return app.save(collection)
})
