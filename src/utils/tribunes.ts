import type { BaseContentPageMetadata } from "./contents";
import type { MarkdownRootNode } from "./markdown";

export type TribuneFrontmatterMetadata = {
  id: string;
  author: string;
  title: string;
  description: string;
  summary: string;
  mandate: string;
  group: string;
  groupId: string;
  date: string;
  publication: string;
  source: string;
  language: string;
  locality: string;
  country: string;
  portrait: string;
  illustration?: {
    url: string;
    alt: string;
  };
};

export type Tribune = {
  id: string;
  content: MarkdownRootNode;
} & TribuneFrontmatterMetadata &
  BaseContentPageMetadata;
