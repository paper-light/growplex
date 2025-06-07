/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // update collection data
  unmarshal({
    "name": "agents"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3681818456")

  // update collection data
  unmarshal({
    "name": "m"
  }, collection)

  return app.save(collection)
})
