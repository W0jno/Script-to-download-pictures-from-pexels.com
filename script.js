const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");
const readline = require("readline");
async function run(dataToSearch) {
  let modifiedSrcs = [];

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();

  await page.goto(`https://www.pexels.com/pl-pl/szukaj/${dataToSearch}`);
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
  // const randomSrc =
  //   modifiedSrcs[Math.floor(Math.random() * modifiedSrcs.length)];
  const folder = fs.mkdirSync(`${dataToSearch}`);

  for (let i = 0; i < modifiedSrcs.length; i++) {
    https.get(modifiedSrcs[i], (res) => {
      const stream = fs.createWriteStream(
        `${dataToSearch}/picture${i + 1}.png`
      );
      res.pipe(stream);
      stream.on("finish", () => {
        stream.close();
      });
    });
  }
  await browser.close();
}

const getDataFromUser = () => {
  let rl = readline.createInterface(process.stdin, process.stdout);
  let dataToSearch = "";

  rl.question("Insert data to search: ", (data) => {
    dataToSearch = data;
    run(dataToSearch);
  });
};

getDataFromUser();
