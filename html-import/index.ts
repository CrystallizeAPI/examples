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
      identifier: "example-html-import",
      name: "Example html import",
      type: "document",
      components: [
        {
          id: "a-rich-text",
          name: "Rich text",
          type: "richText",
        },
      ],
    },
  ],
  items: [
    {
      name: "Example item with html import",
      shape: "example-html-import",
      components: {
        "a-rich-text": {
          html: `
            <p>
              Hello there. Let's get this
              into a well structured <a href="https://crystallize.com/learn/concepts/pim/component/rich-text">Rich Text Component</a>.
            </p>`,
        },
      },
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
