const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { Page } = require("puppeteer");
const axios = require("axios");
const { stripHtml } = require("string-strip-html");
const fs = require("fs");
const {
  YEARS,
  INTAKE_ATTRIBUTE,
  REGIONS,
  OUTPUT_FILENAME,
  RETRIES_ON_UNIVERSITY,
} = require("./constants");

/**
 * @async
 * @callback PageConsumer
 * @param {Page} page
 * @param {string} path
 * @returns {Promise<void>}
 */

/**
 *
 * @param {PageConsumer} pageConsumer
 */
function pageSupplier(pageConsumer) {
  return async (path = "./../result") => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await pageConsumer(page, path);

    await browser.close();
  };
}

/**
 *
 * @param {string} text
 */
function statAttributeGenerator(text) {
  if (text === "N/A") {
    return {
      lowerBound: null,
      upperBound: null,
    };
  }

  if (text.includes("-")) {
    const splitText = text.split("-");
    return {
      lowerBound: Number(splitText[0]),
      upperBound: Number(splitText[1]),
    };
  }

  if (text.includes("–")) {
    const splitText = text.split("–");
    return {
      lowerBound: Number(splitText[0]),
      upperBound: Number(splitText[1]),
    };
  }

  return {
    lowerBound: Number(text),
    upperBound: null,
  };
}

/**
 *
 * @param {cheerio.Cheerio<cheerio.AnyNode>} intakeTabContent
 */
function scrapeIntake(intakeTabContent) {
  const intakeStatistics = {};

  const stringArray = stripHtml(intakeTabContent.html())
    .result.replace(/\s+/g, " ")
    .replace(/(Regular Applicants\s)+/g, "RA")
    .replace(/(Cofunding Applicants\s)+/g, "CA")
    .replace(/(Regular Awardees\s)+/g, "RW")
    .replace(/(Cofunding Awardees\s)+/g, "CW")
    .replace(/(Awardees\s)+/g, "RW")
    .replace(/(Applicants\s)+/g, "RA")
    .replace(/(Regular Applicants)+/g, "RA")
    .replace(/(Cofunding Applicants)+/g, "CA")
    .replace(/(Regular Awardees)+/g, "RW")
    .replace(/(Cofunding Awardees)+/g, "CW")
    .replace(/(Awardees)+/g, "RW")
    .replace(/(Applicants)+/g, "RA")
    .replace(/(IELTS Score)+/g, INTAKE_ATTRIBUTE[1])
    .replace(/(TOEFL iBT Score)+/g, INTAKE_ATTRIBUTE[2])
    .replace(/(Duolingo English Test Score)+/g, INTAKE_ATTRIBUTE[3])
    .replace(/(DET Score)+/g, INTAKE_ATTRIBUTE[3])
    .replace(/(students)+/g, "")
    .replace(/(RA2022)+/g, "2022")
    .replace(/(RA2023)+/g, "2023")
    .replace(/(RW2022)+/g, "2022")
    .replace(/(RW2023)+/g, "2023")
    .replace(/(:\s–)+/g, ": N/A")
    .replace(/(\s–\s)+/g, "-")
    .replace(/(:)+/g, "")
    .split(" ")
    .filter((string) => string.length > 0)
    .map((string) => string.trim());

  let year = 2022;
  let regularApplicantCode = "RA";

  let afterAttribute = false;
  let afterCode = false;

  // console.log(stringArray);

  stringArray.forEach((string, i, stringArray) => {
    if (afterAttribute) {
      afterAttribute = !afterAttribute;
      return;
    }

    if (afterCode) {
      afterCode = !afterCode;
      return;
    }

    if (YEARS.includes(string)) {
      year = Number(string);
      if (!intakeStatistics[year]) {
        intakeStatistics[year] = {};
      }
      afterAttribute = false;
      afterCode = false;
      return;
    }

    if (["RA", "RW", "CW", "CA"].includes(string)) {
      // Cleanup the attributes in the previous code
      if (
        intakeStatistics[year] &&
        intakeStatistics[year][regularApplicantCode]
      ) {
        INTAKE_ATTRIBUTE.forEach((attribute) => {
          intakeStatistics[year][regularApplicantCode][attribute] =
            intakeStatistics[year][regularApplicantCode][attribute] ===
            undefined
              ? {
                  lowerBound: null,
                  upperBound: null,
                }
              : intakeStatistics[year][regularApplicantCode][attribute];
        });
      }

      if (!intakeStatistics[year]) {
        intakeStatistics[year] = {};
      }

      regularApplicantCode = string;
      if (!intakeStatistics[year][regularApplicantCode]) {
        intakeStatistics[year][regularApplicantCode] = {
          amount: Number(stringArray[i + 1]),
        };
      }
      afterAttribute = false;
      afterCode = true;
      return;
    }

    if (INTAKE_ATTRIBUTE.includes(string)) {
      intakeStatistics[year][regularApplicantCode][string] =
        statAttributeGenerator(stringArray[i + 1]);
      afterAttribute = true;
      afterCode = false;
      return;
    }
  });

  return intakeStatistics;
}

