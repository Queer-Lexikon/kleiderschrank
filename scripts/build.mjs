import { build } from "esbuild";
import { promises as fs } from "fs";
import path from "path";

const args = new Set(process.argv.slice(2));
const minify = !args.has("--no-minify");

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const assetsDir = path.join(distDir, "assets");

const copyDir = async (src, dest) => {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const from = path.join(src, entry.name);
      const to = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(from, to);
        return;
      }
      if (entry.isFile()) {
        await fs.copyFile(from, to);
      }
    }),
  );
};

const buildHtml = async () => {
  const htmlPath = path.join(rootDir, "index.html");
  const html = await fs.readFile(htmlPath, "utf8");
  const withCss = html.replace(
    /<link\s+rel="stylesheet"\s+href="src\/style\.css"\s*\/?>/,
    '<link rel="stylesheet" href="assets/app.css" />',
  );
  const withJs = withCss.replace(
    /<script\s+type="module"\s+src="src\/app\/bootstrap\.js"\s*><\/script>/,
    '<script type="module" src="assets/app.js"></script>',
  );
  await fs.writeFile(path.join(distDir, "index.html"), withJs);
};

const run = async () => {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(assetsDir, { recursive: true });

  await Promise.all([
    build({
      entryPoints: ["src/app/bootstrap.js"],
      bundle: true,
      format: "esm",
      sourcemap: true,
      minify,
      outfile: path.join(assetsDir, "app.js"),
      loader: {
        ".ttf": "file",
      },
    }),
    build({
      entryPoints: ["src/style.css"],
      bundle: true,
      minify,
      outfile: path.join(assetsDir, "app.css"),
      loader: {
        ".ttf": "file",
      },
    }),
  ]);

  await buildHtml();
  await Promise.all([
    copyDir(path.join(rootDir, "img"), path.join(distDir, "img")),
    copyDir(path.join(rootDir, "fonts"), path.join(distDir, "fonts")),
    copyDir(path.join(rootDir, "data"), path.join(distDir, "data")),
  ]);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
