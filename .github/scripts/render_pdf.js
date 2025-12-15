const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const htmlUrl = process.env.HTML_URL;
  const pdfName = process.env.PDF_NAME;

  if (!htmlUrl) throw new Error("Missing HTML_URL");
  if (!pdfName) throw new Error("Missing PDF_NAME");

  const outPath = `docs/pdfs/${pdfName}.pdf`;
  fs.mkdirSync("docs/pdfs", { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(htmlUrl, { waitUntil: "networkidle", timeout: 120000 });

  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "8mm", right: "0mm", bottom: "8mm", left: "0mm" }
  });

  await browser.close();
  console.log(`PDF written to ${outPath}`);
})();
