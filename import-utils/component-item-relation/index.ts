import {
  Bootstrapper,
  EVENT_NAMES,
  JsonSpec,
} from "@crystallize/import-utilities";

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
      identifier: "example-item-relation",
      name: "Example item relation",
      type: "document",
      components: [
        {
          id: "an-item-relation",
          name: "An item relation",
          type: "itemRelations",
        },
      ],
    },
  ],
  items: [
    {
      name: "Example item with item relation",
      shape: "example-item-relation",
      components: {
        "an-item-relation": [
          {
            externalReference: "12345678",
          },
        ],
      },
    },
    {
      name: "Example item with external reference",
      shape: "example-item-relation",
      externalReference: "12345678",
    },
  ],
};

async function go() {
  const bootstrapper = new Bootstrapper();

  /**
   * Access tokens for the account used
   * https://crystallize.com/learn/developer-guides/access-tokens
   */
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
  const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;

  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  // bootstrapper.setTenantIdentifier('<your-tenant-identifier-here>');
  bootstrapper.setTenantIdentifier("<your-tenant-identifier-here>");

  bootstrapper.on(EVENT_NAMES.ERROR, (status) => {
    console.log(JSON.stringify(status, null, 1));
  });

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
