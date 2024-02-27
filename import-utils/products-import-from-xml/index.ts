import * as dotenv from "dotenv";
dotenv.config();

import {
  Bootstrapper,
  EVENT_NAMES,
  JsonSpec,
} from "@crystallize/import-utilities";
import { getProductsFromXML } from "./parse-xml";

async function go() {
  const products = await getProductsFromXML();

  const tenantSpec: JsonSpec = {
    languages: [
      {
        code: "en",
        name: "English",
        isDefault: true,
      },
    ],
    shapes: [
      {
        identifier: "example-xml-imp-folder",
        name: "Example XML import folder",
        type: "folder",
        components: [],
      },
      {
        identifier: "example-xml-imp-product",
        name: "Example XML import product",
        type: "product",
        components: [],
      },
    ],
    vatTypes: [
      {
        name: "Example VAT",
        percent: 25,
      },
    ],
    items: [
      {
        name: "Example products XML import",
        shape: "example-xml-imp-folder",
        children: products.map((product: any) => ({
          ...product,
          shape: "example-xml-imp-product",
          vatType: "Example VAT",
        })),
      },
    ],
  };

  const bootstrapper = new Bootstrapper();

  /**
   * Access tokens for the account used
   * https://crystallize.com/learn/developer-guides/access-tokens
   */
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID as string;
  const ACCESS_TOKEN_SECRET = process.env
    .CRYSTALLIZE_ACCESS_TOKEN_SECRET as string;

  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  bootstrapper.setTenantIdentifier("<your-tenant-identifier-here>");

  // bootstrapper.on(EVENT_NAMES.STATUS_UPDATE, (status) => {
  //   console.log(JSON.stringify(status, null, 1));
  // });

  bootstrapper.on(EVENT_NAMES.ERROR, (error) => {
    console.log(`⛔️ ERROR`);
    console.log(JSON.stringify(error, null, 1));
  });

  bootstrapper.on(EVENT_NAMES.DONE, (status) => {
    console.log(
      `Bootstrapped "${bootstrapper.tenantIdentifier}" in ${status.duration}`
    );
    process.exit(0);
  });

  bootstrapper.setSpec(tenantSpec);

  try {
    bootstrapper.start();
  } catch (e) {
    console.log(e);
  }
}

go();
