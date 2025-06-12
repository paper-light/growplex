/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2338068732")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "bool3892677507",
    "name": "global",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2338068732")

  // remove field
  collection.fields.removeById("bool3892677507")

  return app.save(collection)
})
