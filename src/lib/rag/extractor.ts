import type { Document } from "@langchain/core/documents";

import { createProjectFilter, createMultiProjectFilter } from "./filters";
import { TextChunkingService } from "./chunker";
import { VectorStorageService } from "./storage";

export class ExtractorService {
  private chunkingService: TextChunkingService;
  private storageService: VectorStorageService;

  constructor(
    private useCache: boolean = true,
    chunkSize: number = 8000,
    chunkOverlap: number = 200
  ) {
    this.chunkingService = new TextChunkingService(chunkSize, chunkOverlap);
    this.storageService = new VectorStorageService();
  }

  // Document Management
  async addDocuments(orgId: string, documents: Document[], projectId?: string) {
    const vectorStore = await this.storageService.createOrgVectorStore(
      orgId,
      this.useCache
    );

    const documentsWithProject = this.addProjectMetadata(documents, projectId);
    return await vectorStore.addDocuments(documentsWithProject);
  }

  async addText(
    orgId: string,
    text: string,
    metadata: Record<string, any> = {},
    projectId?: string
  ) {
    const documents = await this.chunkingService.splitTextIntoDocuments(text, {
      ...metadata,
      ...(projectId && { projectId }),
    });
    return await this.addDocuments(orgId, documents);
  }

  async addTexts(
    orgId: string,
    texts: Array<{ content: string; metadata?: Record<string, any> }>,
    projectId?: string
  ) {
    const documents = await this.chunkingService.splitTextsIntoDocuments(texts);
    const documentsWithProject = this.addProjectMetadata(documents, projectId);
    return await this.addDocuments(orgId, documentsWithProject);
  }

  // Search Operations
  async similaritySearch(
    orgId: string,
    query: string,
    k: number = 4,
    filter?: any
  ) {
    const vectorStore = await this.storageService.createOrgVectorStore(
      orgId,
      this.useCache
    );
    return await vectorStore.similaritySearch(query, k, filter);
  }

  async similaritySearchInProject(
    orgId: string,
    projectId: string,
    query: string,
    k: number = 4
  ) {
    const filter = createProjectFilter(projectId);
    return await this.similaritySearch(orgId, query, k, filter);
  }

  async similaritySearchInProjects(
    orgId: string,
    projectIds: string[],
    query: string,
    k: number = 4
  ) {
    const filter = createMultiProjectFilter(projectIds);
    return await this.similaritySearch(orgId, query, k, filter);
  }

  // Retriever Creation
  async createRetriever(
    orgId: string,
    options: {
      filter?: any;
      k?: number;
    } = {}
  ) {
    const vectorStore = await this.storageService.createOrgVectorStore(
      orgId,
      this.useCache
    );
    return vectorStore.asRetriever(options);
  }

  async createProjectRetriever(
    orgId: string,
    projectId: string,
    k: number = 4
  ) {
    const filter = createProjectFilter(projectId);
    return await this.createRetriever(orgId, { filter, k });
  }

  // Cache Management
  clearOrgCache(orgId: string) {
    this.storageService.clearOrgCache(orgId);
  }

  clearAllCache() {
    this.storageService.clearAllCache();
  }

  private addProjectMetadata(
    documents: Document[],
    projectId?: string
  ): Document[] {
    if (!projectId) return documents;

    return documents.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        projectId,
      },
    }));
  }
}

export const extractorService = new ExtractorService();
