## Product Import From CSV file to PIM

This script imports product information from a CSV file into your Crystallize [PIM](https://crystallize.com/product/product-information-management). The script uses the [GraphQL PIM API](https://crystallize.com/api) in [Crystallize](https://crystallize.com) to create products automatically based on the contents in your CSV file.

You will need an access token, in order to be able to run this script. It can be obtained under settings menu on [Access Tokens](https://pim.crystallize.com/settings/access-tokens)

## The script will

- Creates two new shapes, `example-csv-imp-folder` and `example-csv-imp-product`
- Creates a new folder for all the products, "Example products CSV import"
- Creates new products under that folder

## Usage

1. Install dependencies
2. `yarn start` or `npm run start`

You can also read the blog post on [CSV product import to PIM](https://crystallize.com/blog/csv-product-import-into-pim)
