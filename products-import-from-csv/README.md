## Product Import From CSV file

This script imports product information from a CSV file into your Crystallize [PIM](https://crystallize.com/product/product-information-management). The script uses the [GraphQL PIM API](https://crystallize.com/api) in [Crystallize](https://crystallize.com) to create products automatically based on the contents in your CSV file. 

You will need an access token, in order to be able to run this script. It can be obtained under settings menu on [Access Tokens](https://pim.crystallize.com/settings/access-tokens)

Tenant ID can also be found under settings menu [Tenant](https://pim.crystallize.com/settings/tenant)

1. download the repo
2. install dependencies `npm install`
3. follow the same CSV structure as `products.csv`
4. copy your products to `products.csv` file or replace the file
5. run `npm start`
6. follow command line instructions

You can also read the blogpost on [csv product import]()
