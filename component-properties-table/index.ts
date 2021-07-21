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
      identifier: 'example-properties-table',
      name: 'Example properties table',
      type: 'document',
      components: [
        {
          id: 'a-properties-table',
          name: 'A properties table',
          type: 'propertiesTable',
          config: {
            sections: [
              {
                title: 'Dimensions',
                keys: ['width', 'height'],
              },
            ],
          },
        },
      ],
    },
  ],
  items: [
    {
      name: 'Example item with properties table',
      shape: 'example-properties-table',
      components: {
        'a-properties-table': [
          {
            title: 'Dimensions',
            properties: {
              width: '5',
              height: '50',
            },
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

  // bootstrapper.setTenantIdentifier('<your-tenant-identifier-here>');
  bootstrapper.setTenantIdentifier('hkn-examples');

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
