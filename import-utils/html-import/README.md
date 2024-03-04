## HTML import to PIM

This script imports generic HTML information into your Crystallize [PIM](https://crystallize.com/product/product-information-management). The script uses the [GraphQL PIM API](https://crystallize.com/api) in [Crystallize](https://crystallize.com) to create an item with a [Rich Text Component](https://crystallize.com/learn/concepts/pim/component/rich-text) with the converted HTML content.

You will need an access token, in order to be able to run this script. It can be obtained under settings menu on [Access Tokens](https://pim.crystallize.com/settings/access-tokens)

## The script will

- Creates a new shape, `example-html-import`
- Creates a new item based on the shape, "Example item with html import"

## Usage

1. Install dependencies
2. `yarn start` or `npm run start`
