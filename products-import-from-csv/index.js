const parseCSV = require('./parse-csv');
const utils = require('./utils');

async function importProducts({
  language,
  products,
  tenantId,
  shapeId,
  vatTypeId,
  treeParentId,
}) {
  const productImportResult = [];

  // Import one product at a time
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const response = await utils.graphQLFetcher({
      query: `mutation importProduct($language: String!, $product: CreateProductInput!) {
        product {
          create(input: $product, language: $language) {
            id
            tree {
              parentId
              position
            }
          }
        }
      }`,
      variables: {
        language,
        product: {
          ...product,
          tenantId,
          shapeId,
          vatTypeId,
          tree: {
            parentId: treeParentId,
          },
        },
      },
    });

    productImportResult.push(response);
  }

  return productImportResult;
}

(async function run() {
  /**
   * Extract the products from the CSV file. It will map it to a data model
   * that matches the Crystallize product and variant model
   */
  const { success, error, products } = await parseCSV('/products.csv');

  if (!success) {
    throw new Error('something went wrong parsing the csv', error);
  } else {
    console.log(`Found ${products.length} product(s) for import`);

    const { tenantId, language } = await utils.getTenantBaseInfo();

    const {
      shapeId,
      vatTypeId,
      rootItemId,
    } = await utils.getExtraProductProperties(tenantId);

    const importResult = await importProducts({
      language,
      products,
      tenantId,
      shapeId,
      vatTypeId,
      treeParentId: rootItemId,
    });

    console.log('\nProducts imported successfully\n');
    console.log(JSON.stringify(importResult, null, 2));
  }
})();
