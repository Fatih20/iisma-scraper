const ExcelJS = require("exceljs");
const { REGIONS, SHEET_COLUMNS } = require("./constants");
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

const toExcel = async () => {
  console.log("[ Processing Scraped Data Into Spreadsheet ]");

  const data = JSON.parse(fs.readFileSync("./result/res.json"));

  const workbook = new ExcelJS.Workbook();

  REGIONS.forEach((region) => {
    console.log(`Processing region: ${region}`);
    const regionSheet = workbook.addWorksheet(region, {
      views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
    });

    regionSheet.columns = SHEET_COLUMNS;

    const universityList = data?.[region];

    universityList.forEach((university, index) => {
      console.log(`Processing university: ${university.name}`);
      const rowArray = [
        university.name ?? "",
        university.location ?? "",
        new Date(university.academicPeriod.start),
        new Date(university.academicPeriod.end),
        university.language.ielts ?? "",
        university.language.toefl ?? "",
        university.language.det ?? "",
        university.intakeStatistics?.[2022]?.["RA"]?.["amount"] ?? "",
        university.intakeStatistics?.[2022]?.["RA"]?.["GPA"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2022]?.["RA"]?.["GPA"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2022]?.["RA"]?.["IELTS"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2022]?.["RA"]?.["IELTS"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2022]?.["RA"]?.["TOEFL"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2022]?.["RA"]?.["TOEFL"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2022]?.["RA"]?.["DET"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2022]?.["RA"]?.["DET"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2022]?.["RW"]?.["amount"] ?? "",
        university.intakeStatistics?.[2022]?.["RW"]?.["GPA"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2022]?.["RW"]?.["GPA"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2022]?.["RW"]?.["IELTS"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2022]?.["RW"]?.["IELTS"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2022]?.["RW"]?.["TOEFL"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2022]?.["RW"]?.["TOEFL"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2022]?.["RW"]?.["DET"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2022]?.["RW"]?.["DET"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["RA"]?.["amount"] ?? "",
        university.intakeStatistics?.[2023]?.["RA"]?.["GPA"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["RA"]?.["GPA"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["RA"]?.["IELTS"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["RA"]?.["IELTS"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["RA"]?.["TOEFL"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["RA"]?.["TOEFL"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["RA"]?.["DET"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["RA"]?.["DET"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["CA"]?.["amount"] ?? "",
        university.intakeStatistics?.[2023]?.["CA"]?.["GPA"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["CA"]?.["GPA"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["CA"]?.["IELTS"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["CA"]?.["IELTS"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["CA"]?.["TOEFL"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["CA"]?.["TOEFL"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["CA"]?.["DET"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["CA"]?.["DET"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["RW"]?.["amount"] ?? "",
        university.intakeStatistics?.[2023]?.["RW"]?.["GPA"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["RW"]?.["GPA"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["RW"]?.["IELTS"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["RW"]?.["IELTS"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["RW"]?.["TOEFL"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["RW"]?.["TOEFL"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["RW"]?.["DET"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["RW"]?.["DET"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["CW"]?.["amount"] ?? "",
        university.intakeStatistics?.[2023]?.["CW"]?.["GPA"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["CW"]?.["GPA"]?.["upperBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["CW"]?.["IELTS"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["CW"]?.["IELTS"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["CW"]?.["TOEFL"]?.[
          "lowerBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["CW"]?.["TOEFL"]?.[
          "upperBound"
        ] ?? "",
        university.intakeStatistics?.[2023]?.["CW"]?.["DET"]?.["lowerBound"] ??
          "",
        university.intakeStatistics?.[2023]?.["CW"]?.["DET"]?.["upperBound"] ??
          "",
        ...university.courses.map(({ title }) => title),
      ];

      const columnStartOfCourses = SHEET_COLUMNS.length + 1;

      const courseDescriptionArray = [];
      university.courses.forEach(({ description }, index) => {
        courseDescriptionArray[columnStartOfCourses + index] = description;
      });

      regionSheet.addRow(rowArray);
      regionSheet.addRow(courseDescriptionArray);

      //   Merge non-course cells
      for (let i = 1; i < SHEET_COLUMNS.length + 1; i++) {
        const value = regionSheet.getCell(index * 2 + 2, i).value;
        regionSheet.mergeCells(index * 2 + 2, i, index * 2 + 3, i);
        regionSheet.getCell(index * 2 + 2, i).value = value;
      }

      //   Add hyperlink to the university name
      regionSheet.getCell(index * 2 + 2, 1).value = {
        text: regionSheet.getCell(index * 2 + 2, 1).value,
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

    // Adjust the alignment of all cells
    regionSheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "top",
          horizontal: "left",
        };
      });
    });

    // Adjust the courses cells
    regionSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }

      const isCourseTitle = rowNumber % 2 === 0;

      row.eachCell((cell, colNumber) => {
        if (colNumber <= SHEET_COLUMNS.length) {
          return;
        }

        if (isCourseTitle) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "000000" },
          };

          cell.font = {
            name: "Arial",
            color: { argb: "FFFFFF" },
            family: 2,
          };
          return;
        }
        cell.alignment = {
          wrapText: true,
          vertical: "top",
          horizontal: "left",
        };
      });
    });

    // Auto-width for each columns
    regionSheet.columns.forEach((column) => {
      let maxColumnLength = 0;
      column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber !== 1 && rowNumber % 2 === 1) {
          return;
        }
        const width = widthOfCell(cell);
        maxColumnLength = Math.max(maxColumnLength, 10, width);
      });

      column.width = maxColumnLength + 2;
    });
  });

  await workbook.xlsx.writeFile("./result/res.xlsx");
};

module.exports = { toExcel };

toExcel();
