import { readFile, writeFile, readDir, access } from "../src/utils/files";
import { join as pathJoin } from "node:path";
import { tmpdir } from "node:os";
import { argv } from "node:process";
import { exec as _exec } from "node:child_process";
import { promisify } from "node:util";
import { toASCIIString } from "../src/utils/ascii";
import type { BaseAuthor, BaseGroup } from "../src/utils/tribunes";

const exec = promisify(_exec);

run();

async function run() {
  const files = (await readDir(pathJoin("sources", "tribunes"))).filter(
    (file) => (argv.slice(2).length ? argv.includes(file) : true)
  );

  for (const file of files) {
    const content = await readFile(pathJoin("sources", "tribunes", file));

    console.warn(`➕ - Processing ${file}.`);

    const publication = file.split("-").slice(2).join("-").replace(/\.md$/, "");
    const occurence = file.split("-").slice(0, 2).join("-");
    const parts = content.split(/[\-]{3,}/gm);
    const sources = parts[0]
      .split(/(\r?\n)+/gm)
      .filter((line) => line.startsWith("https://"));
    const tempDir = tmpdir();
    const sourcesCaptures = await sources.reduce(
      async (sourcesCaptures, source) => {
        const captures = await sourcesCaptures;
        const filename = `${publication}-${occurence}-p${source.replace(
          /^.*p([0-9]+).svgz/,
          "$1"
        )}.png`;
        const captureDestination = pathJoin(
          "public",
          "images",
          "sources",
          filename
        );
        const tempFile = pathJoin(tempDir, filename);

        await new Promise((resolve) => setTimeout(resolve, 500));
        await exec(
          `google-chrome  --headless --screenshot=${tempFile} ${source}`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        await exec(`convert ${tempFile} -trim ${captureDestination}`);
        return [...captures, captureDestination];
      },
      Promise.resolve([] as string[])
    );

    if (!sources.length) {
      console.error(`🤔 - No sources for ${file} !`);
      continue;
    }

    const tribunes = parts.slice(1);

    for (const tribune of tribunes) {
      const parts = tribune.trim().split(/\n[\n]+/gm);
      const authorPart = (parts.pop() as string).trim();
      const mayorCase = !!authorPart.match(/^\s*votre maire/i);
      const authorParts = authorPart.split(/\n/).slice(mayorCase ? 1 : 0);

      if (authorParts.length % 2 !== 0) {
        console.error(`🤔 - Author parts for ${file} looks strange!`);
      }

      const authors: BaseAuthor[] = [];

      do {
        const name = authorParts.shift() as string;
        const id = toASCIIString(name);
        let portrait = id + ".jpg";
        const mandates = (authorParts.shift() as string).split(/\s*,\s+/);

        try {
          await access(pathJoin("public", "images", "portraits", portrait));
        } catch (err) {
          portrait = "default.svg";
        }

        const author: BaseAuthor = {
          id,
          name,
          mandates,
          portrait,
        };

        authors.push(author);
      } while (authorParts.length);

      const content = parts
        .slice(mayorCase ? 0 : 1)
        .join("\n\n")
        .trim();
      const group: BaseGroup = buildGroupDetails(
        mayorCase
          ? "Majorité municipale : Douai au Cœur (Parti Socialiste)"
          : parts.slice(0, 1).join("")
      );
      const source = mayorCase
        ? sourcesCaptures[1] || sourcesCaptures[0]
        : sourcesCaptures[0];

      const date = `${occurence}-01T00:00:00Z`;
      const id = `${occurence}-${publication}-${authors
        .map(({ id }) => id)
        .join("-")}`;

      const markdown = `---
id: "${id}"
authors:${authors
        .map(
          ({ id, name, mandates, portrait }) => `
- id: "${id}"
  name: "${name}"
  mandates: ${mandates
    .map(
      (mandate) => `
  - "${mandate}"`
    )
    .join("")}
  portrait: "${portrait}"`
        )
        .join("")}
group:
  id: "${group.id}"
  name: "${group.name}"
  type: "${group.type}"
  party: "${group.party}"
  partyAbbr: "${group.partyAbbr}"
  logo: "${group.logo}"
date: "${date}"
publication: "${publication}"
source: "${source}"
language: "fr"
locality: "Douai"
country: "France"
---

${content}
`;
      await writeFile(pathJoin("contents", "tribunes", `${id}.md`), markdown);
    }
  }
}

function buildGroupDetails(fullName): BaseGroup {
  const matches = fullName.match(/^(.*) :([^\(]*)(\(.*\)|)$/);
  const name = matches[2].trim() || "Non-Affilié·es";
  const type = matches[1].trim();
  let party = matches[3].trim() || "Sans-Étiquette";
  let abbr = "SE";
  let logo = "default.svg";

  if (party.includes("Europe Écologie les Verts")) {
    party = "Europe Écologie-Les Verts";
    abbr = "EELV";
    logo = "eelv-douaisis.svg";
  }
  if (party.includes("Vivre Douai")) {
    party = "Citoyen·nes de Vivre Douai";
    abbr = "SE";
    logo = "douai-au-coeur.svg";
  }
  if (party.includes("Parti Socialiste")) {
    party = "Parti Socialiste";
    abbr = "PS";
    logo = "ps.png";
  }
  if (
    party.includes("L’humain d’abord pour Douai") ||
    party.includes("Parti Communiste")
  ) {
    party = "Parti Communiste Français";
    abbr = "PCF";
    logo = "pcf.svg";
  }
  if (party.includes("Rassemblement National")) {
    party = "Rassemblement National";
    abbr = "RN";
  }
  if (party.includes("UMP")) {
    party = "Union pour un Mouvement Populaire";
    abbr = "UMP";
  }
  if (fullName.includes("Douai dynamique et durable")) {
    party = "Alliance LReM-Modem";
    abbr = "DVD";
  }
  if (fullName.includes("Ensemble faisons Douai")) {
    party = "Sans-Étiquette";
    abbr = "SE";
  }

  return {
    id: toASCIIString(`${name} ${abbr}`),
    name,
    type,
    party,
    partyAbbr: abbr,
    logo,
  };
}
