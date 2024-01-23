const { scrape } = require("./scraper");
const { toExcel } = require("./toExcel");
const { upload } = require("./upload");

const main = async () => {
  await scrape();
  await toExcel();
  await upload();
};

main();
