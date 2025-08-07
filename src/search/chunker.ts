import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { encoding_for_model, type TiktokenModel } from "tiktoken";
import type { Document } from "@langchain/core/documents";

const DEFAULT_CHUNK_SIZE = 512;
const DEFAULT_CHUNK_OVERLAP = 50;

export class Chunker {
  private encoderCache: Map<TiktokenModel, any>;
  constructor() {
    this.encoderCache = new Map();
  }

  async splitTextIntoDocuments(
    text: string,
    metadata: Record<string, any> = {},
    chunkSize: number = DEFAULT_CHUNK_SIZE,
    chunkOverlap: number = DEFAULT_CHUNK_OVERLAP
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
}

export const chunker = new Chunker();
