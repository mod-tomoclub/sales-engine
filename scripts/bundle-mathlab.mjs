/**
 * Inline the Math Lab build into a single self-contained HTML fragment.
 *
 * Emits two files:
 *   dist-mathlab/mathlab.html           full document — open from disk, email, intranet
 *   dist-mathlab/mathlab-artifact.html  body fragment — for hosts that supply their own
 *                                       <head>, e.g. publishing as a hosted page
 *
 * Run: npm run build:mathlab
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist-mathlab");
const INDEX = join(DIST, "mathlab.html");

if (!existsSync(INDEX)) {
  console.error("\n  dist-mathlab/mathlab.html not found — run the vite build first.\n");
  process.exit(1);
}

const html = readFileSync(INDEX, "utf8");
const assets = join(DIST, "assets");
const files = existsSync(assets) ? readdirSync(assets) : [];

const jsFiles = files.filter((f) => f.endsWith(".js"));
if (jsFiles.length !== 1) {
  console.error(`\n  Expected exactly one JS chunk, found ${jsFiles.length}. Code splitting would break inlining.\n`);
  process.exit(1);
}

const css = files.filter((f) => f.endsWith(".css")).map((f) => readFileSync(join(assets, f), "utf8")).join("\n");
// A literal </script> inside bundled string data would close the inline tag early.
const js = readFileSync(join(assets, jsFiles[0]), "utf8").replace(/<\/script/gi, "<\\/script");

const TITLE = "Tomo School — Math Lab";
const body = `<div id="root"></div>
<script type="module">
${js}
</script>`;

writeFileSync(
  join(DIST, "mathlab-artifact.html"),
  `<title>${TITLE}</title>\n<style>\n${css}\n</style>\n${body}\n`,
);

writeFileSync(
  join(DIST, "mathlab.html"),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${TITLE}</title>
<style>
${css}
</style>
</head>
<body>
${body}
</body>
</html>
`,
);

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`\n  css ${kb(css.length)} + js ${kb(js.length)}`);
console.log(`  mathlab.html           -> ${join(DIST, "mathlab.html")}`);
console.log(`  mathlab-artifact.html  -> ${join(DIST, "mathlab-artifact.html")}\n`);
void html;
