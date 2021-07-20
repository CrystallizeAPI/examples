import {
  Bootstrapper,
  EVENT_NAMES,
  JsonSpec,
} from '@crystallize/import-utilities';

const tenantSpec: JsonSpec = {
  languages: [
    {
      code: 'en',
      name: 'English',
      isDefault: true,
    },
  ],
  shapes: [
    {
      identifier: 'example-rich-text',
      name: 'Example rich text',
      type: 'document',
      components: [
        {
          id: 'a-rich-text',
          name: 'Rich text',
          type: 'richText',
        },
      ],
    },
  ],
  items: [
    {
      name: 'Example item with rich text',
      shape: 'example-rich-text',
      components: {
        'a-rich-text': {
          json: [
            {
              kind: 'block',
              type: 'paragraph',
              metadata: {},
              children: [
                {
                  kind: 'inline',
                  metadata: {},
                  textContent: "Here's an example with rich text",
                },
                {
                  kind: 'inline',
                  type: 'line-break',
                },
                {
                  kind: 'inline',
                  metadata: {},
                  textContent: 'Make something awesome!',
                },
              ],
            },
          ],
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

  bootstrapper.setSpec(tenantSpec);

  bootstrapper.start();
}

go();
