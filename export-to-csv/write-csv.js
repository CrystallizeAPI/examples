const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function parseDescription(description) {
  const paragraphs = description.content.paragraphs;
  let body = '';

  paragraphs.forEach((paragraph) => {
    if (paragraph.body.json[0].textContent) {
      body = body.concat(paragraph.body.json[0].textContent);
    }
  });
  return body;
}

function parsePrices(prices) {
  let priceString = '';

  prices.forEach((price) => {
    priceString = priceString.concat(price.identifier, '=', price.price, ';');
  });
  return priceString;
}

function parseAttributes(attributes) {
  let attributeString = '';

  attributes.forEach((attribute) => {
    attributeString = attributeString.concat(
      attribute.attribute,
      '=',
      attribute.value,
      ';',
    );
  });
  return attributeString;
}

function parseImages(images) {
  let imageString = '';

  images.forEach((image) => {
    imageString = imageString.concat(image.url, ';');
  });
  return imageString;
}

module.exports = async function writeCSV(products, fileName) {
  try {
    let records = [];
    const csvWriter = createCsvWriter({
      path: fileName,
      header: [
        { id: 'id', title: 'id' },
        { id: 'type', title: 'type' },
        { id: 'sku', title: 'sku' },
        { id: 'name', title: 'name' },
        { id: 'prices', title: 'prices' },
        { id: 'attributes', title: 'attributes' },
        { id: 'stock', title: 'stock' },
        { id: 'images', title: 'images' },
        { id: 'description', title: 'description' },
      ],
    });

    products.forEach((product) => {
      records.push({
        id: product.id,
        type: 'product',
        sku: '',
        name: product.name,
        prices: '',
        attributes: '',
        stock: '',
        images: '',
        description: parseDescription(
          product.components.find(
            (component) => component.name === 'Description',
          ),
        ),
      });
      const variants = product.variants.map((variant) => {
        return {
          id: variant.id,
          name: variant.name,
          type: 'variant',
          sku: variant.sku,
          prices: parsePrices(variant.priceVariants),
          attributes: parseAttributes(variant.attributes),
          stock: variant.stock,
          images: parseImages(variant.images),
        };
      });
      records = records.concat(variants);
    });

    await csvWriter.writeRecords(records);

    return Promise.resolve({ success: true });
  } catch (error) {
    return Promise.reject({ success: false, error });
  }
};
