import { toASCIIString } from "./ascii";
import { pathJoin, readDir, readJSON } from "./files";

export type GroupStats = {
  id: string;
  name: string;
  party: string;
  partyAbbr: string;
  type: string;
  logo: string;
  authors: string[];
  locality: string;
  country: string;
  writtings: {
    date: string;
    id: string;
  }[];
  sentences: {
    date: string;
    count: number;
  }[];
  sentiments: {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }[];
  exclamations: {
    date: string;
    count: number;
  }[];
  questions: {
    date: string;
    count: number;
  }[];
  bolds: {
    date: string;
    count: number;
  }[];
  caps: {
    date: string;
    count: number;
  }[];
  words: {
    word: string;
    count: number;
  }[];
  summary: {
    sentences: {
      mean: number;
      min: number;
      max: number;
    };
    exclamations: {
      mean: number;
      min: number;
      max: number;
    };
    questions: {
      mean: number;
      min: number;
      max: number;
    };
    bolds: {
      mean: number;
      min: number;
      max: number;
    };
    caps: {
      mean: number;
      min: number;
      max: number;
    };
    sentiments: {
      positive: {
        mean: number;
        min: number;
        max: number;
      };
      neutral: {
        mean: number;
        min: number;
        max: number;
      };
      negative: {
        mean: number;
        min: number;
        max: number;
      };
    };
  };
};

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
