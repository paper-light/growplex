// import {
//   RunnableLambda,
//   RunnableParallel,
//   RunnableSequence,
// } from "@langchain/core/runnables";
// import type { Document, Document } from "@langchain/core/documents";

// import { bm25Retriever, type BM25Retriever } from "./bm25";
// import { vectorRetriever, type VectorRetriever } from "./vector";

// interface HybridSearchOptions {
//   filter?: any;
//   k?: number;
//   bm25Weight?: number;
//   vectorWeight?: number;
//   enableDeduplication?: boolean;
// }

// export class HybridRetriever {
//   private bm25Retriever: BM25Retriever;
//   private vectorRetriever: VectorRetriever;

//   constructor(vectorRetriever: VectorRetriever, bm25Retriever: BM25Retriever) {
//     this.bm25Retriever = bm25Retriever;
//     this.vectorRetriever = vectorRetriever;
//   }

//   async createRetriever(orgId: string, options: HybridSearchOptions = {}) {
//     const {
//       k = 10,
//       bm25Weight = 0.3,
//       vectorWeight = 0.7,
//       enableDeduplication = true,
//       ...retrieverOptions
//     } = options;

//     const [bm25Retriever, vectorRetriever] = await Promise.all([
//       this.bm25Retriever.createRetriever(orgId, {
//         ...retrieverOptions,
//         k: k * 2,
//       }),
//       this.vectorRetriever.createRetriever(orgId, {
//         ...retrieverOptions,
//         k: k * 2,
//       }),
//     ]);

//     return RunnableSequence.from([
//       RunnableParallel.from({
//         bm25Docs: bm25Retriever,
//         vectorDocs: vectorRetriever,
//       }),
//       // Reranker
//       RunnableLambda.from(({ bm25Docs, vectorDocs }) => {
//         return this.rerankDocuments(
//           bm25Docs as Document[],
//           vectorDocs as Document[],
//           {
//             k,
//             bm25Weight,
//             vectorWeight,
//             enableDeduplication,
//           }
//         );
//       }),
//     ]);
//   }

//   private rerankDocuments(
//     bm25Docs: Document[],
//     vectorDocs: Document[],
//     options: {
//       k: number;
//       bm25Weight: number;
//       vectorWeight: number;
//       enableDeduplication: boolean;
//     }
//   ): Document[] {
//     const { k, bm25Weight, vectorWeight, enableDeduplication } = options;

//     // Create maps for quick lookup
//     const bm25Map = new Map<string, { doc: Document; score: number }>();
//     const vectorMap = new Map<string, { doc: Document; score: number }>();

//     // Process BM25 results
//     bm25Docs.forEach((doc, index) => {
//       const docId = this.getDocumentId(doc);
//       const normalizedScore = this.normalizeBM25Score(doc.score || 0, bm25Docs);
//       bm25Map.set(docId, { doc, score: normalizedScore });
//     });

//     // Process vector results
//     vectorDocs.forEach((doc, index) => {
//       const docId = this.getDocumentId(doc);
//       const normalizedScore = this.normalizeVectorScore(
//         doc.score || 0,
//         vectorDocs
//       );
//       vectorMap.set(docId, { doc, score: normalizedScore });
//     });

//     // Combine scores and deduplicate
//     const combinedScores = new Map<
//       string,
//       { doc: Document; combinedScore: number }
//     >();

//     // Process all documents from both retrievers
//     const allDocIds = new Set([...bm25Map.keys(), ...vectorMap.keys()]);

//     allDocIds.forEach((docId) => {
//       const bm25Result = bm25Map.get(docId);
//       const vectorResult = vectorMap.get(docId);

//       let combinedScore = 0;
//       let doc: Document;

//       if (bm25Result && vectorResult) {
//         // Document appears in both results
//         combinedScore =
//           bm25Weight * bm25Result.score + vectorWeight * vectorResult.score;
//         doc = bm25Result.doc;
//       } else if (bm25Result) {
//         // Document only in BM25 results
//         combinedScore = bm25Weight * bm25Result.score;
//         doc = bm25Result.doc;
//       } else {
//         // Document only in vector results
//         combinedScore = vectorWeight * vectorResult!.score;
//         doc = vectorResult!.doc;
//       }

//       combinedScores.set(docId, { doc, combinedScore });
//     });

//     // Sort by combined score and return top-k
//     const sortedResults = Array.from(combinedScores.values())
//       .sort((a, b) => b.combinedScore - a.combinedScore)
//       .slice(0, k)
//       .map(({ doc }) => doc);

//     return sortedResults;
//   }

//   private getDocumentId(doc: Document): string {
//     // Use pageContent hash or metadata id as document identifier
//     return (
//       doc.metadata?.id ||
//       doc.metadata?.chunkId ||
//       Buffer.from(doc.pageContent).toString("base64").slice(0, 20)
//     );
//   }

//   private normalizeBM25Score(score: number, allDocs: ScoredDocument[]): number {
//     // BM25 scores can be negative or positive, normalize to 0-1
//     const scores = allDocs.map((d) => d.score || 0);
//     const minScore = Math.min(...scores);
//     const maxScore = Math.max(...scores);

//     if (maxScore === minScore) return 0.5; // All scores are the same

//     return (score - minScore) / (maxScore - minScore);
//   }

//   private normalizeVectorScore(
//     score: number,
//     allDocs: ScoredDocument[]
//   ): number {
//     // Vector similarity scores are typically 0-1, but let's normalize anyway
//     const scores = allDocs.map((d) => d.score || 0);
//     const minScore = Math.min(...scores);
//     const maxScore = Math.max(...scores);

//     if (maxScore === minScore) return 0.5;

//     return (score - minScore) / (maxScore - minScore);
//   }

//   // Direct search method for convenience
//   async search(
//     orgId: string,
//     query: string,
//     options: HybridSearchOptions = {}
//   ): Promise<Document[]> {
//     const retriever = await this.createRetriever(orgId, options);
//     return await retriever.invoke(query);
//   }
// }

// export const hybridRetriever = new HybridRetriever(
//   vectorRetriever,
//   bm25Retriever
// );

// /*
// Usage Example:

// // Basic usage
// const results = await hybridRetriever.search("org123", "your query", {
//   k: 10,
//   bm25Weight: 0.3,
//   vectorWeight: 0.7,
// });

// // With filters
// const results = await hybridRetriever.search("org123", "your query", {
//   k: 15,
//   filter: { source: "knowledge-base" },
//   bm25Weight: 0.4,
//   vectorWeight: 0.6,
// });

// // In a LangChain chain
// const retriever = await hybridRetriever.createRetriever("org123", {
//   k: 10,
//   bm25Weight: 0.3,
//   vectorWeight: 0.7,
// });

// const chain = RunnableSequence.from([
//   retriever,
//   // Your LLM or other processing steps
// ]);
// */
