/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  console.log("Growplex initialized!");
  console.log("ENV:", $os.getenv("ENV"));
  console.log("QDRANT_URL:", $os.getenv("QDRANT_URL"));

  // Check if Qdrant is accessible
  const qdrantUrl = $os.getenv("QDRANT_URL");
  if (qdrantUrl) {
    try {
      const healthCheck = $http.send({
        url: `${qdrantUrl}/healthz`,
        method: "GET",
        timeout: 5000,
      });
      if (healthCheck.statusCode === 200) {
        console.log("✅ Qdrant is accessible and healthy");
      } else {
        console.warn(
          `⚠️ Qdrant health check failed with status: ${healthCheck.statusCode}`
        );
      }
    } catch (error) {
      console.error("❌ Qdrant health check failed:", error.message);
    }
  } else {
    console.warn("⚠️ QDRANT_URL environment variable not set");
  }

  e.next();
});
