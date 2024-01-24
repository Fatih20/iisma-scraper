const fs = require("fs");
const { GoogleAuth } = require("google-auth-library");
const { google } = require("googleapis");
const { OUTPUT_FILENAME } = require("./constants");

const googleKey = require("./../google-key.json");

require("dotenv").config();

const SCOPE = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata",
];

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
  fs.readdir(path, (err, files) => {
    files.forEach((file) => {
      console.log(file);
    });
  });

  console.log("[ Authorizing app ]");

  authorize()
    .then((authClient) => {
      return new Promise((resolve, rejected) => {
        console.log("[ Uploading xlsx to drive ]");
        const drive = google.drive({ version: "v3", auth: authClient });

        const media = {
          mimeType: "application/vnd.ms-excel",
          body: fs.createReadStream(`${path}/${OUTPUT_FILENAME}.xlsx`),
        };

        drive.files.update(
          {
            fileId: process.env.FILE_ID,
            media,
          },
          {},
          function (error, file) {
            if (error) {
              return rejected(error);
            }
            console.log("[ Upload complete! ]");
            resolve(file);
          }
        );
      });
    })
    .catch("error", console.error());
};

module.exports = { upload };
