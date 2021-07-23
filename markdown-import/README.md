## Markdown import to PIM

This script imports generic markdown information into your Crystallize [PIM](https://crystallize.com/product/product-information-management). The script uses the [GraphQL PIM API](https://crystallize.com/api) in [Crystallize](https://crystallize.com) to create an item with a [Rich Text Component](https://crystallize.com/learn/concepts/pim/component/rich-text) with the converted Markdown content.

You will need an access token, in order to be able to run this script. It can be obtained under settings menu on [Access Tokens](https://pim.crystallize.com/settings/access-tokens)

Tenant ID can also be found under settings menu [Tenant](https://pim.crystallize.com/settings/tenant)

This script creates an item with a [rich text](https://crystallize.com/learn/concepts/pim/component/rich-text) component which markdown will be imported into.

- Creates a new shape, `example-markdown-import`
- Creates a new item based on the shape, "Example item with markdown import"

## Usage

1. Install dependencies
2. `yarn start` or `npm run start`
