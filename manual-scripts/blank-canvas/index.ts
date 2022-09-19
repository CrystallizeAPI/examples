import { createClient } from "@crystallize/js-api-client";

const client = createClient({
  tenantIdentifier: "<your-tenant-identifier>",
  /**
   * Access tokens for the account used
   * https://crystallize.com/learn/developer-guides/access-tokens
   */
  accessTokenId: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID!,
  accessTokenSecret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET!,
});

async function go() {
  const result = await client.catalogueApi(
    `
        query getRootItems (
          $path: String!
          $language: String!
        ) {
          catalogue(path: $path, language: $language) {
            path
            id
            type
            name
          }
        }
        `,
    {
      path: "/",
      language: "en",
    }
  );

  console.log(JSON.stringify(result, null, 1));

  process.exit(0);
}

go();
