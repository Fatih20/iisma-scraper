const ExcelJS = require("exceljs");
const {
  REGIONS,
  SHEET_COLUMNS,
  OUTPUT_FILENAME,
  INTAKE_ATTRIBUTE,
} = require("./constants");
const fs = require("fs");

/**
 *
 * @param {ExcelJS.Cell} cell
 */
function widthOfCell(cell) {
  if (!cell.value) {
    return 0;
  }

  switch (cell.type) {
    case ExcelJS.ValueType.Date:
      return cell.value.toLocaleDateString().length;
    case ExcelJS.ValueType.Hyperlink:
      return cell.value.text.length;
    default:
      const value = cell.value.toString();
      if (value.includes("\n")) {
        return Math.max(...value.split("\n").map((string) => string.length));
      }
      return cell.value.toString().length;
  }
}

const contentOfState = [
  `University didn't participate in this year`,
  `This admission route didn't exist in this year`,
  `No one went through this route this year`,
];

const admissionRoutes = ["RA", "RW", "CA", "CW"];

function intakeStatisticsUnfolder(intakeStatistics, year) {
  const applicableAdmissionRoutes =
    year === 2023 ? admissionRoutes : admissionRoutes.slice(0, 2);

  const result = applicableAdmissionRoutes
    .map((admissionRoute) => {
      const stateOfAttribute = !intakeStatistics[year]
        ? 0
        : !applicableAdmissionRoutes.includes(admissionRoute)
        ? 1
        : !intakeStatistics?.[year]?.[admissionRoute]
        ? 2
        : 3;

      return [
        stateOfAttribute >= contentOfState.length
          ? intakeStatistics?.[year]?.[admissionRoute]?.["amount"] ??
            "No amount? Bug somewhere"
          : contentOfState[stateOfAttribute],
        ...INTAKE_ATTRIBUTE.map((attribute) => {
          if (stateOfAttribute < contentOfState.length) {
            return [
              contentOfState[stateOfAttribute],
              contentOfState[stateOfAttribute],
            ];
          }

          const attributeObject =
            intakeStatistics?.[year]?.[admissionRoute]?.[attribute];
          const lowerBound = attributeObject?.["lowerBound"];
          const upperBound = attributeObject?.["upperBound"];

          if (!lowerBound && !upperBound) {
            return [`None with this EPT`, `None with this EPT`];
          }

          return [lowerBound, upperBound];
        }),
      ];
    })
    .flat(5);

  return result;
}

/**
 *
 * @param {string} path
 */
const toExcel = async (path = "./../result") => {
  console.log("[ Processing scraped data into spreadsheet ]");

  const data = JSON.parse(fs.readFileSync(`${path}/${OUTPUT_FILENAME}.json`));

  const workbook = new ExcelJS.Workbook();
  // console.log("Sheet columns : ", SHEET_COLUMNS.length);

  REGIONS.forEach((region) => {
    console.log(`Processing region: ${region}`);
    const regionSheet = workbook.addWorksheet(region, {
      views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
    });

    regionSheet.columns = SHEET_COLUMNS;

    const universityList = data?.[region];

    universityList.forEach((university, index) => {
      console.log(`Processing university: ${university.name}`);

      const rowArray = !university.available
        ? [university.name]
        : [
            university.name ?? "",
            university.location ?? "",
            new Date(university.academicPeriod.start),
            new Date(university.academicPeriod.end),
            university.language.ielts ?? "",
            university.language.toefl ?? "",
            university.language.det ?? "",
            ...intakeStatisticsUnfolder(university.intakeStatistics, 2022),
            ...intakeStatisticsUnfolder(university.intakeStatistics, 2023),
            ...university.courses.map(({ title, description }) => {
              return {
                richText: [
                  {
                    font: {
                      name: "Arial",
                      bold: true,
                      color: { argb: "000000" },
                      family: 2,
                    },
                    text: `${title}\n\n`,
                  },
                  {
                    font: {
                      name: "Arial",
                      color: { argb: "000000" },
                      family: 2,
                    },
                    text: `${description}`,
                  },
                ],
              };
            }),
          ];

      regionSheet.addRow(rowArray);

      //   Add hyperlink to the university name
      regionSheet.getCell(index + 2, 1).value = {
        text: regionSheet.getCell(index + 2, 1).value,
        hyperlink: university.link,
      };
    });

    // Auto-height for the column header rows
    const lineHeight = 12; // height per line is roughly 12
    const headerRow = regionSheet.getRow(1);
    let maxLine = 1;

    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Arial",
        color: { argb: "FFFFFF" },
        family: 2,
        bold: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "d73229" },
      };
      if (cell.type === ExcelJS.ValueType.String) {
        maxLine = Math.max(cell.value.split("\n").length + 1, maxLine);
      }
    });
    headerRow.height = lineHeight * maxLine;

    // Adjust the courses cells
    regionSheet.columns.forEach((col, index) => {
      if (index + 1 <= SHEET_COLUMNS.length) {
        return;
      }

      let maxColumnWidth = 0;
      col.eachCell((cell, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        if (!cell.value) {
          return;
        }

        cell.alignment = {
          wrapText: true,
          vertical: "top",
          horizontal: "left",
        };

        const courseTitleLength = cell.value.richText[0].text.trim().length;
        maxColumnWidth = Math.max(courseTitleLength, maxColumnWidth);
      });

      col.width = maxColumnWidth + 5;
    });

    // Auto-width for each non-course columns and wrap text for intakeStatistics cell content
    regionSheet.columns.forEach((column, index) => {
      if (index + 1 > SHEET_COLUMNS.length) {
        return;
      }

      const isIntakeStatisticsColumn = index > 6;

      let maxColumnLength = 0;
      column.eachCell((cell, rowNumber) => {
        // Do not extend the size of the column of intake statistics except for the header row
        // Wrap the text instead
        if (isIntakeStatisticsColumn && rowNumber > 1) {
          cell.alignment = {
            wrapText: true,
          };
          return;
        }

        const width = widthOfCell(cell);
        maxColumnLength = Math.max(maxColumnLength, 10, width);
      });

      column.width = maxColumnLength + 5;
    });

    // Adjust the alignment of all cells
    regionSheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (!cell.alignment) {
          cell.alignment = {};
        }
        cell.alignment.vertical = "top";
        cell.alignment.horizontal = "left";
      });
    });

    // Adjust the color of intake statistics with special cases
    regionSheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (!contentOfState.includes(cell.value)) {
          return;
        }

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "000000" },
        };

        cell.font = {
          color: { argb: "FFFFFF" },
        };
      });
    });
  });

  console.log("[ Writing result to xlsx file ]");
  await workbook.xlsx.writeFile(`${path}/${OUTPUT_FILENAME}.xlsx`);
  console.log("[ Result written! ]\n");
  console.log("[ Statistics ]");
  console.log(
    `Total university: ${REGIONS.map((region) => data?.[region].length).reduce(
      (prev, curr) => prev + curr
    )}`
  );

  REGIONS.forEach((region) => {
    const universities = data?.[region];
    console.log(`${region}: ${universities.length}`);
  });
};

module.exports = { toExcel };
