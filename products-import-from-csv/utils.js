require('dotenv').config();
require('dotenv').config();

const inquirer = require('inquirer');
const fetch = require('node-fetch');
const ora = require('ora');
const fs = require('fs');

let tenantId = null;
let tenantIdentifier = process.env.CRYSTALLIZE_TENANT_IDENTIFIER;
let language = 'en';
const TOKEN = {
  id: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID,
  secret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET,
};

async function graphQLFetcher(graphQLParams) {
  try {
    if (
      (!TOKEN.id && !TOKEN.secret) ||
      (!TOKEN.id.length && !TOKEN.secret.length)
    ) {
      throw new Error('You must insert your token ID and Secret');
    }

    const response = await fetch('https://pim.crystallize.com/graphql', {
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

async function getTenantInfo({ tenantId }) {
  const data = await graphQLFetcher({
    query: `query TENANT_INFO($tenantId: ID!) {
        tenant {
          get(id: $tenantId) {
            identifier
            rootItemId
            shapes {
              id
              type
              name
            }
            vatTypes {
              id
              percent
              name
            }
          }
        }
      }`,
    variables: {
      tenantId,
    },
  });

  return data.tenant.get;
}

async function getTenantBaseInfo() {
  if (!tenantIdentifier) {
    const { tenantIdentifierGiven } = await inquirer.prompt([
      {
        name: 'tenantIdentifierGiven',
        message: 'Please enter the tenant identifier (e.g. "furniture"):',
      },
    ]);
    tenantIdentifier = tenantIdentifierGiven;
  } else {
    console.log('Using tenantIdentifier from .env');
  }

  if (!TOKEN.id) {
    const { id } = await inquirer.prompt([
      {
        name: 'id',
        message: 'Please enter Access Token ID:',
      },
    ]);
    TOKEN.id = id;
  } else {
    console.log('Using Access Token ID from .env');
  }

  if (!TOKEN.secret) {
    const { secret } = await inquirer.prompt([
      {
        name: 'secret',
        message: 'Please enter Access Token Secret:',
      },
    ]);
    TOKEN.secret = secret;
  } else {
    console.log('Using Access Token Secret from .env');
  }

  const tenantsMatchingResponse = await graphQLFetcher({
    query: `query GET_TENANT_ID($tenantIdentifier: String!) {
        tenant {
          getMany(identifier: $tenantIdentifier) {
            id
            identifier
            availableLanguages {
              code
              name
            }
          }
        }
      }`,
    variables: {
      tenantIdentifier,
    },
  });

  const matchingTenant = tenantsMatchingResponse.tenant.getMany.find(
    (t) => t.identifier === tenantIdentifier,
  );
  if (!matchingTenant) {
    throw new Error(
      `Cannot find a tenant with the identifier "${tenantIdentifier}"`,
    );
  }

  tenantId = matchingTenant.id;

  // Determine the language
  const { availableLanguages } = matchingTenant;
  if (availableLanguages.length === 1) {
    language = availableLanguages[0].code;
  } else {
    const { languageChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'languageChoice',
        message: 'Select the language target in Crystallize',
        choices: matchingTenant.availableLanguages.map((lang) => ({
          name: lang.name,
          value: lang.code,
        })),
      },
    ]);
    language = languageChoice;
  }

  fs.writeFileSync(
    './.env',
    [
      `CRYSTALLIZE_TENANT_IDENTIFIER=${tenantIdentifier}`,
      `CRYSTALLIZE_ACCESS_TOKEN_ID=${TOKEN.id}`,
      `CRYSTALLIZE_ACCESS_TOKEN_SECRET=${TOKEN.secret}`,
    ].join('\n'),
    'utf-8',
  );

  return { tenantId, language };
}

async function getExtraProductProperties(tenantId) {
  const spinner = ora('Getting tenant info').start();
  const { shapes, vatTypes, rootItemId } = await getTenantInfo({
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

function chunkArray(arr, size) {
  const out = [];
  out.length = Math.ceil(arr.length / size);

  let i = 0;
  return out.fill().map(() => {
    const n = [];
    for (let x = 0; x < size; x++) {
      n.push(arr[i++]);
    }
    return n.filter((i) => !!i);
  });
}

module.exports = {
  graphQLFetcher,
  getTenantBaseInfo,
  getExtraProductProperties,
  chunkArray,
};
