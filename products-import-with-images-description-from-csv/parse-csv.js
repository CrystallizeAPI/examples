const fs = require('fs');
const util = require('util');
const csvParse = require('csv-parse');

const imageUpload = require('./image-upload');
const fromHTML = require('@crystallize/content-transformer/fromHTML');
const { promise } = require('ora');
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

    parser.on('error', (error) => {
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
  return parts.map((part) => {
    const [attribute, value] = part.split('=');
    return { attribute, value };
  });
}

function handleImages(imagesString) {
  if (!imagesString) Promise.resolve({});
  const images = imagesString.split(';').map(imageUpload);

  return Promise.all(images);
}

function parsePrices(priceString) {
  const parts = priceString.split(';');
  return parts.map((part) => {
    const [identifier, price] = part.split('=');
    return { identifier, price: parseFloat(price, 10) };
  });
}

function parseComponents(descriptionString) {
  const components = [];
  if (descriptionString) {
    const paragraphBody = fromHTML(descriptionString);
    const paragraph = [
      {
        body: { json: [paragraphBody] },
      },
    ];
    components.push({
      componentId: 'description',
      paragraphCollection: {
        paragraphs: paragraph,
      },
    });
  }
  return components;
}

async function getProductsFromRows(rows) {
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

  for (const row of rest) {
    if (row[keys.type] === 'product') {
      handleProduct(row);
    } else {
      await handleVariant(row);
    }
  }

  function handleProduct(row) {
    products.push({
      name: row[keys.name],
      components: parseComponents(row[keys.description]),
      variants: [],
    });
  }

  async function handleVariant(row) {
    const product = products[products.length - 1];

    product.variants.push({
      name: row[keys.name],
      sku: row[keys.sku],
      priceVariants: parsePrices(row[keys.prices]),
      stock: parseInt(row[keys.stock], 10),
      images: await handleImages(row[keys.images]),
      attributes: parseAttributes(row[keys.attributes]),
      isDefault: product.variants.length === 0,
    });
    return Promise.resolve();
  }

  return Promise.resolve(products);
}

module.exports = async function parseCSV(path) {
  try {
    const csv = await readFileAsync(__dirname + path, 'utf-8');

    const rows = await getRows(csv);

    const products = await getProductsFromRows(rows);

    return { success: true, products };
  } catch (error) {
    return { success: false, error };
  }
};
