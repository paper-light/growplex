/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2726680096")

  // update collection data
  unmarshal({
    "name": "llms"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2726680096")

  // update collection data
  unmarshal({
    "name": "agents"
  }, collection)

  return app.save(collection)
})
