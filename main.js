const { scrape } = require("./scripts/scraper");
const { toExcel } = require("./scripts/toExcel");
const { upload } = require("./scripts/upload");

const main = async () => {
  await scrape("./result");
  await toExcel("./result");
  await upload("./result");
};

main();
