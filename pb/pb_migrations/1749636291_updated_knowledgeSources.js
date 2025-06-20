/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json3529336306",
    "maxSize": 0,
    "name": "sources",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // remove field
  collection.fields.removeById("json3529336306")

  return app.save(collection)
})
