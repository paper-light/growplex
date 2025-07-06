export function createProjectFilter(projectId: string) {
  return {
    must: [{ key: "metadata.projectId", match: { value: projectId } }],
  };
}

export function createMultiProjectFilter(projectIds: string[]) {
  return {
    must: [
      {
        key: "metadata.projectId",
        match: {
          any: projectIds,
        },
      },
    ],
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
  return {
    must: Object.entries(filters).map(([key, value]) => ({
      key: `metadata.${key}`,
      match: { value },
    })),
  };
}
