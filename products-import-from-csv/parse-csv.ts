import fs from "fs/promises";
import csvParse from "csv-parse";

function getRows(csv: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const parser = csvParse({
      delimiter: ",",
    });

    const rows: any[] = [];

    parser.on("readable", () => {
      let record: any;
      // eslint-disable-next-line
      while ((record = parser.read())) {
        rows.push(record);
      }
    });

    parser.on("error", (error) => {
      reject({
        message: "Could not parse CSV",
        error,
      });
    });

    parser.on("end", () => resolve(rows));

    // Pass in the csv input
    parser.write(csv);

    parser.end();
  });
}

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
      externalReference: `example-csv-imp-product-${row[keys.id]}`, // Enable update of exising item with same externalReference
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

export async function getProductsFromCSV(): Promise<any[]> {
  const csv = await fs.readFile(__dirname + "/products.csv", "utf-8");

  const rows = await getRows(csv);

  return getProductsFromRows(rows);
}
