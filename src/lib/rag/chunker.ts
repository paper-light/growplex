import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { Document } from "@langchain/core/documents";

export class TextChunkingService {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      lengthFunction: (text) => text.length,
    });
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
      },
    }));
  }

  async splitTextsIntoDocuments(
    texts: Array<{ content: string; metadata?: Record<string, any> }>
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
}
