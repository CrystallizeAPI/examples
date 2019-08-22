const parseCSV = require("./parse-csv");
const utils = require("./utils");

async function importProducts({
  products,
  tenantId,
  shapeId,
  vatTypeId,
  rootItemId
}) {
  const chunks = utils.chunkArray(products, 10);

  console.log(
    JSON.stringify(
      products.map(product => ({
        ...product,
        tenantId,
        shapeId,
        vatTypeId,
        tree: {
          parentId: rootItemId
        },
        name: [
          {
            language: "en",
            translation: product.name
          }
        ]
      })),
      null,
      3
    )
  );

  for (let i = 0; i < chunks.length; i++) {
    await utils.graphQLFetcher({
      query: `mutation importProducts ($products: [CreateProductInput!]!) {
        product {
          createMany(input: $products) {
            id
          }
        }
      }`,
      variables: {
        products: products.map(product => ({
          ...product,
          tenantId,
          shapeId,
          vatTypeId,
          name: [
            {
              language: "en",
              translation: product.name
            }
          ]
        }))
      }
    });
  }

  return { shapeId, vatTypeId };
}

(async function run() {
  /**
   * Extract the products from the CSV file. It will map it to a data model
   * that matches the Crystallize product and variant model
   */
  const { success, error, products } = await parseCSV("/products.csv");

  if (!success) {
    console.error(error);
  } else {
    console.log(`Found ${products.length} product(s) for import`);

    const tenantId = await utils.getTenantId();

    const {
      shapeId,
      vatTypeId,
      rootItemId
    } = await utils.getExtraProductProperties(tenantId);

    const importResult = await importProducts({
      products,
      tenantId,
      shapeId,
      vatTypeId,
      rootItemId
    });

    console.log(importResult);
  }
})();
