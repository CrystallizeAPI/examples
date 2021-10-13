## Backup tenant (create JSON spec)

This script creates a JSON spec for a Crystallize [PIM](https://crystallize.com/product/product-information-management) tenant, storing it on disk as a JSON backup. This backup
file can later be used to [bootstrap a different tenant](https://github.com/CrystallizeAPI/examples/tree/main/duplicate-tenant).

You will need an access token, in order to be able to run this script. It can be obtained under settings menu on [Access Tokens](https://pim.crystallize.com/settings/access-tokens)

## Usage

1. Install dependencies
2. `yarn start` or `npm run start`
