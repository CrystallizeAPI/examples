## Duplicate one tenant into another tenant

This script creates a JSON spec for a Crystallize [PIM](https://crystallize.com/product/product-information-management) tenant, and then imports that spec to another tenant. product information from a CSV file into your

You will need an access token, in order to be able to run this script. It can be obtained under settings menu on [Access Tokens](https://pim.crystallize.com/settings/access-tokens)

## The script will

- Create a JSON spec for source tenant
- Import the JSON spec for target tenant

## Usage

1. Install dependencies
2. `yarn start` or `npm run start`
