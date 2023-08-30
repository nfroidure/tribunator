import type { BaseContentPageMetadata } from "./contents";
import type { MarkdownRootNode } from "./markdown";

export type BaseAuthor = {
  id: string;
  name: string;
  mandates: string[];
  portrait: string;
};
export type BaseGroup = {
  id: string;
  name: string;
  type: string;
  party: string;
  partyAbbr: string;
  logo: string;
};

export type TribuneFrontmatterMetadata = {
  id: string;
  authors: BaseAuthor[];
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
