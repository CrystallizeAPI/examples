const shared = require('../shared');

const fallbackProductId = '';
const fallbackSku = '';
const fallbackLanguage = 'en';

async function updateProductVariantStock({
  productId = fallbackProductId,
  sku = fallbackSku,
  language = fallbackLanguage,
  reduceWith = 1,
} = {}) {
  // Fetch the entire product variants definition first
  const response = await shared.graphQLFetcher({
    query: `
      query GET_PRODUCT($productId: ID!, $language: String!) {
        product {
          get(id: $productId, language: $language) {
            variants {
              id
              sku
              stock
            }
          }
        }
      }
    `,
    variables: {
      productId,
      language,
    },
  });

  // Reduce the stock
  const variant = response.product.get.variants.find((v) => v.sku === sku);
  if (!variant) {
    throw new Error(`Cannot find variant with SKU "${sku}"`);
  }

  // Mutate the variant
  await shared.graphQLFetcher({
    query: `
      mutation UPDATE_PRODUCT_VARIANT(
        $productId: ID!
        $variantId: ID!
        $language: String!
        $input: UpdateSingleProductVariantInput!
      ) {
        product {
          updateVariant(
            productId: $productId
            variantId: $variantId
            language: $language
            input: $input
          ) {
            id
          }
        }
      }
    `,
    variables: {
      productId,
      variantId: variant.id,
      language,
      input: {
        stock: variant.stock - reduceWith,
      },
    },
  });

  // Publish the changes to the product
  await shared.graphQLFetcher({
    query: `
      mutation PUBLISH_ITEM($productId: ID!, $language: String!) {
        item {
          publish(id: $productId, language: $language) {
            id
          }
        }
      }
    `,
    variables: {
      productId,
      language,
    },
  });
}

(async function run() {
  await updateProductVariantStock();
  console.log('\nProduct variant stock updated successfully\n');
})();