function languageScoreProcessor(score) {
  if (score === "not") {
    return "Not Accepted";
  }

  if (Number(score) === NaN) {
    return undefined;
  }

  return Number(score);
}

/**
 *
 * @param {cheerio.CheerioAPI} $page
 * @param {cheerio.Cheerio<cheerio.Element>} universityInfoTab
 */
function scrapeLanguage($page, universityInfoTab) {
  let requirementTabContent = $page(
    `#${universityInfoTab[1].attribs["id"]}.elementor-tab-content p:first-child`
  ).html();

  const regular = requirementTabContent.includes("English");

  if (!regular) {
    requirementTabContent = $page(
      `#${universityInfoTab[1].attribs["id"]}.elementor-tab-content p:nth-child(2)`
    ).html();
  }

  const separatedStrings = stripHtml(requirementTabContent).result.split(" ");

  const ieltsText = "IELTS:";

  const ieltsScore =
    separatedStrings[
      separatedStrings.findIndex((value) => value === ieltsText) + 1
    ];

  const toeflText = "iBT:";

  const toeflScore =
    separatedStrings[
      separatedStrings.findIndex((value) => value === toeflText) + 1
    ];

  const detText = "Test:";

  const detScore =
    separatedStrings[
      separatedStrings.findIndex((value) => value === detText) + 1
    ];

  return {
    ielts: languageScoreProcessor(ieltsScore),
    toefl: languageScoreProcessor(toeflScore),
    det: languageScoreProcessor(detScore),
    regular,
  };
}

function scrapeAcademicPeriod(rawString) {
  const academicPeriodSplit = rawString
    .replace(/(\sto\s)+/g, " – ")
    .split("–")
    .map((string) => string.trim());

  const splitStart = academicPeriodSplit[0].split(" ");
  const splitEnd = academicPeriodSplit[1].split(" ");

  const academicPeriod = {
    start: `${splitStart[1]} ${splitStart[0]}, ${splitStart[2]}`,
    end: `${splitEnd[1]} ${splitEnd[0]}, ${splitEnd[2]}`,
  };

  return academicPeriod;
}

/**
 *
 * @callback NavigationFunction
 * @returns {Promise<void>}
 */

/**
 *
 * @param {NavigationFunction} navigationFunction
 */
async function navigationRetryWrapper(navigationFunction) {
  let timeoutError = true;
  let timeoutCount = 0;
  while (timeoutError && timeoutCount <= RETRIES_ON_UNIVERSITY) {
    try {
      await navigationFunction();
      timeoutError = false;
    } catch (error) {
      timeoutError = true;
      timeoutCount++;
      console.log(`Timeout! Retry ${timeoutCount}`);
    }
  }

  if (timeoutError && timeoutCount >= RETRIES_ON_UNIVERSITY) {
    throw error;
  }
}

/**
 *
 * @param {Page} page
 * @param {string} url
 *
 */
