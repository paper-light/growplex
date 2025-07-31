import { encoding_for_model } from "tiktoken";
import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { qdrantStorage } from "./storages/qdrant";

type TiktokenModel = "gpt-4" | "gpt-3.5-turbo" | "text-embedding-3-small";

type DocumentMetrics = {
  chunkCount: number;
  tokenCount: number;
};

type AddTextsResult = {
  documentMetrics: DocumentMetrics[];
  totalChunks: number;
  totalTokens: number;
};

class Embedder {
  private encoderCache: Map<TiktokenModel, any>;

  constructor() {
    this.encoderCache = new Map();
    this.encoderCache.set(
      "text-embedding-3-small",
      encoding_for_model("text-embedding-3-small")
    );
  }

  async addTexts(
    orgId: string,
    textObjs: Array<{ content: string; metadata?: Record<string, any> }>
  ): Promise<AddTextsResult> {
    const allDocuments: Document[] = [];
    const documentMetrics: DocumentMetrics[] = [];

    for (const textObj of textObjs) {
      const documents = await this.splitTextIntoDocuments(
        textObj.content,
        textObj.metadata || {}
      );

      // Calculate metrics for this document
      const chunkCount = documents.length;
      const tokenCount = this.getTotalTokenCount(documents);

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
    const totalTokens = this.getTotalTokenCount(allDocuments);

    return {
      documentMetrics,
      totalChunks,
      totalTokens,
    };
  }

  private async addDocuments(orgId: string, documents: Document[]) {
    const vectorStore = await qdrantStorage.createOrgVectorStore(orgId);
    const docs = await vectorStore.addDocuments(documents);
    return docs;
  }

  private async addDocumentsWithRetry(
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
  }

  private async splitTextIntoDocuments(
    text: string,
    metadata: Record<string, any> = {},
    chunkSize: number = 512,
    chunkOverlap: number = 50
  ): Promise<Document[]> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      lengthFunction: (text: string) => this.countTokens(text),

      separators: ["\n\n", "\n", ". ", "! ", "? ", "; ", ": ", ", ", " ", ""],
    });

    const chunks = await textSplitter.splitText(text);

    return chunks
      .map((chunk, index) => ({
        pageContent: chunk.trim(),
        metadata: {
          ...metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          tokenCount: this.countTokens(chunk),
          // Add chunk quality indicators
          chunkLength: chunk.length,
          hasContent: chunk.trim().length > 0,
        },
      }))
      .filter((doc) => doc.metadata.hasContent);
  }

  countTokens(
    text: string,
    model: TiktokenModel = "text-embedding-3-small"
  ): number {
    if (!this.encoderCache.has(model)) {
      this.encoderCache.set(model, encoding_for_model(model));
    }
    const encoder = this.encoderCache.get(model);
    return encoder.encode(text).length;
  }

  // WILL THIS BE USED?
  getTotalTokenCount(documents: Document[]): number {
    return documents.reduce(
      (total, doc) => total + (doc.metadata.tokenCount || 0),
      0
    );
  }

  validateChunkSizes(documents: Document[], maxTokens: number = 512) {
    return documents.map((doc, index) => ({
      chunkIndex: index,
      tokenCount: doc.metadata.tokenCount || 0,
      isValid: (doc.metadata.tokenCount || 0) <= maxTokens,
    }));
  }

  analyzeChunks(documents: Document[]) {
    const tokenCounts = documents.map((d) => d.metadata.tokenCount || 0);
    const avgTokens =
      tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length;
    const minTokens = Math.min(...tokenCounts);
    const maxTokens = Math.max(...tokenCounts);

    return {
      totalChunks: documents.length,
      averageTokens: Math.round(avgTokens),
      minTokens,
      maxTokens,
      tokenDistribution: {
        small: tokenCounts.filter((t) => t < 256).length,
        medium: tokenCounts.filter((t) => t >= 256 && t < 512).length,
        large: tokenCounts.filter((t) => t >= 512).length,
      },
    };
  }
}

export const embedder = new Embedder();
