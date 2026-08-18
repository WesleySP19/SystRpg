import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.toString()));
  page.on("requestfailed", req => console.log("REQ FAILED:", req.url(), req.failure().errorText));
  
  await page.goto("http://localhost:4000", { waitUntil: "networkidle2", timeout: 10000 }).catch(e => console.log("Navigation timeout or error:", e.message));
  await browser.close();
})();
