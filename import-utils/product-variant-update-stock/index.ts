import {
  Bootstrapper,
  EVENT_NAMES,
  JsonSpec,
} from '@crystallize/import-utilities';

async function go() {
  /**
   * First: create a new product whith a new shape.
   * The product variant is getting an external
   * reference with we'll be using later for retrieving
   * it.
   */
  const exampleProduct = {
    name: 'Example product with stock update',
    shape: 'example-update-stock',
    vatType: 'Example VAT',
    externalReference: 'example-product-123456768',
    variants: [
      {
        sku: 'example-sku-1234565789',
        externalReference: 'example-product-variant-1234565789',
        name: 'Example product variant',
        price: 20,
        stock: 100,
        isDefault: true,
      },
    ],
  };

  const createProductSpec: JsonSpec = {
    languages: [
      {
        code: 'en',
        name: 'English',
        isDefault: true,
      },
    ],
    shapes: [
      {
        identifier: 'example-update-stock',
        name: 'Example update stock',
        type: 'product',
        components: [],
      },
    ],
    vatTypes: [
      {
        name: 'Example VAT',
        percent: 25,
      },
    ],
    items: [exampleProduct],
  };

  await handleSpec(createProductSpec);

  // Now, lets change the stock and run the spec again
  exampleProduct.variants[0].stock -= 1;
  const updateStockSpec: JsonSpec = {
    items: [exampleProduct],
  };
  await handleSpec(updateStockSpec);
}

async function handleSpec(spec: JsonSpec) {
  const bootstrapper = new Bootstrapper();

  /**
   * Access tokens for the account used
   * https://crystallize.com/learn/developer-guides/access-tokens
   */
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
  const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;

  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  bootstrapper.setTenantIdentifier('<your-tenant-identifier-here>');

  // bootstrapper.on(EVENT_NAMES.STATUS_UPDATE, (status) => {
  //   console.log(JSON.stringify(status, null, 1));
  // });

  bootstrapper.on(EVENT_NAMES.DONE, (status) => {
    console.log(
      `Bootstrapped "${bootstrapper.tenantIdentifier}" in ${status.duration}`,
    );
    process.exit(0);
  });

  bootstrapper.setSpec(spec);

  bootstrapper.start();
}

go();
