const fs = require('fs');
const util = require('util');
const csvParse = require('csv-parse');

const readFileAsync = util.promisify(fs.readFile);

function getRows(csv) {
  return new Promise((resolve, reject) => {
    const parser = csvParse({
      delimiter: ',',
    });

    const rows = [];

    parser.on('readable', () => {
      let record;
      // eslint-disable-next-line
      while ((record = parser.read())) {
        rows.push(record);
      }
    });

    parser.on('error', error => {
      reject({
        message: 'Could not parse CSV',
        error,
      });
    });

    parser.on('end', () => resolve(rows));

    // Pass in the csv input
    parser.write(csv);

    parser.end();
  });
}

function parseAttributes(attributesString) {
  const parts = attributesString.split(';');
  return parts.map(part => {
    const [attribute, value] = part.split('=');
    return { attribute, value };
  });
}

function getProductsFromRows(rows) {
  // Extract the header row
  const [header, ...rest] = rows;

  // Create an reference to keys as key=index
  const keys = header.reduce(
    (acc, val, index) => ({
      ...acc,
      [header[index]]: index,
    }),
    {},
  );

  const products = [];

  rest.forEach(row => {
    if (row[keys.type] === 'product') {
      handleProduct(row);
    } else {
      handleVariant(row);
    }
  });

  function handleProduct(row) {
    products.push({
      name: row[keys.name],
      variants: [],
    });
  }

  function handleVariant(row) {
    const product = products[products.length - 1];

    product.variants.push({
      name: [
        {
          language: 'en',
          translation: row[keys.name],
        },
      ],
      sku: row[keys.sku],
      price: parseFloat(row[keys.price], 10),
      stock: parseInt(row[keys.stock], 10),
      attributes: parseAttributes(row[keys.attributes]),
      isDefault: product.variants.length === 0,
    });
  }

  return products;
}

module.exports = async function parseCSV(path) {
  try {
    const csv = await readFileAsync(__dirname + path, 'utf-8');

    const rows = await getRows(csv);

    const products = getProductsFromRows(rows);

    return { success: true, products };
  } catch (error) {
    return { success: false, error };
  }
};
