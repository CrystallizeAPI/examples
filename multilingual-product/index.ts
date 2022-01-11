import {
  Bootstrapper,
  EVENT_NAMES,
  JSONImages,
  JSONParagraphCollection,
  JSONProduct,
  JsonSpec,
} from "@crystallize/import-utilities";

const tenantSpec: JsonSpec = {
  languages: [
    {
      name: "English",
      code: "en",
      isDefault: true,
    },
    {
      name: "French",
      code: "fr",
      isDefault: false,
    },
  ],
  shapes: [
    {
      name: "Example multilingual",
      identifier: "example-multilingual",
      type: "product",
      components: [
        {
          name: "single-line",
          id: "single-line",
          type: "singleLine",
        },
        {
          name: "rich-text",
          id: "rich-text",
          type: "richText",
        },
        {
          name: "images",
          id: "images",
          type: "images",
        },
        {
          name: "paragraph-collection",
          id: "paragraph-collection",
          type: "paragraphCollection",
        },
      ],
    },
  ],
  vatTypes: [
    {
      name: "No Tax",
      percent: 0,
    },
  ],
  items: [
    {
      name: {
        en: "Multilingual example",
        fr: "Exemple multilingue",
      },
      shape: "multilingual",
      externalReference: "multilingual", // Overwrite existing item
      vatType: "No Tax",
      variants: [
        {
          sku: "multilingual-product",
          name: {
            en: "Multilingual example",
            fr: "Exemple multilingue",
          },
          isDefault: true,
        },
      ],
      components: {
        "single-line": {
          en: "I am a single line",
          fr: "Je suis une seule ligne",
        },
        "rich-text": {
          en: {
            html: "<p>Look at this <strong>rich</strong> text</p>",
          },
          fr: {
            html: "<p>Regardez ce texte <strong>riche</strong></p>",
          },
        },
        images: [
          {
            src: "https://media.crystallize.com/crystallize_marketing/21/10/29/3/@500/headless_commerce_for_product_storytellers_crystallize.png",
            altText: {
              en: "Headless ecommerce in space",
              fr: "E-commerce sans tête dans l'espace",
            },
            caption: {
              en: {
                plainText: "Illustration by Gina Kirlew",
              },
              fr: {
                plainText: "Illustration par Gina Kirlew",
              },
            },
          },
        ] as JSONImages,
        "paragraph-collection": [
          {
            title: {
              en: "The first paragraph title",
              fr: "Le titre du premier paragraphe",
            },
            body: {
              en: {
                html: "<p>The first paragraph body</p>",
              },
              fr: {
                html: "<p>Le corps du premier paragraphe</p>",
              },
            },
            images: [
              {
                src: "https://media.crystallize.com/crystallize_marketing/21/10/29/6/@500/semantic_pim_api.jpeg",
                altText: {
                  en: "Delivering pizza on a scooter",
                  fr: "Livrer des pizzas en scooter",
                },
                caption: {
                  en: {
                    plainText: "Illustration by Gina Kirlew",
                  },
                  fr: {
                    plainText: "Illustration par Gina Kirlew",
                  },
                },
              },
            ],
          },
        ] as JSONParagraphCollection[],
      },
      _options: {
        publish: true,
      },
    } as JSONProduct,
  ],
};

async function go() {
  const bootstrapper = new Bootstrapper();

  /**
   * Access tokens for the account used
   * https://crystallize.com/learn/developer-guides/access-tokens
   */
  const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID as string;
  const ACCESS_TOKEN_SECRET = process.env
    .CRYSTALLIZE_ACCESS_TOKEN_SECRET as string;

  bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

  // bootstrapper.setTenantIdentifier("<your-tenant-identifier-here>");
  bootstrapper.setTenantIdentifier("hkn-examples");

  // bootstrapper.on(EVENT_NAMES.STATUS_UPDATE, (status) => {
  //   console.log(JSON.stringify(status, null, 1));
  // });

  bootstrapper.on(EVENT_NAMES.DONE, (status) => {
    console.log(
      `Bootstrapped "${bootstrapper.tenantIdentifier}" in ${status.duration}`
    );
    process.exit(0);
  });

  // Enable multilingual mode
  bootstrapper.config.multilingual = true;

  bootstrapper.setSpec(tenantSpec);

  bootstrapper.start();
}

go();
