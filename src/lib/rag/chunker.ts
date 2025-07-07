import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { Document } from "@langchain/core/documents";

import { globalEncoderService, type TiktokenModel } from "../chat-ai/encoder";

export class TextChunkingService {
  private textSplitter: RecursiveCharacterTextSplitter;
  private model: TiktokenModel = "text-embedding-3-small";

  constructor(chunkSize: number = 8000, chunkOverlap: number = 200) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      lengthFunction: (text) => this.countTokens(text),
    });
  }

  private countTokens(text: string): number {
    return globalEncoderService.countTokens(text, this.model);
  }

  async splitTextIntoDocuments(
    text: string,
    metadata: Record<string, any> = {}
  ): Promise<Document[]> {
    const chunks = await this.textSplitter.splitText(text);

    return chunks.map((chunk, index) => ({
      pageContent: chunk,
      metadata: {
        ...metadata,
        chunkIndex: index,
        totalChunks: chunks.length,
        tokenCount: this.countTokens(chunk),
      },
    }));
  }

  async splitTextsIntoDocuments(
    texts: { content: string; metadata?: Record<string, any> }[]
  ): Promise<Document[]> {
    const allDocuments: Document[] = [];

    for (const textObj of texts) {
      const documents = await this.splitTextIntoDocuments(
        textObj.content,
        textObj.metadata || {}
      );
      allDocuments.push(...documents);
    }

    return allDocuments;
  }

  getTotalTokenCount(documents: Document[]): number {
    return documents.reduce((total, doc) => {
      return total + (doc.metadata.tokenCount || 0);
    }, 0);
  }

  validateChunkSizes(
    documents: Document[],
    maxTokens: number = 8000
  ): { chunkIndex: number; tokenCount: number; isValid: boolean }[] {
    return documents.map((doc, index) => {
      const tokenCount = doc.metadata.tokenCount || 0;
      return {
        chunkIndex: index,
        tokenCount,
        isValid: tokenCount <= maxTokens,
      };
    });
  }

  getModel(): TiktokenModel {
    return this.model;
  }
}
