/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // update collection data
  unmarshal({
    "name": "knowledgeSources"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2250675308")

  // update collection data
  unmarshal({
    "name": "knowledges"
  }, collection)

  return app.save(collection)
})
