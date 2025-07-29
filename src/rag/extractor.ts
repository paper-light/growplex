import type { Document } from "@langchain/core/documents";

import { chunkerService } from "./chunker";
import { createMultiProjectFilter } from "./filters";
import { createOrgVectorStore } from "./storage";

// -------------------------PUBLIC-------------------------

export interface DocumentMetrics {
  chunkCount: number;
  tokenCount: number;
}

export interface AddTextsResult {
  documentMetrics: DocumentMetrics[];
  totalChunks: number;
  totalTokens: number;
}

export const extractorService = {
  async addTexts(
    orgId: string,
    textObjs: Array<{ content: string; metadata?: Record<string, any> }>
  ): Promise<AddTextsResult> {
    const allDocuments: Document[] = [];
    const documentMetrics: DocumentMetrics[] = [];

    for (const textObj of textObjs) {
      const documents = await chunkerService.splitTextIntoDocuments(
        textObj.content,
        textObj.metadata || {}
      );

      // Calculate metrics for this document
      const chunkCount = documents.length;
      const tokenCount = chunkerService.getTotalTokenCount(documents);

      documentMetrics.push({
        chunkCount,
        tokenCount,
      });

      allDocuments.push(...documents);
    }

    // Add documents to vector store with retry logic
    await this.addDocumentsWithRetry(orgId, allDocuments);
    // Calculate totals
    const totalChunks = allDocuments.length;
    const totalTokens = chunkerService.getTotalTokenCount(allDocuments);

    return {
      documentMetrics,
      totalChunks,
      totalTokens,
    };
  },

  async addDocuments(orgId: string, documents: Document[]) {
    const vectorStore = await createOrgVectorStore(orgId, true);
    return await vectorStore.addDocuments(documents);
  },
  async addDocumentsWithRetry(
    orgId: string,
    documents: Document[],
    maxRetries: number = 3
  ) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.addDocuments(orgId, documents);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed for org ${orgId}: ${error}`);

        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }
    throw new Error(
      `Failed to add documents after ${maxRetries} attempts: ${lastError?.message}`
    );
  },

  async addDocumentsBatch(
    orgId: string,
    documents: Document[],
    batchSize: number = 100
  ) {
    const vectorStore = await createOrgVectorStore(orgId, true);

    // Process in batches for better performance
    const results = [];
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const result = await vectorStore.addDocuments(batch);
      results.push(result);
    }

    return results;
  },

  async similaritySearch(
    orgId: string,
    query: string,
    k: number = 4,
    filter?: any
  ) {
    const vectorStore = await createOrgVectorStore(orgId, true);
    return await vectorStore.similaritySearch(query, k, filter);
  },

  async createRetriever(
    orgId: string,
    options: { filter?: any; k?: number } = {}
  ) {
    const vectorStore = await createOrgVectorStore(orgId, true);
    return vectorStore.asRetriever(options);
  },
};
