import type { BaseContentPageMetadata } from "./contents";
import type { MarkdownRootNode } from "./markdown";

export type Author = {
  id: string;
  name: string;
  mandates: string[];
  portrait: string;
};
export type BaseGroup = {
  id: string;
  name: string;
  type?: string;
  party?: string;
  abbr?: string;
  logo?: string;
};

export type TribuneFrontmatterMetadata = {
  id: string;
  authors: Author[];
  group: BaseGroup;
  date: string;
  publication: string;
  source: string;
  language: string;
  locality: string;
  country: string;
};

export type Tribune = {
  id: string;
  content: MarkdownRootNode;
} & TribuneFrontmatterMetadata &
  BaseContentPageMetadata;
