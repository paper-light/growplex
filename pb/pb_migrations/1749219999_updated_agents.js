/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2726680096")

  // add field
  collection.fields.addAt(3, new Field({
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
      "google",
      "claude",
      "deepseek"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2726680096")

  // remove field
  collection.fields.removeById("select2462348188")

  return app.save(collection)
})
