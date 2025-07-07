import type { Document } from "@langchain/core/documents";

import { splitTextIntoDocuments } from "./chunker";
import { createProjectFilter, createMultiProjectFilter } from "./filters";
import { createOrgVectorStore, clearOrgCache, clearAllCache } from "./storage";

export const extractorService = {
  async addText(
    orgId: string,
    text: string,
    metadata: Record<string, any> = {},
    projectId?: string
  ) {
    const documents = await splitTextIntoDocuments(text, {
      ...metadata,
      ...(projectId && { projectId }),
    });
    return await this.addDocuments(orgId, documents, projectId);
  },

  async addTexts(
    orgId: string,
    texts: Array<{ content: string; metadata?: Record<string, any> }>,
    projectId?: string
  ) {
    const allDocuments: Document[] = [];

    for (const textObj of texts) {
      const documents = await splitTextIntoDocuments(
        textObj.content,
        textObj.metadata || {}
      );
      allDocuments.push(...documents);
    }

    const documentsWithProject = addProjectMetadata(allDocuments, projectId);
    return await this.addDocuments(orgId, documentsWithProject);
  },

  async addDocuments(orgId: string, documents: Document[], projectId?: string) {
    const vectorStore = await createOrgVectorStore(orgId, true);
    const docsWithProject = addProjectMetadata(documents, projectId);
    return await vectorStore.addDocuments(docsWithProject);
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

  async similaritySearchInProject(
    orgId: string,
    projectId: string,
    query: string,
    k: number = 4
  ) {
    const filter = createProjectFilter(projectId);
    return await this.similaritySearch(orgId, query, k, filter);
  },

  async similaritySearchInProjects(
    orgId: string,
    projectIds: string[],
    query: string,
    k: number = 4
  ) {
    const filter = createMultiProjectFilter(projectIds);
    return await this.similaritySearch(orgId, query, k, filter);
  },

  async createRetriever(
    orgId: string,
    options: { filter?: any; k?: number } = {}
  ) {
    const vectorStore = await createOrgVectorStore(orgId, true);
    return vectorStore.asRetriever(options);
  },

  async createProjectRetriever(
    orgId: string,
    projectId: string,
    k: number = 4
  ) {
    const filter = createProjectFilter(projectId);
    return await this.createRetriever(orgId, { filter, k });
  },

  clearOrgCache,
  clearAllCache,
};

function addProjectMetadata(
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
