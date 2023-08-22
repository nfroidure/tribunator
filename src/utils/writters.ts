import { toASCIIString } from "./ascii";
import { pathJoin, readDir, readJSON } from "./files";
import type { Author, BaseGroup } from "./tribunes";

export type PresenceItem = {
  date: string;
  present: boolean;
  delegation?: Pick<Author, "id" | "name">;
  arrivedLate?: boolean;
  leftBeforeTheEnd?: boolean;
};
export type PresenceStatItem = {
  total: number;
  present: number;
  arrivedLate: number;
  leftBeforeTheEnd: number;
  delegation: number;
};
export type OccurenceItem = {
  id: string;
  date: string;
  count: number;
};
export type SentimentOccurenceItem = {
  id: string;
  date: string;
  positive: number;
  neutral: number;
  negative: number;
};
export type StatItem = {
  mean: { count: number; total: number };
  min: { value: number; ids: string[]; restLength?: number };
  max: { value: number; ids: string[]; restLength?: number };
};

export type StatsSummary = {
  sentences: StatItem;
  exclamations: StatItem;
  questions: StatItem;
  bolds: StatItem;
  caps: StatItem;
  sentiments: {
    positive: StatItem;
    neutral: StatItem;
    negative: StatItem;
  };
};
export type StatsData = {
  writtings: {
    date: string;
    id: string;
  }[];
  sentences: OccurenceItem[];
  exclamations: OccurenceItem[];
  questions: OccurenceItem[];
  bolds: OccurenceItem[];
  caps: OccurenceItem[];
  words: { word: string; count: number }[];
  sentiments: SentimentOccurenceItem[];
  summary: StatsSummary;
};
export type WritterStats = {
  id: string;
  name: string;
  mandates: string[];
  groups: BaseGroup[];
  locality: string;
  country: string;
  portrait: string;
  presences?: Record<string, PresenceItem[]>;
  presencesStats?: Record<string, PresenceStatItem>;
} & StatsData;

export type Writter = {
  id: string;
  date: string;
  title: string;
  description: string;
  illustration?: {
    url: string;
    alt: string;
  };
  stats: Omit<WritterStats, "presences">;
  presences?: Record<string, PresenceItem[]>;
  presencesStats?: Record<string, PresenceStatItem>;
};

export function authorToWritterFilename(author: string) {
  return `${toASCIIString(author)}.json`;
}

export async function readWritterEntry(file: string): Promise<WritterStats> {
  return readJSON<WritterStats>(pathJoin(".", "contents", "writters", file));
}

export async function readWrittersEntries(
  dirPath: string
): Promise<WritterStats[]> {
  const files = await readDir(dirPath);

  return await Promise.all(files.map((file) => readWritterEntry(file)));
}
