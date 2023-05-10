import { toASCIIString } from "./ascii";
import { pathJoin, readDir, readJSON } from "./files";

export type OccurenceItem = {
  count: number;
  date: string;
  id: string;
};
export type StatItem = {
  mean: { count: number; total: number };
  min: { value: number; ids: string[] };
  max: { value: number; ids: string[] };
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
  sentiments: {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }[];
  summary: {
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
};
export type WritterStats = {
  name: string;
  mandates: string[];
  groups: string[];
  groupsIds: string[];
  locality: string;
  country: string;
  portrait: string;
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
  stats: WritterStats;
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
