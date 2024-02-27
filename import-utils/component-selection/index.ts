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
      identifier: 'example-selection',
      name: 'Example selection',
      type: 'document',
      components: [
        {
          id: 'a-selection',
          name: 'A selection',
          type: 'selection',
          config: {
            min: 1,
            max: 1,
            options: [
              {
                key: 'red',
                value: '#ff0000',
              },
              {
                key: 'black',
                value: '#000000',
                isPreselected: true,
              },
            ],
          },
        },
      ],
    },
  ],
  items: [
    {
      name: 'Example item with selection',
      shape: 'example-selection',
      components: {
        'a-selection': 'red',
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
