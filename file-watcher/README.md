## File watcher

This script watches a directory and sets up a queue for importing JSON specifications into your Crystallize [PIM](https://crystallize.com/product/product-information-management).

You will need an access token, in order to be able to run this script. It can be obtained under settings menu on [Access Tokens](https://pim.crystallize.com/settings/access-tokens)

## The script will

- Creates a new shape, `example-file-watcher`
- Creates two new items based on the shape, "Example from run-me-first.json" and "Example from run-me-next.json

## Usage

1. Install dependencies
2. `yarn start` or `npm run start`
