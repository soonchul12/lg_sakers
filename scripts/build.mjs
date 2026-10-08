import { mkdir, copyFile, readFile } from "node:fs/promises";
const files = [
  "index.html",
  "styles.css",
  "charts.js",
  "case-data.js",
  "lg_crowd_clean.json",
  "kbl_benchmark.json",
  "season_trends.json",
];
for (const file of files) {
  const text = await readFile(file, "utf8");
  if (file.endsWith(".json")) JSON.parse(text);
}
await mkdir("dist", { recursive: true });
for (const file of files) await copyFile(file, "dist/" + file);
console.log("Static site built: " + files.length + " files in dist/");
