import fs from "fs/promises";
import { XMLParser } from "fast-xml-parser";

function parseAttributes(attributesString: any) {
  const parts = attributesString.split(";");
  const attrObj: Record<string, string> = {};
  parts.forEach((part: any) => {
    const [attribute, value] = part.split("=");
    attrObj[attribute] = value;
  });
  return attrObj;
}

function getProductsFromRows(rows: any[]): any[] {
  // Extract the header row
  const [header, ...rest] = rows;

  // Create an reference to keys as key=index
  const keys = header.reduce(
    (acc: any, val: any, index: number) => ({
      ...acc,
      [header[index]]: index,
    }),
    {}
  );

  const products: any[] = [];

  rest.forEach((row) => {
    if (row[keys.type] === "product") {
      handleProduct(row);
    } else {
      handleVariant(row);
    }
  });

  function handleProduct(row: any) {
    products.push({
      name: row[keys.name],
      variants: [],
    });
  }

  function handleVariant(row: any) {
    const product = products[products.length - 1];

    product.variants.push({
      name: row[keys.name],
      sku: row[keys.sku],
      price: parseFloat(row[keys.price]),
      stock: parseInt(row[keys.stock], 10),
      attributes: parseAttributes(row[keys.attributes]),
      isDefault: product.variants.length === 0,
      images: [
        {
          src: row[keys.image],
        },
      ],
    });
  }

  return products;
}

export async function getProductsFromXML(): Promise<any[]> {
  const xml = await fs.readFile(__dirname + "/products.xml", "utf-8");

  const parser = new XMLParser();
  const obj = parser.parse(xml);

  return getProductsFromRows(obj.root.row.map((r: any) => r.item));
}
