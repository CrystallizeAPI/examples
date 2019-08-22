const inquirer = require("inquirer");
const fetch = require("node-fetch");
const ora = require("ora");

const config = {
  token: {
    id: "752a68e95de9afc57563",
    secret: "fed71b84df233c93d977ef215bac0f5d73f646fc"
  }
};

async function graphQLFetcher(graphQLParams) {
  const response = await fetch(
    "https://pim-dev.crystallize.digital/graph/core",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Crystallize-Access-Token-Id": config.token.id,
        "X-Crystallize-Access-Token-Secret": config.token.secret
      },
      body: JSON.stringify(graphQLParams)
    }
  );

  if (!response.ok) {
    throw new Error(JSON.stringify(await response.json(), null, 3));
  }

  return response.json();
}

function setToken(token) {
  Object.assign(config.token, token);
}

async function getTenantInfo(tenantId) {
  const {
    data: { tenant }
  } = await graphQLFetcher({
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
      tenantId
    }
  });

  return tenant;
}

function tr(translations) {
  return translations[0].translation;
}

async function getTenantId() {
  const { tenantId: tenantIdInput } = await inquirer.prompt([
    {
      name: "tenantId",
      message: "Please enter the tenant id (e.g. 99)"
    }
  ]);

  const tenantId = parseInt(tenantIdInput);
  if (Number.isNaN(tenantId)) {
    throw new Error(
      `Tenant id is not a number. You entered "${tenantIdInput}"`
    );
  }

  return tenantId;
}

async function getExtraProductProperties(tenantId) {
  const spinner = ora("Getting tenant info").start();
  const { shapes, vatTypes, rootItemId } = await getTenantInfo(tenantId);
  spinner.stop();

  const productShapes = shapes.filter(shape => shape.shapeTypeId === "product");

  if (productShapes.length === 0) {
    throw new Error(
      "You have no available product shapes. Please create one at https://pim.crystallize.com/shapes"
    );
  }

  // Determine the shape to use
  let [selectedShape] = productShapes;
  if (productShapes.length > 1) {
    const { shapeChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "shapeChoice",
        message: "Please select a shape for the products",
        choices: productShapes.map(shape => ({
          name: tr(shape.name),
          value: shape.id
        }))
      }
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
        type: "list",
        name: "vatType",
        message: "Please select the VAT type to use",
        choices: vatTypes.map(vatType => ({
          name: tr(vatType.name) + ` (${vatType.percent}%)`,
          value: vatType.id
        }))
      }
    ]);
    selectedVatType = vatTypes.find(p => p.id === vatType);
  } else {
    console.log(`Using VAT type "${tr(selectedVatType.name)}"`);
  }

  return {
    shapeId: selectedShape.id,
    vatTypeId: selectedVatType.id,
    rootItemId
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
  setToken,
  getTenantId,
  getExtraProductProperties,
  chunkArray,
  tr
};
