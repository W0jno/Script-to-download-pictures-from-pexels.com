const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");

async function run(dataToSearch) {
  for (let i = 0; i < dataToSearch.length; i++) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
    });
    const modifiedSrcs = [];

    const page = await browser.newPage();
    await page.goto(`https://www.pexels.com/pl-pl/szukaj/${dataToSearch[i]}`);
    await page.setViewport({ width: 1920, height: 1080 });

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

    fs.mkdirSync(`${dataToSearch[i]}`);

    for (let j = 0; j < modifiedSrcs.length; j++) {
      https.get(modifiedSrcs[j], (res) => {
        const stream = fs.createWriteStream(
          `${dataToSearch[i]}/picture${j + 1}.png`
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
}

const getDataFromFile = async () => {
  const dataToSearch = await fs
    .readFileSync("./frazy.txt", { encoding: "utf8" })
    .split(",");

  run(dataToSearch);
};

getDataFromFile();
