import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { Document } from "@langchain/core/documents";

import { encoderService, type TiktokenModel } from "../llm";

const model: TiktokenModel = "text-embedding-3-small";

function countTokens(text: string): number {
  return encoderService.countTokens(text, model);
}

export const chunkerService = {
  async splitTextIntoDocuments(
    text: string,
    metadata: Record<string, any> = {},
    chunkSize: number = 512,
    chunkOverlap: number = 50
  ): Promise<Document[]> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      lengthFunction: countTokens,
      // Better separators for semantic boundaries
      separators: [
        "\n\n", // Paragraphs
        "\n", // Lines
        ". ", // Sentences
        "! ", // Exclamations
        "? ", // Questions
        "; ", // Semi-colons
        ": ", // Colons
        ", ", // Commas
        " ", // Words
        "", // Characters
      ],
    });

    const chunks = await textSplitter.splitText(text);

    return chunks
      .map((chunk, index) => ({
        pageContent: chunk.trim(),
        metadata: {
          ...metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          tokenCount: countTokens(chunk),
          // Add chunk quality indicators
          chunkLength: chunk.length,
          hasContent: chunk.trim().length > 0,
        },
      }))
      .filter((doc) => doc.metadata.hasContent);
  },

  getTotalTokenCount(documents: Document[]): number {
    return documents.reduce(
      (total, doc) => total + (doc.metadata.tokenCount || 0),
      0
    );
  },

  validateChunkSizes(documents: Document[], maxTokens: number = 512) {
    return documents.map((doc, index) => ({
      chunkIndex: index,
      tokenCount: doc.metadata.tokenCount || 0,
      isValid: (doc.metadata.tokenCount || 0) <= maxTokens,
    }));
  },

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
  },
};
