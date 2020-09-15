const fromHTML = require('@crystallize/content-transformer/fromHTML');
var marked = require('marked');

const shared = require('../shared');

const markdownExample = `
Let's get this markdown into Crystallize

- First item
- Second item
`;

const mutationInputTypes = {
  document: 'CreateDocumentInput',
  folder: 'CreateFolderInput',
  product: 'CreateProductInput',
};

async function importItem({ language, treeParentId, type, ...item }) {
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
    name: 'Markdown import example',
    language,
    tenantId,
    shapeId,
    treeParentId: rootItemId,
    components: [
      {
        componentId: richTextComponent.id,
        richText: {
          json: fromHTML(marked(markdownExample)),
        },
      },
    ],
  });

  console.log(JSON.stringify(importResult, null, 2));
  console.log('\nMarkdown imported successfully\n');
})();
