const fs = require("fs");
const { REGIONS, LOG_FILENAME, OUTPUT_FILENAME } = require("./constants");

const log = async (path = "./../result") => {
  console.log("[ Logging ]");
  const data = JSON.parse(fs.readFileSync(`${path}/${OUTPUT_FILENAME}.json`));

  const totalUniversity = REGIONS.map((region) => data[region].length).reduce(
    (prev, acc) => prev + acc
  );

  const time = new Date();

  const loggedString = `${time.toUTCString()} - Total: ${totalUniversity} (${REGIONS.map(
    (region) => {
      return `${region}: ${data[region].length}`;
    }
  ).join(", ")});\n`;

  try {
    fs.appendFileSync(`${path}/${LOG_FILENAME}.txt`, loggedString);
  } catch (err) {
    console.error(err);
  }

  console.log("[ Logging complete! ]");
};

module.exports = { log };
