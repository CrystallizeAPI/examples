import "dotenv/config";
import {
  Bootstrapper,
  EVENT_NAMES,
  JsonSpec,
} from "@crystallize/import-utilities";

/**
 * Access tokens for the account used
 * https://crystallize.com/learn/developer-guides/access-tokens
 */
const {
  CRYSTALLIZE_ACCESS_TOKEN_ID,
  CRYSTALLIZE_ACCESS_TOKEN_SECRET,
  SOURCE_TENANT_IDENTIFIER,
  TARGET_TENANT_IDENTIFIER,
} = process.env;
if (!CRYSTALLIZE_ACCESS_TOKEN_ID || !CRYSTALLIZE_ACCESS_TOKEN_SECRET) {
  console.error(
    "Missing CRYSTALLIZE_ACCESS_TOKEN_ID and CRYSTALLIZE_ACCESS_TOKEN_SECRET"
  );
  process.exit(1);
}
if (!SOURCE_TENANT_IDENTIFIER) {
  console.error("Missing SOURCE_TENANT_IDENTIFIER");
  process.exit(1);
}
if (!TARGET_TENANT_IDENTIFIER) {
  console.error("Missing TARGET_TENANT_IDENTIFIER");
  process.exit(1);
}

async function createSpec() {
  const bootstrapper = new Bootstrapper();

  bootstrapper.setTenantIdentifier(SOURCE_TENANT_IDENTIFIER as string);
  bootstrapper.setAccessToken(
    CRYSTALLIZE_ACCESS_TOKEN_ID as string,
    CRYSTALLIZE_ACCESS_TOKEN_SECRET as string
  );

  return bootstrapper.createSpec();
}

function importToTenant(spec: JsonSpec): Promise<void> {
  return new Promise((resolve) => {
    const bootstrapper = new Bootstrapper();

    bootstrapper.setTenantIdentifier(TARGET_TENANT_IDENTIFIER as string);
    bootstrapper.setAccessToken(
      CRYSTALLIZE_ACCESS_TOKEN_ID as string,
      CRYSTALLIZE_ACCESS_TOKEN_SECRET as string
    );

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
