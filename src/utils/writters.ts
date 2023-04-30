import { toASCIIString } from "./ascii";
import { pathJoin, readDir, readJSON } from "./files";

export type WritterStats = {
  name: string;
  mandates: string[];
  groups: string[];
  groupsIds: string[];
  locality: string;
  country: string;
  portrait: string;
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
