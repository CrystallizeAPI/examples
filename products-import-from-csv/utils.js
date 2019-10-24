const inquirer = require('inquirer');
const fetch = require('node-fetch');
const ora = require('ora');

const TOKEN = {
  id: undefined,
  secret: undefined,
};

async function graphQLFetcher(graphQLParams) {
  try {
    if (
      (!TOKEN.id && !TOKEN.secret) ||
      (!TOKEN.id.length && !TOKEN.secret.length)
    ) {
      throw new Error('You must insert your token ID and Secret');
    }

    const response = await fetch('https://pim.crystallize.com/graph/core', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Crystallize-Access-Token-Id': TOKEN.id,
        'X-Crystallize-Access-Token-Secret': TOKEN.secret,
      },
      body: JSON.stringify(graphQLParams),
    });

    const json = await response.json();

    if (!json.data) {
      throw new Error(JSON.stringify(json, null, 2));
    }

    return json.data;
  } catch (error) {
    console.error('\n', error, '\n');
    process.exit();
  }
}

async function getTenantInfo(tenantId) {
  const data = await graphQLFetcher({
    query: `query getTenantInfo($tenantId: Int!) {
        tenant(id: $tenantId) {
          rootItemId
          shapes {
            id
            shapeTypeId
            name {
              language
              translation
            }
          }
          vatTypes {
            id
            percent
            name {
              language
              translation
            }
          }
        }
      }`,
    variables: {
      tenantId,
    },
  });

  return data.tenant;
}

function tr(translations) {
  return translations[0].translation;
}

async function getTenantId() {
  const { tenantId: tenantIdInput } = await inquirer.prompt([
    {
      name: 'tenantId',
      message: 'Please enter the tenant ID (e.g. 99):',
    },
  ]);

  const { id } = await inquirer.prompt([
    {
      name: 'id',
      message: 'Please enter token ID:',
    },
  ]);

  const { secret } = await inquirer.prompt([
    {
      name: 'secret',
      message: 'Please enter token Secret:',
    },
  ]);

  Object.assign(TOKEN, {
    id,
    secret,
  });

  const tenantId = parseInt(tenantIdInput);
  if (Number.isNaN(tenantId)) {
    throw new Error(
      `Tenant id is not a number. You entered "${tenantIdInput}"`,
    );
  }

  return tenantId;
}

async function getExtraProductProperties(tenantId) {
  const spinner = ora('Getting tenant info').start();
  const { shapes, vatTypes, rootItemId } = await getTenantInfo(tenantId);

  spinner.stop();

  const productShapes = shapes.filter(shape => shape.shapeTypeId === 'product');

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
        choices: productShapes.map(shape => ({
          name: tr(shape.name),
          value: shape.id,
        })),
      },
    ]);
    selectedShape = productShapes.find(p => p.id === shapeChoice);
  } else {
    console.log(`Using shape "${tr(selectedShape.name)}"`);
  }

  // Determine the vatType to use
  let [selectedVatType] = vatTypes;
  if (vatTypes.length > 1) {
    const { vatType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'vatType',
        message: 'Please select the VAT type to use',
        choices: vatTypes.map(vatType => ({
          name: tr(vatType.name) + ` (${vatType.percent}%)`,
          value: vatType.id,
        })),
      },
    ]);
    selectedVatType = vatTypes.find(p => p.id === vatType);
  } else {
    console.log(`Using VAT type "${tr(selectedVatType.name)}"`);
  }

  return {
    shapeId: selectedShape.id,
    vatTypeId: selectedVatType.id,
    rootItemId,
  };
}

function chunkArray(arr, size) {
  const out = [];
  out.length = Math.ceil(arr.length / size);

  let i = 0;
  return out.fill().map(() => {
    const n = [];
    for (let x = 0; x < size; x++) {
      n.push(arr[i++]);
    }
    return n.filter(i => !!i);
  });
}

module.exports = {
  graphQLFetcher,
  // setToken,
  getTenantId,
  getExtraProductProperties,
  chunkArray,
  tr,
};
