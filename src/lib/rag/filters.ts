export function createProjectFilter(projectId: string) {
  return {
    must: [{ key: "metadata.projectId", match: { value: projectId } }],
  };
}

export function createMultiProjectFilter(projectIds: string[]) {
  if (projectIds.length === 0) {
    return { must: [] }; // Return empty filter if no projects
  }

  return {
    should: projectIds.map((projectId) => ({
      key: "metadata.projectId",
      match: { value: projectId },
    })),
  };
}

export function createSourceFilter(source: string) {
  return {
    must: [{ key: "metadata.source", match: { value: source } }],
  };
}

export function createChunkFilter(chunkIndex: number) {
  return {
    must: [{ key: "metadata.chunkIndex", match: { value: chunkIndex } }],
  };
}

export function createMetadataFilter(
  key: string,
  value: string | number | boolean
) {
  return {
    must: [{ key: `metadata.${key}`, match: { value } }],
  };
}

export function createMultiMetadataFilter(
  filters: Record<string, string | number | boolean>
) {
  const filterEntries = Object.entries(filters);
  if (filterEntries.length === 0) {
    return { must: [] }; // Return empty filter if no filters
  }

  return {
    must: filterEntries.map(([key, value]) => ({
      key: `metadata.${key}`,
      match: { value },
    })),
  };
}

export function createDocumentIdsFilter(documentIds: string[]) {
  if (documentIds.length === 0) {
    return { must: [] }; // Return empty filter if no document IDs
  }

  return {
    should: documentIds.map((id) => ({
      key: "metadata.documentId",
      match: { value: id },
    })),
  };
}
