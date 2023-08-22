import { join as pathJoin } from "node:path";
import { readFile, writeFile, readdir, access } from "node:fs/promises";
import { toASCIIString } from "../src/utils/ascii";
import type { Author } from "../src/utils/tribunes";
import type { PresenceItem } from "../src/utils/writters";

run();

async function run() {
  const files = await readdir(pathJoin("sources", "presence"));

  for (const file of files) {
    console.warn(`➕ - Processing ${file}.`);

    const [[, , ...dateHeaders], sources, ...rows] = (
      await readFile(pathJoin("sources", "presence", file))
    )
      .toString()
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((id) => id)
      .map((line) => line.split(",").map((cell) => cell.trim()));
    const persons: Record<
      Author["id"],
      Pick<Author, "id" | "name"> & {
        presences: (PartialPresence & { date: string })[];
      }
    > = {};

    for (const row of rows) {
      const [id, name, ...presencesCodes] = row;

      console.warn(`➕ - Setting presence of ${name}.`);

      persons[id] = {
        id: toASCIIString(name),
        name,
        presences: presencesCodes
          .filter((id) => id)
          .map(parsePresenceCode)
          .map((presence, index) => ({
            date: dateHeaders[index].replace("'", "") + "T19:00:00Z",
            ...presence,
          })),
      };

      try {
        await access(
          pathJoin("contents", "writters", `${persons[id].id}.json`)
        );
      } catch (err) {
        console.warn(`🤷 - Cannot find ${name} in the writters.`);
        throw err;
      }
    }

    for (const personId of Object.keys(persons)) {
      const presences: PresenceItem[] = persons[personId].presences.map(
        (presence) =>
          ({
            ...presence,
            ...(presence.delegation
              ? {
                  delegation: {
                    id: persons[presence.delegation].id,
                    name: persons[presence.delegation].name,
                  },
                }
              : {}),
          } as PresenceItem)
      );

      const writterData = JSON.parse(
        (
          await readFile(
            pathJoin("contents", "writters", `${persons[personId].id}.json`)
          )
        ).toString()
      );

      writterData.presences = writterData.presences || {};
      writterData.presences[file.replace(/\.csv$/, "")] =
        presences.sort(sortByDate);

      await writeFile(
        pathJoin("contents", "writters", `${persons[personId].id}.json`),
        JSON.stringify(writterData, null, 2)
      );
    }
  }
}

type PartialPresence = Omit<PresenceItem, "delegation" | "date"> & {
  delegation?: number;
};

function parsePresenceCode(code: string): PartialPresence {
  return {
    present: code.replace(/[^PREABS]/g, "") === "PRE",
    ...(code.split(":")[1]
      ? { delegation: parseInt(code.split(":")[1], 10) }
      : {}),
    ...(code.startsWith("-")
      ? {
          arrivedLate: true,
        }
      : {}),
    ...(code.split(":")[0].endsWith("-")
      ? {
          leftBeforeTheEnd: true,
        }
      : {}),
  };
}

function sortByDate<T extends { date: string }>(
  authorA: T,
  authorB: T
): number {
  if (Date.parse(authorA.date) < Date.parse(authorB.date)) {
    return -1;
  } else if (Date.parse(authorA.date) > Date.parse(authorB.date)) {
    return 1;
  }
  return 0;
}
