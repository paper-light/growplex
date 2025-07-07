/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // remove field
  collection.fields.removeById("url112844655")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url112844655",
    "name": "contact",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
})
