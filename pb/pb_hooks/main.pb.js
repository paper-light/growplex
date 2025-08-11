/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  console.log("Growplex initialized!");
  console.log("ENV:", $os.getenv("ENV"));
  console.log("MEILI_URL:", $os.getenv("MEILI_URL"));

  e.next();
});
