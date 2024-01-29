const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");

/**
 *  Runs script
 *
 * @param {string} dataToSearch
 */
const run = async (dataToSearch) => {
  fs.mkdirSync(`zdjecia`);
  for (let i = 0; i < dataToSearch.length; i++) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
    });
    const modifiedSrcs = [];

    const page = await browser.newPage();
    await page.goto(`https://www.pexels.com/pl-pl/szukaj/${dataToSearch[i]}`, {
      waitUntil: "domcontentloaded",
    });
    await page.setViewport({ width: 1920, height: 1080 });
    await scrollDown(page, 1000);
    const images = await page.$$("img");

    const srcs = await Promise.all(
      images.map(async (image) => {
        return await page.evaluate((element) => element.src, image);
      })
    );

    srcs.map((src) => {
      if (
        typeof src !== "undefined" &&
        src !== null &&
        src.includes("https://images.pexels.com/photos/")
      ) {
        modifiedSrcs.push(src);
      }
    });

    fs.mkdirSync(`zdjecia/${dataToSearch[i]}`);

    for (let j = 0; j < modifiedSrcs.length; j++) {
      https.get(modifiedSrcs[j], (res) => {
        const stream = fs.createWriteStream(
          `zdjecia/${dataToSearch[i]}/picture${j + 1}.png`
        );
        res.pipe(stream);
        stream.on("finish", () => {
          stream.close();
        });
      });
    }

    await page.close();
    await browser.close();
  }
};
/**
 * Gets data from "frazy.txt" file, then run a "run" function
 *
 */
const getDataFromFile = async () => {
  const dataToSearch = await fs
    .readFileSync("./frazy.txt", { encoding: "utf8" })
    .split(",");

  run(dataToSearch);
};
/**
 *
 * Scrolls down to the bottom of the page or to the maximum number of scrolls
 *
 * @param {puppeteer.Page} page
 * @param {number} maxScrolls
 */
const scrollDown = async (page, maxScrolls) => {
  await page.evaluate(async (maxScrolls) => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var scrolls = 0; // scrolls counter
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;

        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++; // increment counter

        // stop scrolling if reached the end or the maximum number of scrolls
        if (
          totalHeight >= scrollHeight - window.innerHeight ||
          scrolls >= maxScrolls
        ) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  }, maxScrolls); // pass maxScrolls to the function
};

getDataFromFile();
