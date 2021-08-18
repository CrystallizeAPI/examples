import {
  Bootstrapper,
  EVENT_NAMES,
  JsonSpec,
} from "@crystallize/import-utilities";

async function go() {
  const tenantSpec: JsonSpec = {
    languages: [
      {
        code: "en",
        name: "English",
        isDefault: true,
      },
    ],
    shapes: [
      {
        identifier: "example-product-folder",
        name: "Example product import folder",
        type: "folder",
        components: [],
      },
      {
        identifier: "example-product",
        name: "Example CSV import product",
        type: "product",
        components: [],
      },
    ],
    vatTypes: [
      {
        name: "Example VAT",
        percent: 25,
      },
    ],
    items: [
      {
        name: "Example products import",
        shape: "example-product-folder",
        children: [
          {
            name: "Example product 1",
            shape: "example-product",
            vatType: "Example VAT",
            variants: [
              {
                name: "Example variant",
                sku: "example-product-import-sku-1",
                price: 99.9,
                stock: 1000,
                attributes: {
                  size: "large",
                },
                isDefault: true,
                images: [
                  {
                    src: "https://media.crystallize.com/furniture/21/8/9/37/plant28.jpg",
                  },
                ],
              },
            ],
          },
          {
            name: "Example product 2",
            shape: "example-product",
            vatType: "Example VAT",
            variants: [
              {
                name: "Example variant",
                sku: "example-product-import-sku-2",
                price: 49.9,
                stock: 88,
                attributes: {
                  size: "small",
                },
                isDefault: true,
                images: [
                  {
                    src: "https://media.crystallize.com/furniture/21/8/9/31/plant16.jpg",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const bootstrapper = new Bootstrapper();

  /**
   * Access tokens for the account used
   * https://crystallize.com/learn/developer-guides/access-tokens
   */
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
  const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;

  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  bootstrapper.setTenantIdentifier("<your-tenant-identifier-here>");

  // bootstrapper.on(EVENT_NAMES.STATUS_UPDATE, (status) => {
  //   console.log(JSON.stringify(status, null, 1));
  // });

  bootstrapper.on(EVENT_NAMES.DONE, (status) => {
    console.log(
      `Bootstrapped "${bootstrapper.tenantIdentifier}" in ${status.duration}`
    );
    process.exit(0);
  });

  bootstrapper.setSpec(tenantSpec);

  bootstrapper.start();
}

go();
