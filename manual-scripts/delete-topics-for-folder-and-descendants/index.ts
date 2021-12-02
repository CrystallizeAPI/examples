import fetch from "node-fetch";

// const tenantIdentifier = '<your-tenant-id>'
const tenantIdentifier = "hkn-subscriptions";

/**
 * Access tokens for the account used
 * https://crystallize.com/learn/developer-guides/access-tokens
 */
const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID as string;
const ACCESS_TOKEN_SECRET = process.env
  .CRYSTALLIZE_ACCESS_TOKEN_SECRET as string;

const fetchFromPIM = ({
  query,
  variables,
}: {
  query: string;
  variables?: any;
}) =>
  fetch(`https://pim.crystallize.com/graphql`, {
    method: "post",
    headers: {
      "content-type": "application/json",
      "X-Crystallize-Access-Token-Id": ACCESS_TOKEN_ID,
      "X-Crystallize-Access-Token-Secret": ACCESS_TOKEN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });

async function go() {
  const tenantId = await getTenantIdFromIdentifier(tenantIdentifier);

  console.log(tenantId);
  process.exit(0);
}

go();

async function getTenantIdFromIdentifier(
  tenantIdentifier: string
): Promise<string> {
  const response = await fetchFromPIM({
    query: `{
      tenant {
        getMany (
          identifier: "${tenantIdentifier}"
        ) {
          id
          identifier
        }
      }
    }`,
  });

  const json: any = await response.json();

  const match = json?.data?.tenant?.getMany?.find(
    (t: any) => t.identifier === tenantIdentifier
  );

  if (!match) {
    throw new Error(
      `You do not have access to a tenant with identifier "${tenantIdentifier}"`
    );
  }

  return match.id;
}
