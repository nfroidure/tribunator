import { PUBLICATIONS } from "../../utils/constants";
import { pathJoin } from "../../utils/files";
import { readEntries } from "../../utils/frontmatter";
import { readParams } from "../../utils/params";
import { collectMarkdownText, parseMarkdown } from "../../utils/markdown";
import { datedPagesSorter } from "../../utils/contents";
import { summarize } from "../../utils/summarize";
import { readGlobalStats } from "../../utils/globalStats";
import Layout from "../../layouts/main";
import ContentBlock from "../../components/contentBlock";
import Heading1 from "../../components/h1";
import Paragraph from "../../components/p";
import Anchor from "../../components/a";
import Head from "next/head";
import Tribunes from "../../components/tribunes";
import Top from "../../components/top";
import type { FrontMatterResult } from "front-matter";
import type { MarkdownRootNode } from "../../utils/markdown";
import type { GetStaticProps } from "next";
import type { BuildQueryParamsType } from "../../utils/params";
import type { Tribune, TribuneFrontmatterMetadata } from "../../utils/tribunes";
import type {
  BaseListingPageMetadata,
  BasePagingPageMetadata,
} from "../../utils/contents";
import type { GlobalStatsSummary } from "../../utils/writters";
import HorizontalRule from "../../components/hr";

export type Props = BasePagingPageMetadata<Tribune> & {
  globalStats: GlobalStatsSummary;
};

const PARAMS_DEFINITIONS = {
  page: {
    type: "number",
    mode: "unique",
  },
} as const;

type Params = BuildQueryParamsType<typeof PARAMS_DEFINITIONS>;

const ENTRIES_PER_PAGE = 10;

const Entries = ({
  title,
  description,
  entries,
  page,
  pagesCount,
  globalStats,
}: Props) => (
  <Layout title={title} description={description}>
    <Head>
      <link
        rel="alternate"
        type="application/atom+xml"
        title={`${title} (Atom)`}
        href="/tribunes.atom"
      />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${title} (RSS)`}
        href="/tribunes.rss"
      />
    </Head>
    <ContentBlock>
      <Heading1 className="title">Tribunes</Heading1>
      <Paragraph>
        Retrouvez toutes les tribunes politiques sur cette page.
      </Paragraph>

      <Top summary={globalStats} />

      <HorizontalRule />

      <Tribunes entries={entries} base={"/tribunes/"} />

      <nav className="pagination">
        {page > 1 ? (
          <Anchor
            icon="arrow-left"
            href={page > 2 ? `/tribunes/pages/${page - 1}` : "/tribunes"}
            rel="previous"
          >
            Précédent
          </Anchor>
        ) : null}{" "}
        {page < pagesCount ? (
          <Anchor
            icon="arrow-right"
            iconPosition="last"
            href={`/tribunes/pages/${page + 1}`}
            rel="next"
          >
            Suivant
          </Anchor>
        ) : null}
      </nav>
    </ContentBlock>
    <style jsx>{`
      .pagination {
        display: flex;
        gap: var(--gutter);
        align-items: center;
        justify-content: center;
        padding: var(--vRythm) 0 0 0;
      }
      @media print {
        .pagination {
          display: none;
        }
      }
    `}</style>
  </Layout>
);

export const entriesToBaseListingMetadata = (
  baseEntries: FrontMatterResult<TribuneFrontmatterMetadata>[]
): BaseListingPageMetadata<Tribune> => {
  const title = `Tous les tribunes`;
  const description =
    "Retrouvez toutes les tribunes politiques des élu·es du Douaisis sur cette page. Les tribunes sont reprises sans modification et sont la responsabilité de leurs auteurices.";
  const entries = baseEntries
    .map<Tribune>((entry) => {
      const content = parseMarkdown(entry.body) as MarkdownRootNode;

      return {
        ...entry.attributes,
        title: `${
          entry.attributes.authors.length === 1
            ? entry.attributes.authors[0].name
            : entry.attributes.group.name
        } - ${new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "long",
        }).format(new Date(entry.attributes.date))}`,
        description: `Tribune de ${entry.attributes.authors
          .map(({ name }) => name)
          .join(", ")} dans le ${
          PUBLICATIONS[entry.attributes.publication]
        } du ${new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "full",
        }).format(new Date(entry.attributes.date))}`,
        content,
        summary: summarize(collectMarkdownText(content), 155),
        ...(entry.attributes.authors.length === 1
          ? {
              illustration: {
                url: `images/portraits/${entry.attributes.authors[0].portrait}`,
                alt: `Portrait de ${entry.attributes.authors[0].name}`,
              },
            }
          : {}),
      };
    })
    .sort(datedPagesSorter);

  return {
    title,
    description,
    entries,
    pagesCount: Math.ceil(entries.length / ENTRIES_PER_PAGE),
  };
};

export const getStaticProps: GetStaticProps<Props, { page: string }> = async ({
  params,
}) => {
  const globalStats = await readGlobalStats();
  const castedParams = readParams(PARAMS_DEFINITIONS, params || {}) as Params;
  const page = castedParams?.page || 1;
  const baseProps = entriesToBaseListingMetadata(
    await readEntries<TribuneFrontmatterMetadata>(
      pathJoin(".", "contents", "tribunes")
    )
  );
  const title = `${baseProps.title}${
    page && page !== 1 ? ` - page ${page}` : ""
  }`;
  const entries = baseProps.entries.slice(
    (page - 1) * ENTRIES_PER_PAGE,
    (page - 1) * ENTRIES_PER_PAGE + ENTRIES_PER_PAGE
  );

  return {
    props: {
      ...baseProps,
      title,
      entries,
      page,
      globalStats,
    } as Props,
  };
};

export default Entries;
