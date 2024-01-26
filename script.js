const puppeteer = require("puppeteer");

async function run() {
  let dataToSearch = "cat";
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

  const randomSrc =
    modifiedSrcs[Math.floor(Math.random() * modifiedSrcs.length)];

  const boundingBox = await page.evaluate((src) => {
    const img = document.querySelector(`img[src="${src}"]`);
    const { x, y, width, height } = img.getBoundingClientRect();
    return { x, y, width, height };
  }, randomSrc);

  
  boundingBox.x += 9;

  
  await page.screenshot({
    path: 'screenshot_image.jpg',
    clip: boundingBox,
  });

   await browser.close();
}

run();
