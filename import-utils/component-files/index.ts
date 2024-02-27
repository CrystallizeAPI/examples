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
      identifier: "example-files",
      name: "Example files",
      type: "document",
      components: [
        {
          id: "some-files",
          name: "Some files",
          type: "files",
        },
      ],
    },
  ],
  items: [
    {
      name: "Example item with files",
      shape: "example-files",
      components: {
        "some-files": [
          {
            src: "https://crystallize.com/static/favicons/favicon.ico",
            title: "A stylish favicon",
          },
        ],
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
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID as string;
  const ACCESS_TOKEN_SECRET = process.env
    .CRYSTALLIZE_ACCESS_TOKEN_SECRET as string;

  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  bootstrapper.setTenantIdentifier("<your-tenant-identifier-here>");

  // bootstrapper.on(EVENT_NAMES.STATUS_UPDATE, (status) => {
  //   console.log(JSON.stringify(status, null, 1));
  // });

  bootstrapper.on(EVENT_NAMES.ERROR, (error) => {
    console.log("⚠️ Error ⚠️");
    console.log(error);
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
