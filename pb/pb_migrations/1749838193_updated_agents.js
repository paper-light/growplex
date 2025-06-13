/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2462348188",
    "maxSelect": 1,
    "name": "provider",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "openai",
      "anthropic",
      "google"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2462348188",
    "maxSelect": 1,
    "name": "provider",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "openai",
      "anthropic",
      "google",
      "deepseek"
    ]
  }))

  return app.save(collection)
})
