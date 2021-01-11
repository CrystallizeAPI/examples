const slug = require('slugify');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
const xmlJS = require('xml-js');

const shared = require('../shared');

function getUrlSafeFileName(fileName) {
  let options = {
    replacement: '-', // replace spaces with replacement
    lower: false, // result in lower case
    charmap: slug.charmap, // replace special characters
    multicharmap: slug.multicharmap, // replace multi-characters
  };

  return slug(fileName, options);
}

(async function run() {
  const { tenantId } = await shared.getTenantBaseInfo();

  const filename = 'comic.jpg';
  const contentType = 'image/jpeg';
  const file = fs.readFileSync(`${__dirname}/${filename}`);

  // Create the signature required to do an upload
  const signedUploadResponse = await shared.graphQLFetcher({
    variables: {
      tenantId,
      filename: getUrlSafeFileName('comic.jpg'),
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
    console.log(
      JSON.stringify(
        JSON.parse(xmlJS.xml2json(await uploadResponse.text())),
        null,
        2,
      ),
    );
    console.log('SUCESS! File uploaded!');
  } else {
    console.log('ERROR: File is not uploaded');
  }
})();