async function scrapeUniversity(page, url) {
  await navigationRetryWrapper(async () => {
    await page.goto(url, { waitUntil: "networkidle2" });
  });

  const $universityPage = cheerio.load(await page.content());

  const contentTab = $universityPage(".elementor-tab-content");

  if (contentTab.length === 0) {
    return undefined;
  }

  const universityName = (
    $universityPage(
      ".elementor-column.elementor-col-100.elementor-inner-column.elementor-element[data-id='b4f5966'] .elementor-widget-container h4"
    )[0] ??
    $universityPage(
      ".elementor-column.elementor-col-100.elementor-inner-column.elementor-element[data-id='e48be43'] .elementor-widget-container h4"
    )[0]
  ).children[0].data.replace("\n", " ");

  const universityLocation = (
    $universityPage(
      ".elementor-column.elementor-col-100.elementor-inner-column.elementor-element[data-id='b4f5966'] .elementor-widget-container p"
    )[0] ??
    $universityPage(
      ".elementor-column.elementor-col-100.elementor-inner-column.elementor-element[data-id='e48be43'] .elementor-widget-container p"
    )[0]
  ).children[0].data;

  const universityInfoTab = contentTab.slice(0, 4);

  const language = scrapeLanguage($universityPage, universityInfoTab);

  const academicPeriod = scrapeAcademicPeriod(
    stripHtml(
      $universityPage(
        `#${universityInfoTab[2].attribs["id"]}.elementor-tab-content p:first-child`
      ).html() ??
        $universityPage(
          `#${universityInfoTab[2].attribs["id"]}.elementor-tab-content`
        ).html()
    ).result
  );

  const courseElements = $universityPage(".elementor-toggle-item");

  const courses = courseElements
    .map((_, courseElement) => {
      const contentId = courseElement.children[1].attribs["id"].split("-")[3];

      const title = courseElement.children[1].children[3].children[0].data;

      const $courseContentContainer = $universityPage(
        `#elementor-tab-content-${contentId}`
      );

      const description = stripHtml($courseContentContainer.html()).result;

      return {
        title: title?.trim() ?? title,
        description,
      };
    })
    .toArray();

  const intakeStatistics = scrapeIntake(
    $universityPage(
      `#${universityInfoTab[3].attribs["id"]}.elementor-tab-content`
    )
  );

  return {
    name: universityName,
    location: universityLocation,
    academicPeriod,
    language,
    courses,
    intakeStatistics,
  };
}

