// import {
//   BM25Retriever as BM25RetrieverLangchain,
//   type BM25RetrieverOptions,
// } from "@langchain/community/retrievers/bm25";
// import type { Document } from "@langchain/core/documents";

// import { pb } from "@/shared/lib/pb";
// import { vectorRetriever } from "./vector";
// import { createChunksFilterIds } from "../filters";
// import { logger } from "@/shared/lib/logger";

// const log = logger.child({ module: "search:retrievers:bm25" });

// interface BM25SearchOptions {
//   k?: number;
//   filter?: any;
// }

// export class BM25Retriever {
//   private cache: Map<string, BM25RetrieverLangchain>;

//   constructor() {
//     this.cache = new Map();
//   }

//   async createRetriever(
//     orgId: string,
//     options: Partial<BM25RetrieverOptions> & BM25SearchOptions = {}
//   ) {
//     if (this.cache.has(orgId)) return this.cache.get(orgId)!;

//     let opts: BM25RetrieverOptions = {
//       docs: options.docs || [],
//       k: options.k || 100,
//       includeScore: options.includeScore ?? true,
//     };

//     if (!options.docs || options.docs.length === 0) {
//       const docs = await this.fetchDocumentsForBM25(orgId);
//       opts.docs = docs;
//     }

//     const retriever = new BM25RetrieverLangchain(opts);
//     this.cache.set(orgId, retriever);
//     return retriever;
//   }

//   private async fetchDocumentsForBM25(orgId: string): Promise<Document[]> {
//     try {
//       const documents = await pb.collection("documents").getFullList({
//         filter: `source.project.org = "${orgId}"`,
//       });

//       if (documents.length === 0) return [];

//       const chunkIds = documents
//         .flatMap((doc) => {
//           return Array.from(
//             { length: doc.chunkCount },
//             (_, i) => `${doc.id}-${i}`
//           );
//         })
//         .flat();

//       const scoredChunks = await vectorRetriever.similaritySearch(
//         orgId,
//         "content",
//         chunkIds.length,
//         createChunksFilterIds(chunkIds)
//       );
//       return scoredChunks.map((chunk) => {
//         return {
//           ...chunk[0],
//           score: chunk[1],
//         };
//       });
//     } catch (error) {
//       log.error(`Error fetching documents for BM25 indexing: ${error}`);
//       return [];
//     }
//   }

//   async search(orgId: string, query: string, options: BM25SearchOptions = {}) {
//     const retriever = await this.createRetriever(orgId, options);
//     if (!retriever) {
//       throw new Error(`Failed to create BM25 retriever for org ${orgId}`);
//     }
//     return await retriever.invoke(query);
//   }

//   clearCache(orgId: string) {
//     this.cache.delete(orgId);
//   }

//   clearAllCache() {
//     this.cache.clear();
//   }
// }

// export const bm25Retriever = new BM25Retriever();
