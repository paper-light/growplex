const meiliService = {
  deleteByDocumentId: (documentId) => {
    const res = $http.send({
      url: `${$os.getenv("MEILI_URL")}/indexes/chunks/documents/delete`,
      method: "POST",
      body: JSON.stringify({
        filter: `documentId = "${documentId}"`,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$os.getenv("MEILI_MASTER_KEY")}`,
      },
    });

    return res;
  },
};

module.exports = {
  meiliService,
};
