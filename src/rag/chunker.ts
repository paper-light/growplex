import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { Document } from "@langchain/core/documents";

import { globalEncoderService, type TiktokenModel } from "../llm";

const model: TiktokenModel = "text-embedding-3-small";

function countTokens(text: string): number {
  return globalEncoderService.countTokens(text, model);
}

export async function splitTextIntoDocuments(
  text: string,
  metadata: Record<string, any> = {},
  chunkSize: number = 8000,
  chunkOverlap: number = 200
): Promise<Document[]> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    lengthFunction: countTokens,
  });
  const chunks = await textSplitter.splitText(text);

  return chunks.map((chunk, index) => ({
    pageContent: chunk,
    metadata: {
      ...metadata,
      chunkIndex: index,
      totalChunks: chunks.length,
      tokenCount: countTokens(chunk),
    },
  }));
}

export function getTotalTokenCount(documents: Document[]): number {
  return documents.reduce(
    (total, doc) => total + (doc.metadata.tokenCount || 0),
    0
  );
}

export function validateChunkSizes(
  documents: Document[],
  maxTokens: number = 8000
) {
  return documents.map((doc, index) => ({
    chunkIndex: index,
    tokenCount: doc.metadata.tokenCount || 0,
    isValid: (doc.metadata.tokenCount || 0) <= maxTokens,
  }));
}
