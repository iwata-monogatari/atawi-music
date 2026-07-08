import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function fail(message) {
  errors.push(message);
}

function walkHtml(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".wrangler", ".agents", ".claude"].includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, files);
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

git(["fetch", "--quiet", "origin", "main"]);

const head = git(["rev-parse", "HEAD"]);
const origin = git(["rev-parse", "origin/main"]);
if (head !== origin) {
  fail("HEAD is not origin/main. Push the exact commit first, then deploy.");
}

const status = git(["status", "--porcelain=v1"]);
if (status) {
  fail("Working tree is dirty. Commit or discard changes before deploy.");
}

const directRandomHeader = [];
for (const file of walkHtml(root)) {
  const html = readFileSync(file, "utf8");
  if (html.includes('<a class="header-random-encounter" href="/?random=1">')) {
    directRandomHeader.push(relative(root, file));
  }
}
if (directRandomHeader.length) {
  fail(`Old direct random header link remains in ${directRandomHeader.length} HTML file(s).`);
}

const footerPath = join(root, "assets", "partials", "footer.html");
if (!existsSync(footerPath) || !readFileSync(footerPath, "utf8").includes("managed-footer:start")) {
  fail("Managed footer partial is missing.");
}

const css = readFileSync(join(root, "assets", "css", "style.css"), "utf8");
if (!css.includes("Stable restore guards")) {
  fail("Stable restore CSS guard is missing.");
}

const footerJs = readFileSync(join(root, "assets", "js", "footer.js"), "utf8");
if (!footerJs.includes('.site-header .header-random-encounter')) {
  fail("Header duplicate-prevention guard is missing from footer.js.");
}

if (errors.length) {
  console.error("Predeploy check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Predeploy check passed: clean latest commit, no old header link, footer and layout guards present.");
