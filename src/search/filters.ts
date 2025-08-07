// QDRANT FILTERS

export function mergeFilters(filters: any[]) {
  const mustConditions = filters
    .map((filter) => filter.must || [])
    .flat()
    .filter((condition) => condition && Object.keys(condition).length > 0);

  const shouldConditions = filters
    .map((filter) => filter.should || [])
    .flat()
    .filter((condition) => condition && Object.keys(condition).length > 0);

  const result: any = {};

  if (mustConditions.length > 0) {
    result.must = mustConditions;
  }

  if (shouldConditions.length > 0) {
    result.should = shouldConditions;
  }

  return result;
}

export function createOrgFilter(orgId: string) {
  if (!orgId) {
    return {};
  }
  return {
    must: [{ key: "metadata.orgId", match: { value: orgId } }],
  };
}

export function createMultiProjectFilter(projectIds: string[]) {
  if (projectIds.length === 0) {
    return {};
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
    return {};
  }

  return {
    should: sources.map((source) => ({
      key: "metadata.sourceId",
      match: { value: source },
    })),
  };
}

export function createChunksFilter(
  chunkIds: { documentId: string; chunkIndex: number }[]
) {
  if (chunkIds.length === 0) {
    return {};
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
    return {};
  }

  return {
    should: filterEntries.map(([key, value]) => ({
      key: `metadata.${key}`,
      match: { value },
    })),
  };
}

export function createDocumentIdsFilter(documentIds: string[]) {
  if (documentIds.length === 0) {
    return {};
  }

  return {
    should: documentIds.map((id) => ({
      key: "metadata.documentId",
      match: { value: id },
    })),
  };
}
