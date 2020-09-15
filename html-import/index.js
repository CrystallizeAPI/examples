const fromHTML = require('@crystallize/content-transformer/fromHTML');

const shared = require('../shared');

const mutationInputTypes = {
  document: 'CreateDocumentInput',
  folder: 'CreateFolderInput',
  product: 'CreateProductInput',
};

async function importItem({ language, treeParentId, type, ...item }) {
  console.log(JSON.stringify(item, null, 2));
  return shared.graphQLFetcher({
    query: `mutation importItem($language: String!, $item: ${mutationInputTypes[type]}!) {
      ${type} {
        create(input: $item, language: $language) {
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
      item: {
        tree: {
          parentId: treeParentId,
        },
        ...item,
      },
    },
  });
}

(async function run() {
  const { tenantId, language } = await shared.getTenantBaseInfo();

  const { shapeId, rootItemId, type, components } = await shared.getShape({
    tenantId,
    language,
    message: 'Please select a shape with a richText component',
    filterShapes(shape) {
      return shape.components.find((c) => c.type === 'richText');
    },
  });

  // Get the richText component
  const richTextComponent = components.find((c) => c.type === 'richText');

  const importResult = await importItem({
    type,
    name: 'HTML import example',
    language,
    tenantId,
    shapeId,
    treeParentId: rootItemId,
    components: [
      {
        componentId: richTextComponent.id,
        richText: {
          json: fromHTML(`
              <p>
                Hello there. Let's see how we can get this
                into a well structured <a href="https://crystallize.com/learn/concepts/pim/component/rich-text">Rich Text Component</a>.
              </p>
          `),
        },
      },
    ],
  });

  console.log('\nItem imported successfully\n');
  console.log(JSON.stringify(importResult, null, 2));
})();