const scrape = pageSupplier(async (page, path) => {
  console.log("[ Scraping data from the site ]");

  await navigationRetryWrapper(async () => {
    await page.goto(
      "https://iisma.kemdikbud.go.id/info/host-universities-list/",
      { waitUntil: "networkidle2" }
    );
  });

  const $ = cheerio.load(await page.content());

  const universitySliderContainers = $(
    ".elementor-image-carousel.swiper-wrapper"
  );

  const regionAndUniversity = {};

  let totalUniversity = 0;

  universitySliderContainers.each((i, el) => {
    console.log(`Fetching region: ${REGIONS[i]}`);
    const universitySlideContainer = el;

    const sliderElements = universitySlideContainer.children;

    const linkArray = [];

    const links = sliderElements
      .filter((sliderElement) => {
        return !!sliderElement.children;
      })
      .map((sliderElement) => {
        totalUniversity++;
        const linkElement = sliderElement.children[0];
        const linkToUniv = String(linkElement["attribs"]["href"]);

        const splittedLink = linkToUniv.split("/");
        const univName = splittedLink[
          splittedLink[splittedLink.length - 1] === ""
            ? splittedLink.length - 2
            : splittedLink.length - 1
        ]
          .split("-")
          .slice(1)
          .map((string) =>
            string === "of"
              ? string
              : `${string[0].toUpperCase()}${string.substring(1)}`
          )
          .join(" ");

        if (linkArray.includes(linkToUniv)) {
          return undefined;
        }

        linkArray.push(linkToUniv);

        return {
          link: linkToUniv,
          name: univName,
          available: true,
        };
      })
      .filter((link) => !!link);

    regionAndUniversity[REGIONS[i]] = links;

    // console.log(links);
  });

  const universityFailedToFetch = [];
  const universityIrregular = [];

  for (let i = 0; i < REGIONS.length; i++) {
    for (let j = 0; j < regionAndUniversity[REGIONS[i]].length; j++) {
      const universityName = regionAndUniversity[REGIONS[i]][j].name;
      console.log(`Fetching university: ${universityName}`);
      try {
        const result = await scrapeUniversity(
          page,
          regionAndUniversity[REGIONS[i]][j].link
        );

        if (!result) {
          regionAndUniversity[REGIONS[i]][j].available = false;
          continue;
        }

        if (!result.language.regular) {
          universityIrregular.push(result);
        }

        regionAndUniversity[REGIONS[i]][j] = {
          ...regionAndUniversity[REGIONS[i]][j],
          ...result,
        };
      } catch (error) {
        universityFailedToFetch.push(regionAndUniversity[REGIONS[i]][j]);
        console.log(`Failed fetching university: ${universityName}`);
        console.log("Error found : ");
        console.log(error);
        console.log("");
      }
    }
  }

  console.log("\n[ Completed scraping! ]");
  console.log(
    `Universities with irregular requirements (${universityIrregular.length}/${totalUniversity}):`
  );
  universityIrregular.forEach(({ name }) => {
    console.log(`${name}`);
  });
  console.log("");
  if (universityFailedToFetch.length === 0) {
    console.log("All university fetched without error.\n");
  } else {
    console.log(
      `Failed fetching these universities (${universityFailedToFetch.length}/${totalUniversity}): `
    );
    universityFailedToFetch.forEach((university) => {
      console.log(`${university.name} : ${university.link}`);
    });
    console.log("");
  }

  console.log("[ Writing result to json file ]");

  fs.writeFileSync(
    `${path}/${OUTPUT_FILENAME}.json`,
    JSON.stringify(regionAndUniversity),
    (err) => {
      if (err) {
        console.log("Error encountered when writing to file!");
        console.log(err);
      }
    }
  );
  console.log("[ Result written! ]\n");
});

const scrapeTest = pageSupplier(async (page) => {
  const univ = await scrapeUniversity(
    page,
    // "https://iisma.kemdikbud.go.id/info/13-university-of-british-columbia/"
    // "https://iisma.kemdikbud.go.id/info/39-lancaster-university/"
    // "https://iisma.kemdikbud.go.id/info/30-university-of-california-davis/"
    // "https://iisma.kemdikbud.go.id/info/44-hanyang-university-seoul-campus/"
    // "https://iisma.kemdikbud.go.id/info/21-university-of-texas-at-austin/"
    // "https://iisma.kemdikbud.go.id/info/20-ku-leuven/"
    // "https://iisma.kemdikbud.go.id/info/24-m-v-lomonosov-moscow-state-university/"
    // "https://iisma.kemdikbud.go.id/info/29-penn-state-university/"
    // "https://iisma.kemdikbud.go.id/info/16-university-of-warwick/"
    // "https://iisma.kemdikbud.go.id/info/23-korea-university/"
    // "https://iisma.kemdikbud.go.id/info/lolos-67-sciences-po/"
    // "https://iisma.kemdikbud.go.id/info/38-universiti-kebangsaan-malaysia/"
    // "https://iisma.kemdikbud.go.id/info/58-university-of-sussex/",
    // "https://iisma.kemdikbud.go.id/info/53-universidad-autonoma-de-madrid/"
    "https://iisma.kemdikbud.go.id/info/s90-prince-of-songkla-university/"
  );

  console.log(univ.language);
  // console.log(univ.intakeStatistics);

  // console.log(univ.courses);
  // console.log(univ.language);
  // console.log(univ.intakeStatistics[2023]);
  // console.log(univ.academicPeriod);
});

module.exports = { scrape, scrapeTest };
