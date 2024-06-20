import path from "node:path";
import fs from "node:fs";
import util from "node:util";
import { fileURLToPath } from "node:url";

import postcss from "postcss";
import esbuild from "esbuild";
import { rimraf } from "rimraf";
// import cssProcessing from "../scripts/css-processing.cjs";

// const { postCSSPlugins } = cssProcessing;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const styles = path.resolve(path.join(__dirname, "..", "theme.css"));

const themes = [path.resolve(path.join(__dirname, "..", "theme.css"))];

const readFilePromise = util.promisify(fs.readFile);

let componentsBuild = Promise.resolve();

const cssTransform = async () => {
  const css = await readFilePromise("dist/theme.out.css");
  postcss([])
    .process(css, { from: styles, to: "dist/theme.css" })
    .then((result) => {
      fs.writeFile("dist/theme.css", result.css, () => true);
      if (result.map) {
        fs.writeFile("dist/theme.css", result.map.toString(), () => true);
      }
    });
};

componentsBuild = esbuild
  .build({
    entryPoints: [styles],
    bundle: true,
    outfile: "dist/theme.out.css",
  })
  .catch(() => process.exit(1));

let themesBuild = Promise.resolve();

themesBuild = esbuild
  .build({
    entryPoints: themes,
    bundle: true,
    outdir: "dist/themes",
  })
  .catch(() => process.exit(1));

const clean = async () => {
  await rimraf.sync("dist/theme.out.css");
  console.log(`DELETED 'dist/theme.out.css'`);
};

(async () => {
  await componentsBuild;
  await cssTransform();
  await clean();
})();
