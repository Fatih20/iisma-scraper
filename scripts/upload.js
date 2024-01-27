const fs = require("fs");
const { google } = require("googleapis");
const { OUTPUT_FILENAME, SCOPE } = require("./constants");

const googleKey = require("./../google-key.json");

require("dotenv").config();

/**
 *
 * @param {JWT} authClient
 * @param {string} path
 * @param {string} fileId
 */
async function updateFile(authClient, path, fileId) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const media = {
    mimeType: "application/vnd.ms-excel",
    body: fs.createReadStream(`${path}/${OUTPUT_FILENAME}.xlsx`),
  };

  try {
    await drive.files.update(
      {
        fileId,
        media,
      },
      {}
    );
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @returns {JWT}
 */
async function authorize() {
  const jwtClient = new google.auth.JWT(
    googleKey.client_email,
    null,
    googleKey.private_key,
    SCOPE
  );
  await jwtClient.authorize();
  return jwtClient;
}

/**
 *
 * @param {string} path
 */
const upload = async (path = "./../result") => {
  console.log("[ Authorizing app ]");
  const authClient = await authorize();
  console.log("[ Uploading xlsx to drive ]");

  await updateFile(authClient, path, process.env.FILE_ID_PUBLIC);
  // await updateFile(authClient, path, process.env.FILE_ID_PRIVATE);
  console.log("[ Upload complete! ]");
};

module.exports = { upload };
