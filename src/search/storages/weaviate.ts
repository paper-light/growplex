// import weaviate from "weaviate-client";

// import { getEnv } from "@/shared/helpers/get-env";

// const WEAVIATE_URL = getEnv("WEAVIATE_URL");
// const CLASS_NAME = "Document";

// const client = await weaviate.connectToCustom({
//   httpHost: WEAVIATE_URL,
// });

// async function createSchema() {
//   try {
//     // Check if class exists
//     const schemaRes = await client.collections.listAll();
//     const classExists = schemaRes.some((c) => c.name === CLASS_NAME);

//     if (classExists) {
//       console.log("Class already exists:", CLASS_NAME);
//       return;
//     }

//     const newClass = {
//       class: CLASS_NAME,
//       description: "Document class for storing texts",
//       properties: [
//         {
//           name: "content",
//           dataType: ["text"],
//         },
//         {
//           name: "orgId",
//           dataType: ["string"],
//         },
//         {
//           name: "sourceId",
//           dataType: ["string"],
//         },
//         {
//           name: "createdAt",
//           dataType: ["date"],
//         },
//         // Add your metadata props here
//       ],
//       vectorizer: "text2vec-openai", // or "none" if you provide vectors manually
//     };

//     await client.collections.create({
//       name: CLASS_NAME,
//       description: "All business clients chunks",
//       properties: [
//         {
//           name: "content",
//           dataType: ["text"],
//         },
//       ],
//     });
//     console.log("Class created:", CLASS_NAME);
//   } catch (error) {
//     console.error("Error creating schema:", error);
//   }
// }

// createSchema();
