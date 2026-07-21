/**
 * Bundle the production build into ONE self-contained HTML file.
 *
 * Useful for sharing without hosting: email it, drop it on a USB stick, or
 * publish it as a static page. No external requests — CSS and JS are inlined
 * and the curriculum graph is already compiled into the bundle.
 *
 * Run: npm run build:standalone   (output: dist/standalone.html)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");

if (!existsSync(INDEX)) {
  console.error("\n  dist/index.html not found — run `npm run build` first.\n");
  process.exit(1);
}

const html = readFileSync(INDEX, "utf8");
const cssMatch = html.match(/href="\/assets\/([^"]+\.css)"/);
const jsMatch = html.match(/src="\/assets\/([^"]+\.js)"/);
if (!jsMatch) {
  console.error("\n  Could not find the built JS asset in dist/index.html.\n");
  process.exit(1);
}

const css = cssMatch ? readFileSync(join(DIST, "assets", cssMatch[1]), "utf8") : "";
// A literal </script> inside bundled string data would close the inline tag early.
const js = readFileSync(join(DIST, "assets", jsMatch[1]), "utf8").replace(/<\/script/gi, "<\\/script");

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Tomo School OS</title>
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
${js}
</script>
</body>
</html>
`;

const dest = join(DIST, "standalone.html");
writeFileSync(dest, out);
console.log(`\n  standalone.html  ${(out.length / 1024).toFixed(0)} KB  ->  ${dest}\n`);
