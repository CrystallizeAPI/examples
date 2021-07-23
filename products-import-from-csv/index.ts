import {
  Bootstrapper,
  EVENT_NAMES,
  JsonSpec,
} from '@crystallize/import-utilities';
import { getProductsFromCSV } from './parse-csv';

async function go() {
  const products = await getProductsFromCSV();

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
        identifier: 'example-csv-imp-folder',
        name: 'Example CSV import folder',
        type: 'folder',
        components: [],
      },
      {
        identifier: 'example-csv-imp-product',
        name: 'Example CSV import product',
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
    items: [
      {
        name: 'Example products CSV import',
        shape: 'example-csv-imp-folder',
        children: products.map((product: any) => ({
          ...product,
          shape: 'example-csv-imp-product',
          vatType: 'Example VAT',
        })),
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
