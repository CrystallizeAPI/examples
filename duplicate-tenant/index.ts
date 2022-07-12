require('dotenv').config()
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
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID ?? '';
  const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET ?? '';
  const SOURCE_TENANT_IDENTIFIER = process.env.SOURCE_TENANT_IDENTIFIER ?? '';

  bootstrapper.setTenantIdentifier(SOURCE_TENANT_IDENTIFIER);
  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  return bootstrapper.createSpec();
}

function importToTenant(spec: JsonSpec): Promise<void> {
  return new Promise((resolve) => {
    const bootstrapper = new Bootstrapper();

    /**
     * Access tokens for the account used
     * https://crystallize.com/learn/developer-guides/access-tokens
     */
    const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID ?? '';
    const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET ?? '';
    const TARGET_TENANT_IDENTIFIER = process.env.TARGET_TENANT_IDENTIFIER ?? '';

    bootstrapper.setTenantIdentifier(TARGET_TENANT_IDENTIFIER);
    bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

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
