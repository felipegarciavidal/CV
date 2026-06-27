import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { render as renderWeb } from "./theme.js";
import puppeteer from "puppeteer";

// Theme de JSON Resume para el PDF. Cámbialo por el que quieras.
const PDF_THEME = "jsonresume-theme-even";

const resume = JSON.parse(readFileSync("./resume.json", "utf-8"));
mkdirSync("./dist", { recursive: true });

// 1) WEB → con tu theme propio
writeFileSync("./dist/index.html", renderWeb(resume));
console.log("✓ HTML  → dist/index.html (theme propio)");

// 2) PDF → con un theme de JSON Resume
const themeMod = await import(PDF_THEME);
const renderPdf = themeMod.render || themeMod.default?.render || themeMod.default;
if (typeof renderPdf !== "function") {
  throw new Error(`El theme ${PDF_THEME} no exporta una función render()`);
}
const pdfHtml = renderPdf(resume);

const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setContent(pdfHtml, { waitUntil: "networkidle0" });
await page.pdf({
  path: "./dist/felipe-cv.pdf",
  format: "A4",
  printBackground: true,
  margin: { top: "12mm", bottom: "12mm", left: "0mm", right: "0mm" },
});
await browser.close();
console.log(`✓ PDF   → dist/felipe-cv.pdf (${PDF_THEME})`);