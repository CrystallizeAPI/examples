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
      identifier: 'paragraph-collection',
      name: 'Example paragraph collection',
      type: 'document',
      components: [
        {
          id: 'a-paragraph-collection',
          name: 'A paragraph collection',
          type: 'paragraphCollection',
        },
      ],
    },
  ],
  items: [
    {
      name: 'Example item with paragraph collection',
      shape: 'paragraph-collection',
      components: {
        'a-paragraph-collection': [
          {
            title: 'This is a paragraph title',
            body: {
              json: [
                {
                  kind: 'block',
                  type: 'paragraph',
                  metadata: {},
                  children: [
                    {
                      kind: 'inline',
                      textContent:
                        'This is the rich text body of the paragraph',
                      metadata: {},
                    },
                  ],
                },
              ],
            },
            images: [
              {
                src: 'https://media.crystallize.com/crystallize_marketing/20/11/24/4/headless-ecommerce-crystallize.png',
              },
            ],
            videos: [
              {
                src: 'https://media.crystallize.com/crystallize_marketing/20/10/14/5/pim_with_a_twist/cmaf/pim_with_a_twist.m3u8',
              },
            ],
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
