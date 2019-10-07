const MUTATION_PRODUCT_IMPORT = `
mutation bulkImportProducts {
  product {
    createMany(
      input: {
        tenantId: 1
        shapeId: 1
        vatTypeId: 1
        tree: { parentId: 1 }
        name: [{ language: "en", translation: "The name" }]
        variants: []
      }
    ) {
      id
    }
  }
}
`;
