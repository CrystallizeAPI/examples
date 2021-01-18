const slug = require('slugify');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
const xmlJS = require('xml-js');
const download = require('download');
const fileType = require('file-type');

const shared = require('../shared');

const mimeArray = {
  'image/jpeg': '.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
  'image/webp': '.webp',
};

async function downloadFile(fileURL) {
  const urlSafeFilename = getUrlSafeFileName(
    fileURL.split('/')[fileURL.split('/').length - 1].split('.')[0],
  );

  const fileBuffer = await download(fileURL);
  const contentType = await fileType.fromBuffer(fileBuffer);

  const completeFilename = `${urlSafeFilename}${
    mimeArray[contentType.mime] || '.jpeg'
  }`;

  return Promise.resolve({
    filename: completeFilename,
    contentType: contentType.mime,
    file: fileBuffer,
  });
}

function getUrlSafeFileName(fileName) {
  let options = {
    replacement: '-', // replace spaces with replacement
    lower: false, // result in lower case
    charmap: slug.charmap, // replace special characters
    multicharmap: slug.multicharmap, // replace multi-characters
  };

  return slug(fileName, options);
}

(async function run(
  fileUrl = 'https://media.crystallize.com/furniture/20/11/9/3/@1366/loung-chair-green.png',
) {
  console.log(fileUrl);
  const { tenantId } = await shared.getTenantBaseInfo();

  const { file, contentType, filename } = await downloadFile(fileUrl);

  // Create the signature required to do an upload
  const signedUploadResponse = await shared.graphQLFetcher({
    variables: {
      tenantId,
      filename,
      contentType,
    },
    query: `
      mutation generatePresignedRequest($tenantId: ID!, $filename: String!, $contentType: String!) {
        fileUpload {
          generatePresignedRequest(tenantId: $tenantId, filename: $filename, contentType: $contentType) {
            url
            fields {
              name
              value
            }
          }
        }
      }
    `,
  });

  if (!signedUploadResponse || !signedUploadResponse.fileUpload) {
    throw new Error('Could not get presigned request fields');
  }

  // Extract what we need for upload
  const {
    fields,
    url,
  } = signedUploadResponse.fileUpload.generatePresignedRequest;

  const formData = new FormData();
  fields.forEach((field) => formData.append(field.name, field.value));
  formData.append('file', file);

  // Upload the file
  const uploadResponse = await fetch(url, {
    method: 'post',
    body: formData,
  });

  if (uploadResponse.status === 201) {
    const jsonResponse = JSON.parse(
      xmlJS.xml2json(await uploadResponse.text()),
    );

    console.log(JSON.stringify(jsonResponse, null, 2));
    console.log('SUCESS! File uploaded!');

    // Return to caller if needed
    const attrs = jsonResponse.elements[0].elements.map((el) => ({
      name: el.name,
      value: el.elements[0].text,
    }));

    return Promise.resolve({
      mimeType: contentType,
      key: attrs.find((a) => a.name === 'Key').value,
    });
  } else {
    console.log('ERROR: File is not uploaded');
  }
})();
