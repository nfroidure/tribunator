import { promises as fs } from "fs";
import { join as pathJoin } from "path";
import { tmpdir } from "node:os";
import childProcess from "node:child_process";
import { promisify } from "node:util";
import type { WritterStats } from "../src/utils/writters";

const exec = promisify(childProcess.exec);

run();

async function run() {
  const files = await fs.readdir(pathJoin("contents", "writters"));
  const svgTemplate = await fs.readFile(
    pathJoin("public", "images", "profile.svg"),
    "utf-8"
  );
  const defaultPortrait = `data:image/svg+xml;base64,${await fs.readFile(
    pathJoin("public", "images", "portraits", "default.svg"),
    "base64"
  )}`;

  for (const file of files) {
    const writter = JSON.parse(
      await fs.readFile(pathJoin("contents", "writters", file), "utf-8")
    ) as WritterStats;
    let portraitData = defaultPortrait;
    console.warn(`♻️ - Generating profile banner for ${writter.name}`);

    try {
      portraitData = `data:image/png;base64,${await fs.readFile(
        pathJoin("public", "images", "portraits", writter.portrait),
        "base64"
      )}`;
    } catch (err) {
      console.warn(`🤷 - No portrait for ${writter.name}`);
    }

    const tempDir = tmpdir();
    const fileName = file.replace(/\.json$/, "");
    const tempFile = pathJoin(tempDir, fileName + ".svg");

    await fs.writeFile(
      tempFile,
      svgTemplate
        .replace(
          /\{x\}/gm,
          writter.presencesStats
            ? (
                (writter.presencesStats["cm-douai"].present /
                  writter.presencesStats["cm-douai"].total) *
                100
              ).toFixed(0)
            : "-"
        )
        .replace(/\{name\}/gm, writter.name)
        .replace(/\{kw1\}/gm, writter.words?.[0]?.word || "-")
        .replace(/\{kw2\}/gm, writter.words?.[1]?.word || "-")
        .replace(/\{kw3\}/gm, writter.words?.[2]?.word || "-")
        .replace(/\{image\}/gm, portraitData)
    );
    await exec(
      `inkscape --without-gui --export-png=${pathJoin(
        "public",
        "images",
        "banners",
        fileName + ".png"
      )} --file=${tempFile}`
    );
  }
}
