import {
  Bootstrapper,
  EVENT_NAMES,
  JsonSpec,
} from "@crystallize/import-utilities";

async function createSpec() {
  const bootstrapper = new Bootstrapper();

  /**
   * Access tokens for the account used
   * https://crystallize.com/learn/developer-guides/access-tokens
   */
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
  const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;

  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  bootstrapper.setTenantIdentifier("<tenant-a-identifier>");

  return bootstrapper.createSpec({
    grids: true,
    items: true,
    languages: true,
    priceVariants: true,
    shapes: true,
    topicMaps: true,
    vatTypes: true,
    stockLocations: true,
    onUpdate: (areaUpdate) => {
      console.log(areaUpdate.message);
    },
  });
}

function importToTenant(spec: JsonSpec): Promise<void> {
  return new Promise((resolve) => {
    const bootstrapper = new Bootstrapper();

    /**
     * Access tokens for the account used
     * https://crystallize.com/learn/developer-guides/access-tokens
     */
    const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
    const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;

    bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

    bootstrapper.setTenantIdentifier("<tenant-b-identifier>");

    bootstrapper.on(EVENT_NAMES.STATUS_UPDATE, (status) => {
      console.log(JSON.stringify(status, null, 1));
    });

    bootstrapper.on(EVENT_NAMES.DONE, (status) => {
      console.log(
        `Bootstrapped "${bootstrapper.tenantIdentifier}" in ${status.duration}`
      );
      resolve();
    });

    bootstrapper.setSpec(spec);

    bootstrapper.start();
  });
}

async function go() {
  const spec = await createSpec();

  await importToTenant(spec);

  process.exit(0);
}

go();
