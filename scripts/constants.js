const YEARS = ["2022", "2023"];

const OUTPUT_FILENAME = "res";

const LOG_FILENAME = "log";

const REGIONS = [
  "America and Canada",
  "Asia",
  "Australia and New Zealand",
  "Europe",
  "UK and Ireland",
];

const RETRIES_ON_UNIVERSITY = 5;

const SCOPE = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata",
];

const INTAKE_ATTRIBUTE = ["GPA", "IELTS", "TOEFL", "DET"];

const SHEET_COLUMNS = [
  { header: "University Name", key: "name" },
  { header: "Location", key: "location" },
  { header: "Academic Period\n(Start)", key: "start" },
  { header: "Academic Period\n(End)", key: "end" },
  { header: "IELTS\n(Univ Req)", key: "ielts-univ-req" },
  { header: "TOEFL\n(Univ Req)", key: "toefl-univ-req" },
  { header: "DET\n(Univ Req)", key: "det-univ-req" },
  { header: "Regular Applicants\n2022\nAmount", key: "ra-2022-amount" },
  { header: "Regular Applicants\n2022\nGPA Bottom", key: "ra-2022-gpa-bottom" },
  { header: "Regular Applicants\n2022\nGPA Upper", key: "ra-2022-gpa-upper" },
  {
    header: "Regular Applicants\n2022\nIELTS Bottom",
    key: "ra-2022-ielts-bottom",
  },
  {
    header: "Regular Applicants\n2022\nIELTS Upper",
    key: "ra-2022-ielts-upper",
  },
  {
    header: "Regular Applicants\n2022\nTOEFL Bottom",
    key: "ra-2022-toefl-bottom",
  },
  {
    header: "Regular Applicants\n2022\nTOEFL Upper",
    key: "ra-2022-toefl-upper",
  },
  { header: "Regular Applicants\n2022\nDET Bottom", key: "ra-2022-det-bottom" },
  { header: "Regular Applicants\n2022\nDET Upper", key: "ra-2022-det-upper" },

  { header: "Regular Awardee\n2022\nAmount", key: "rw-2022-amount" },
  { header: "Regular Awardee\n2022\nGPA Bottom", key: "rw-2022-gpa-bottom" },
  { header: "Regular Awardee\n2022\nGPA Upper", key: "rw-2022-gpa-upper" },
  {
    header: "Regular Awardee\n2022\nIELTS Bottom",
    key: "rw-2022-ielts-bottom",
  },
  {
    header: "Regular Awardee\n2022\nIELTS Upper",
    key: "rw-2022-ielts-upper",
  },
  {
    header: "Regular Awardee\n2022\nTOEFL Bottom",
    key: "rw-2022-toefl-bottom",
  },
  {
    header: "Regular Awardee\n2022\nTOEFL Upper",
    key: "rw-2022-toefl-upper",
  },
  { header: "Regular Awardee\n2022\nDET Bottom", key: "rw-2022-det-bottom" },
  { header: "Regular Awardee\n2022\nDET Upper", key: "rw-2022-det-upper" },

  { header: "Regular Applicants\n2023\nAmount", key: "ra-2023-amount" },
  { header: "Regular Applicants\n2023\nGPA Bottom", key: "ra-2023-gpa-bottom" },
  { header: "Regular Applicants\n2023\nGPA Upper", key: "ra-2023-gpa-upper" },
  {
    header: "Regular Applicants\n2023\nIELTS Bottom",
    key: "ra-2023-ielts-bottom",
  },
  {
    header: "Regular Applicants\n2023\nIELTS Upper",
    key: "ra-2023-ielts-upper",
  },
  {
    header: "Regular Applicants\n2023\nTOEFL Bottom",
    key: "ra-2023-toefl-bottom",
  },
  {
    header: "Regular Applicants\n2023\nTOEFL Upper",
    key: "ra-2023-toefl-upper",
  },
  { header: "Regular Applicants\n2023\nDET Bottom", key: "ra-2023-det-bottom" },
  { header: "Regular Applicants\n2023\nDET Upper", key: "ra-2023-det-upper" },
  { header: "Regular Awardee\n2023\nAmount", key: "rw-2023-amount" },
  { header: "Regular Awardee\n2023\nGPA Bottom", key: "rw-2023-gpa-bottom" },
  { header: "Regular Awardee\n2023\nGPA Upper", key: "rw-2023-gpa-upper" },
  {
    header: "Regular Awardee\n2023\nIELTS Bottom",
    key: "rw-2023-ielts-bottom",
  },
  {
    header: "Regular Awardee\n2023\nIELTS Upper",
    key: "rw-2023-ielts-upper",
  },
  {
    header: "Regular Awardee\n2023\nTOEFL Bottom",
    key: "rw-2023-toefl-bottom",
  },
  {
    header: "Regular Awardee\n2023\nTOEFL Upper",
    key: "rw-2023-toefl-upper",
  },
  { header: "Regular Awardee\n2023\nDET Bottom", key: "rw-2023-det-bottom" },
  { header: "Regular Awardee\n2023\nDET Upper", key: "rw-2023-det-upper" },
  { header: "Co-Funding Applicants\n2023\nAmount", key: "ca-2023-amount" },
  {
    header: "Co-Funding Applicants\n2023\nGPA Bottom",
    key: "ca-2023-gpa-bottom",
  },
  {
    header: "Co-Funding Applicants\n2023\nGPA Upper",
    key: "ca-2023-gpa-upper",
  },
  {
    header: "Co-Funding Applicants\n2023\nIELTS Bottom",
    key: "ca-2023-ielts-bottom",
  },
  {
    header: "Co-Funding Applicants\n2023\nIELTS Upper",
    key: "ca-2023-ielts-upper",
  },
  {
    header: "Co-Funding Applicants\n2023\nTOEFL Bottom",
    key: "ca-2023-toefl-bottom",
  },
  {
    header: "Co-Funding Applicants\n2023\nTOEFL Upper",
    key: "ca-2023-toefl-upper",
  },
  {
    header: "Co-Funding Applicants\n2023\nDET Bottom",
    key: "ca-2023-det-bottom",
  },
  {
    header: "Co-Funding Applicants\n2023\nDET Upper",
    key: "ca-2023-det-upper",
  },

  { header: "Co-Funding Awardee\n2023\nAmount", key: "cw-2023-amount" },
  { header: "Co-Funding Awardee\n2023\nGPA Bottom", key: "cw-2023-gpa-bottom" },
  { header: "Co-Funding Awardee\n2023\nGPA Upper", key: "cw-2023-gpa-upper" },
  {
    header: "Co-Funding Awardee\n2023\nIELTS Bottom",
    key: "cw-2023-ielts-bottom",
  },
  {
    header: "Co-Funding Awardee\n2023\nIELTS Upper",
    key: "cw-2023-ielts-upper",
  },
  {
    header: "Co-Funding Awardee\n2023\nTOEFL Bottom",
    key: "cw-2023-toefl-bottom",
  },
  {
    header: "Co-Funding Awardee\n2023\nTOEFL Upper",
    key: "cw-2023-toefl-upper",
  },
  { header: "Co-Funding Awardee\n2023\nDET Bottom", key: "cw-2023-det-bottom" },
  { header: "Co-Funding Awardee\n2023\nDET Upper", key: "cw-2023-det-upper" },
];

module.exports = {
  REGIONS,
  INTAKE_ATTRIBUTE,
  YEARS,
  SHEET_COLUMNS,
  OUTPUT_FILENAME,
  SCOPE,
  LOG_FILENAME,
  RETRIES_ON_UNIVERSITY,
};
