import { join as pathJoin } from "node:path";
import { readFile, writeFile, readdir, access } from "node:fs/promises";
import { toASCIIString } from "../src/utils/ascii";
import {
  OccurenceItem,
  aggregatesStats,
  computeStats,
  createBaseStatsItem,
  shrinkStats,
  sortByDate,
} from "../src/utils/stats";
import type { Author } from "../src/utils/tribunes";
import type {
  PresenceItem,
  PresenceStatItem,
  PresenceStatsSummary,
  StatsSummary,
} from "../src/utils/writters";

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

    const instanceCode = file.replace(/\.csv$/, "");
    const globalStats = JSON.parse(
      (await readFile(pathJoin("contents", `globalStats.json`))).toString()
    ) as StatsSummary;
    const globalOccurences: Record<
      keyof PresenceStatsSummary,
      OccurenceItem[]
    > = {
      presenceRatio: [],
      arrivedLate: [],
      leftBeforeTheEnd: [],
      delegation: [],
    };

    globalStats.presences = globalStats.presences || {};
    globalStats.presences[instanceCode] = [];
    globalStats.presencesStats = globalStats.presencesStats || {};
    globalStats.presencesStats[instanceCode] = {
      presenceRatio: createBaseStatsItem(),
      arrivedLate: createBaseStatsItem(),
      leftBeforeTheEnd: createBaseStatsItem(),
      delegation: createBaseStatsItem(),
    };

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
      ) as {
        presences?: Record<string, PresenceItem[]>;
        presencesStats?: Record<string, PresenceStatItem>;
      };

      writterData.presences = writterData.presences || {};
      writterData.presences[instanceCode] = presences.sort(sortByDate);

      writterData.presencesStats = writterData.presencesStats || {};
      writterData.presencesStats[instanceCode] = presences.reduce(
        (stats, presence) => ({
          total: stats.total + 1,
          present: stats.present + (presence.present ? 1 : 0),
          arrivedLate: stats.arrivedLate + (presence.arrivedLate ? 1 : 0),
          leftBeforeTheEnd:
            stats.leftBeforeTheEnd + (presence.leftBeforeTheEnd ? 1 : 0),
          delegation: stats.delegation + (presence.delegation ? 1 : 0),
        }),
        {
          total: 0,
          present: 0,
          arrivedLate: 0,
          leftBeforeTheEnd: 0,
          delegation: 0,
        }
      );

      await writeFile(
        pathJoin("contents", "writters", `${persons[personId].id}.json`),
        JSON.stringify(writterData, null, 2)
      );

      globalStats.authors[persons[personId].id] = globalStats.authors[
        persons[personId].id
      ] || {
        id: persons[personId].id,
        name: persons[personId].name,
        portrait: "default.svg",
        mandates: [],
        totalSignificantWords: 0,
        totalWords: 0,
      };

      globalStats.presences[instanceCode].push({
        id: persons[personId].id,
        ...writterData.presencesStats[instanceCode],
      });

      aggregatesStats(
        createBaseStatsItem(
          (writterData.presencesStats[instanceCode].present /
            writterData.presencesStats[instanceCode].total) *
            100,
          persons[personId].id
        ),
        globalStats.presencesStats[instanceCode].presenceRatio
      );
      globalStats.presencesStats[instanceCode].presenceRatio = shrinkStats(
        globalStats.presencesStats[instanceCode].presenceRatio
      );
      aggregatesStats(
        createBaseStatsItem(
          writterData.presencesStats[instanceCode].arrivedLate,
          persons[personId].id
        ),
        globalStats.presencesStats[instanceCode].arrivedLate
      );
      globalStats.presencesStats[instanceCode].arrivedLate = shrinkStats(
        globalStats.presencesStats[instanceCode].arrivedLate
      );
      aggregatesStats(
        createBaseStatsItem(
          writterData.presencesStats[instanceCode].leftBeforeTheEnd,
          persons[personId].id
        ),
        globalStats.presencesStats[instanceCode].leftBeforeTheEnd
      );
      globalStats.presencesStats[instanceCode].leftBeforeTheEnd = shrinkStats(
        globalStats.presencesStats[instanceCode].leftBeforeTheEnd
      );
      aggregatesStats(
        createBaseStatsItem(
          writterData.presencesStats[instanceCode].delegation,
          persons[personId].id
        ),
        globalStats.presencesStats[instanceCode].delegation
      );
      globalStats.presencesStats[instanceCode].delegation = shrinkStats(
        globalStats.presencesStats[instanceCode].delegation
      );
    }

    await writeFile(
      pathJoin("contents", `globalStats.json`),
      JSON.stringify(globalStats, null, 2)
    );
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
