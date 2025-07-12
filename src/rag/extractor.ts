import type { Document } from "@langchain/core/documents";

import { splitTextIntoDocuments } from "./chunker";
import { createMultiProjectFilter } from "./filters";
import { createOrgVectorStore } from "./storage";

// -------------------------PUBLIC-------------------------

export const extractorService = {
  async addTexts(
    orgId: string,
    textObjs: Array<{ content: string; metadata?: Record<string, any> }>,
    projectId?: string
  ) {
    const allDocuments: Document[] = [];

    for (const textObj of textObjs) {
      const documents = await splitTextIntoDocuments(
        textObj.content,
        textObj.metadata || {}
      );
      allDocuments.push(...documents);
    }

    return await this.addDocuments(orgId, allDocuments, projectId);
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

  async createProjectsRetriever(
    orgId: string,
    projectIds: string[],
    k: number = 4
  ) {
    const filter = createMultiProjectFilter(projectIds);
    return await this.createRetriever(orgId, { filter, k });
  },
};

// -------------------------PRIVATE-------------------------

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
