import { promises as fs } from "fs";
import { join as pathJoin } from "path";
import { tmpdir } from "node:os";
import childProcess from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(childProcess.exec);

const files = await fs.readdir(pathJoin("contents", "writters"));
const svgTemplate = await fs.readFile(pathJoin("public", "images", "profile.svg"), 'utf-8');
const defaultPortrait = `data:image/svg+xml;base64,${await fs.readFile(pathJoin("public", "images", "portraits", "default.svg"), 'base64')}`;

for (const file of files) {
    const writter = JSON.parse(await fs.readFile(
        pathJoin("contents", "writters", file),
        "utf-8"
    ));
    let portraitData = defaultPortrait;

    try {
        portraitData = `data:image/png;base64,${await fs.readFile(pathJoin("public", "images", "portraits", writter.portrait), 'base64')}`;
    } catch (err) {
        console.warn(`🤷 - No portrait for ${writter.name}`);
    }

    const tempDir = tmpdir();
    const fileName = file.replace(/\.json$/, '');
    const tempFile = pathJoin(tempDir, fileName + '.svg');

    await fs.writeFile(tempFile, svgTemplate.replace(/\{name\}/mg, writter.name).replace('{image}', portraitData));
    await exec(`inkscape --without-gui --export-png=${pathJoin("public", "images", "banners", fileName + '.png')} --file=${tempFile}`);
}
