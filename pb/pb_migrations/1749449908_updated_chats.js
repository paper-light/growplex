/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // add field
  collection.fields.addAt(6, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor1623671928",
    "maxSize": 0,
    "name": "firstMessage",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861817060")

  // remove field
  collection.fields.removeById("editor1623671928")

  return app.save(collection)
})
