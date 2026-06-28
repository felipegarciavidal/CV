import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { render, pdfFilename } from "./theme.js";   // <-- importa también pdfFilename
import puppeteer from "puppeteer";

const PDF_THEME = "jsonresume-theme-even";

const resume = JSON.parse(readFileSync("./resume.json", "utf-8"));
mkdirSync("./dist", { recursive: true });

// 1) WEB → con tu theme propio
writeFileSync("./dist/index.html", render(resume));
console.log("✓ HTML  → dist/index.html (theme propio)");

// 2) PDF → con un theme de JSON Resume, con el nombre derivado del resume.json
const pdfPath = "./dist/" + pdfFilename(resume);   // <-- ya no está hardcodeado
const themeMod = await import(PDF_THEME);
const renderPdf = themeMod.render || themeMod.default?.render || themeMod.default;
if (typeof renderPdf !== "function") {
  throw new Error(`El theme ${PDF_THEME} no exporta una función render()`);
}
const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setContent(renderPdf(resume), { waitUntil: "networkidle0" });
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "12mm", bottom: "12mm", left: "0mm", right: "0mm" },
});
await browser.close();
console.log("✓ PDF   → " + pdfPath + " (" + PDF_THEME + ")");