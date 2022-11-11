const fs = require("fs");
const axios = require("axios");
const { stringify } = require("csv-stringify/sync");

/**
 * Add URLS here. Make sure they include https
 * example: https://google.com
 */
const urls = [];

/**
 * Given a url, identifies whether it's a TSI page or not.
 * - Get the HTML
 * - check whether it includes a TSI string
 *    - if so, return "Town Square Interactive"
 *    - if not, return "unknown"
 *    - if error, return ERROR
 * @param {string} url The URL to check
 */
const makeResult = async (url) => {
  // If any of these strings are present in the html, that indicates that it's a TSI site.
  const tags = ["tsi-phone", "tsi-address", "tsidesign"];
  // So, if for even one of the tags, the HTML includes that tag, `includesTsi` = true
  const includesTsi = (html) => tags.some((tag) => html.includes(tag));

  // Based on whether we previously identify if it's TSI,
  // fill the column with the TSI string
  const TSI = "Town Square Interactive";
  const makeTsiResult = (isTsi) => (isTsi ? TSI : "unknown");

  return await axios({ method: "get", url: url })
    .then((response) => response.data)
    .then(includesTsi)
    .then(makeTsiResult)
    .catch((err) => console.log(`Error on ${url}`) && "ERROR");
};

/**
 * Writes a CSV string to a new file.
 * @param {string} csv The body of the CSV to be written to file
 * @param {string} fileName The body of the CSV to be written to file
 */
const writeCsv = (csv, fileName) => {
  const successMessage = "File written successfully\n";
  fs.writeFile(fileName, csv, (err) => console.log(err || successMessage));
};

(async () => {
  const rows = urls.map(async (url) => [url, await makeResult(url)]);
  const csv = stringify(await Promise.all(rows));
  writeCsv(csv, "results.csv");
})();
