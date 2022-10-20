## Duplicate one tenant into another tenant

This script creates a JSON spec for a Crystallize [PIM](https://crystallize.com/product/product-information-management) tenant, and then imports that spec to another tenant.

You will need an access token pair to run this script. You can generate one within Crystallize's [Access Tokens](https://pim.crystallize.com/settings/access-tokens) settings.

## The script will

- Create a JSON spec for source tenant
- Import the JSON spec for target tenant

## Usage

1. Install dependencies
2. Copy `.env.sample` to `.env` and fill in your environment variables
3. `yarn start` or `npm run start`
