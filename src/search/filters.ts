// QDRANT FILTERS

export function createMultiProjectFilter(projectIds: string[]) {
  if (projectIds.length === 0) {
    return { must: [] };
  }

  return {
    should: projectIds.map((projectId) => ({
      key: "metadata.projectId",
      match: { value: projectId },
    })),
  };
}

export function createSourcesFilter(sources: string[]) {
  if (sources.length === 0) {
    return { must: [] };
  }

  return {
    must: sources.map((source) => ({
      key: "metadata.sourceId",
      match: { value: source },
    })),
  };
}

export function createChunksFilter(
  chunkIds: { documentId: string; chunkIndex: number }[]
) {
  if (chunkIds.length === 0) {
    return { must: [] };
  }

  return {
    should: chunkIds.map(({ documentId, chunkIndex }) => ({
      must: [
        {
          key: "metadata.documentId",
          match: { value: documentId },
        },
        {
          key: "metadata.chunkIndex",
          match: { value: chunkIndex },
        },
      ],
    })),
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
    return { must: [] };
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
    return { must: [] };
  }

  return {
    should: documentIds.map((id) => ({
      key: "metadata.documentId",
      match: { value: id },
    })),
  };
}
