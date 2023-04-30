import { join as pathJoin } from "path";
import { readParams } from "../../utils/params";
import { readWrittersEntries } from "../../utils/writters";
import { toASCIIString } from "../../utils/ascii";
import { titledPagesSorter } from "../../utils/contents";
import Layout from "../../layouts/main";
import ContentBlock from "../../components/contentBlock";
import Heading1 from "../../components/h1";
import Paragraph from "../../components/p";
import Anchor from "../../components/a";
import Head from "next/head";
import Writters from "../../components/writters";
import type { Writter, WritterStats } from "../../utils/writters";
import type {
  BaseListingPageMetadata,
  BasePagingPageMetadata,
} from "../../utils/contents";
import type { GetStaticProps } from "next";
import type { BuildQueryParamsType } from "../../utils/params";

export type Props = BasePagingPageMetadata<Writter>;

const PARAMS_DEFINITIONS = {
  page: {
    type: "number",
    mode: "unique",
  },
} as const;

type Params = BuildQueryParamsType<typeof PARAMS_DEFINITIONS>;

const POSTS_PER_PAGE = 10;

const Entries = ({ title, description, entries, page, pagesCount }: Props) => (
  <Layout title={title} description={description}>
    <Head>
      <link
        rel="alternate"
        type="application/atom+xml"
        title={`${title} (Atom)`}
        href="/elu-es.atom"
      />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${title} (RSS)`}
        href="/elu-es.rss"
      />
    </Head>
    <ContentBlock className="title">
      <Heading1 className="title">Les élu·es</Heading1>
      <Paragraph>
        Retrouvez toustes les élu·es cité·es sur ce site et les statistiques qui
        les concernent.
      </Paragraph>

      <Writters entries={entries} base={"/elu-es/"} />

      <nav className="pagination">
        {page > 1 ? (
          <Anchor
            icon="arrow-left"
            href={page > 2 ? `/elu-es/pages/${page - 1}` : "/elu-es"}
            rel="previous"
          >
            Précédent
          </Anchor>
        ) : null}{" "}
        {page < pagesCount ? (
          <Anchor
            icon="arrow-right"
            iconPosition="last"
            href={`/elu-es/pages/${page + 1}`}
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
  baseEntries: WritterStats[]
): BaseListingPageMetadata<Writter> => {
  const title = `Les élu·es`;
  const description =
    "Retrouvez toustes les élu·es du Douaisis cité·es sur ce site et les statistiques relatives à leurs tribunes.";
  const entries = baseEntries
    .map<Writter>((stats) => {
      return {
        id: toASCIIString(stats.name),
        date: stats.writtings[stats.writtings.length - 1].date,
        title: `${stats.name}`,
        description: `Fiche de l'élu·e ${stats.name}`,
        stats,
        illustration: {
          url: `images/portraits/${stats.portrait}`,
          alt: `Portrait de ${stats.name}`,
        },
      };
    })
    .sort(titledPagesSorter);

  return {
    title,
    description,
    entries,
    pagesCount: Math.ceil(entries.length / POSTS_PER_PAGE),
  };
};

export const getStaticProps: GetStaticProps<Props, { page: string }> = async ({
  params,
}) => {
  const castedParams = readParams(PARAMS_DEFINITIONS, params || {}) as Params;
  const page = castedParams?.page || 1;
  const baseProps = entriesToBaseListingMetadata(
    await readWrittersEntries(pathJoin(".", "contents", "writters"))
  );
  const title = `${baseProps.title}${
    page && page !== 1 ? ` - page ${page}` : ""
  }`;
  const entries = baseProps.entries.slice(
    (page - 1) * POSTS_PER_PAGE,
    (page - 1) * POSTS_PER_PAGE + POSTS_PER_PAGE
  );

  return {
    props: {
      ...baseProps,
      title,
      entries,
      page,
    } as Props,
  };
};

export default Entries;
