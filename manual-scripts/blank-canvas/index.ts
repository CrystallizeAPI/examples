import fetch from "node-fetch";

const tenantIdentifier = "<your-tenant-id>";

/**
 * Access tokens for the account used
 * https://crystallize.com/learn/developer-guides/access-tokens
 */
const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID as string;
const ACCESS_TOKEN_SECRET = process.env
  .CRYSTALLIZE_ACCESS_TOKEN_SECRET as string;

async function go() {
  const tenantId = await getTenantIdFromIdentifier(tenantIdentifier);

  console.log({ tenantIdentifier, tenantId });
  process.exit(0);
}

go();

/**
 * Get the tenant id from the given tenant identifier
 */
async function getTenantIdFromIdentifier(
  tenantIdentifier: string
): Promise<string> {
  const data = await fetchFromPIM({
    query: `{
      tenant {
        get (
          identifier: "${tenantIdentifier}"
        ) {
          id
        }
      }
    }`,
  });

  const match = data?.tenant?.get;

  if (!match) {
    throw new Error(
      `You do not have access to a tenant with identifier "${tenantIdentifier}"`
    );
  }

  return match.id;
}

async function fetchFromPIM({
  query,
  variables,
}: {
  query: string;
  variables?: any;
}): Promise<any> {
  const response = await fetch(`https://pim.crystallize.com/graphql`, {
    method: "post",
    headers: {
      "content-type": "application/json",
      "X-Crystallize-Access-Token-Id": ACCESS_TOKEN_ID,
      "X-Crystallize-Access-Token-Secret": ACCESS_TOKEN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error("Network error while fetching from PIM");
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 1));
  }

  return json.data;
}
