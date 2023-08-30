import { toASCIIString } from "./ascii";
import { pathJoin, readDir, readJSON } from "./files";
import type { BaseAuthor } from "./tribunes";
import type { StatsData } from "./writters";

export type GroupStats = {
  id: string;
  name: string;
  party: string;
  partyAbbr: string;
  type: string;
  logo: string;
  authors: BaseAuthor[];
  locality: string;
  country: string;
  totalWords: number;
  totalSignificantWords: number;
} & StatsData;

export type Group = {
  id: string;
  date: string;
  title: string;
  description: string;
  illustration?: {
    url: string;
    alt: string;
  };
  stats: GroupStats;
};

export function groupToGroupFilename(name: string) {
  return `${toASCIIString(name)}.json`;
}

export async function readGroupEntry(file: string): Promise<GroupStats> {
  return readJSON<GroupStats>(pathJoin(".", "contents", "groups", file));
}

export async function readGroupsEntries(
  dirPath: string
): Promise<GroupStats[]> {
  const files = await readDir(dirPath);

  return await Promise.all(files.map((file) => readGroupEntry(file)));
}
