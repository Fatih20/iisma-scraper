const fs = require("fs");
const { GoogleAuth } = require("google-auth-library");
const { google } = require("googleapis");

const upload = async () => {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/drive",
  });
  const service = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: "res",
    parents: [folderId],
    mimeType: "application/vnd.google-apps.spreadsheet",
  };

  const media = {
    mimeType: "application/vnd.ms-excel",
    body: fs.createReadStream("./result/res.xlsx"),
  };

  try {
    const file = await service.files.update({
      fileId: process.env.FILE_ID,
      media,
    });
    // console.log("File Id:", file.data.id);
    return file.data.id;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { upload };
