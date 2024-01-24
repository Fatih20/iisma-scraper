const { scrape } = require("./scripts/scraper");
const { toExcel } = require("./scripts/toExcel");
const { upload } = require("./scripts/upload");
const { log } = require("./scripts/log");
const { performance } = require("perf_hooks");

const main = async () => {
  const startTime = performance.now();
  await scrape("./result");
  await toExcel("./result");
  await upload("./result");
  await log("./result");

  const endTime = performance.now();
  const duration = Math.round((endTime - startTime) / 1000);
  console.log(`Time taken : ${duration} s`);
};

main();
