const inquirer = require('inquirer');
const ora = require('ora');

const shared = require('../shared');

async function getExtraProductProperties({ tenantId, language }) {
  const spinner = ora('Getting tenant info').start();

  const { shapes, vatTypes, rootItemId } = await shared.getTenantInfo({
    tenantId,
    language,
  });

  spinner.stop();

  const productShapes = shapes.filter(({ type }) => type === 'product');

  if (productShapes.length === 0) {
    throw new Error(
      'You have no available product shapes. Please create one at https://pim.crystallize.com/shapes',
    );
  }

  // Determine the shape to use
  let [selectedShape] = productShapes;
  if (productShapes.length > 1) {
    const { shapeChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'shapeChoice',
        message: 'Please select a shape for the products',
        choices: productShapes.map((shape) => ({
          name: shape.name,
          value: shape.id,
        })),
      },
    ]);
    selectedShape = productShapes.find((p) => p.id === shapeChoice);
  } else {
    console.log(`Using shape "${selectedShape.name}"`);
  }

  // Determine the vatType to use
  let [selectedVatType] = vatTypes;
  if (vatTypes.length > 1) {
    const { vatType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'vatType',
        message: 'Please select the VAT type to use',
        choices: vatTypes.map((vatType) => ({
          name: vatType.name + ` (${vatType.percent}%)`,
          value: vatType.id,
        })),
      },
    ]);
    selectedVatType = vatTypes.find((p) => p.id === vatType);
  } else {
    console.log(`Using VAT type "${selectedVatType.name}"`);
  }

  return {
    shapeId: selectedShape.id,
    vatTypeId: selectedVatType.id,
    rootItemId,
  };
}

module.exports = {
  getExtraProductProperties,
};
