const { promise } = require('ora');
const shared = require('../shared');
const writeCSV = require('./write-csv');

async function getProducts({ language, tenantId, rootItemId }) {
  const response = await shared.graphQLFetcher({
    query: `query getProducts($language: String!, $parentId: ID!){
            item {
              get(id: $parentId, language: $language) {
                tree {
                  children {
                    item(language:$language) {
                      ... on Product {
                        id
                        name
                        variants {
                          id
                          name
                          sku
                          stock
                          externalReference
                          attributes{
                            attribute
                            value
                          }
                          priceVariants {
                            identifier
                            price
                          }
                          images {
                            url
                          }
                          id
                          name
                        }
                        components {
                          name
                          type
                          content {
                            ... on ParagraphCollectionContent {
                              paragraphs {
                                body {
                                  json
                                  html
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
    variables: {
      language,
      parentId: rootItemId,
    },
  });

  const products = response.item.get.tree.children.map((node) => node.item);
  return Promise.resolve(products);
}

(async function run() {
  const { tenantId, language } = await shared.getTenantBaseInfo();
  const { rootItemId } = await shared.getTenantInfo({
    tenantId,
  });

  const catalogueProducts = await getProducts({
    language,
    tenantId,
    rootItemId,
  });

  const { success, error } = await writeCSV(
    catalogueProducts,
    'export-to-csv/products.csv',
  );

  if (!success) {
    throw new Error('something went wrong with exporting', error);
  } else {
    console.log('\nProducts export successful!\n');
  }
})();
