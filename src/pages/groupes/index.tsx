import { pathJoin } from "../../utils/files";
import { readParams } from "../../utils/params";
import { titledPagesSorter } from "../../utils/contents";
import { readGroupsEntries, readGroupStats } from "../../utils/groups";
import Layout from "../../layouts/main";
import ContentBlock from "../../components/contentBlock";
import Heading1 from "../../components/h1";
import Paragraph from "../../components/p";
import Anchor from "../../components/a";
import Head from "next/head";
import Groups from "../../components/groups";
import type { Group, GroupStats } from "../../utils/groups";
import type {
  BaseListingPageMetadata,
  BasePagingPageMetadata,
} from "../../utils/contents";
import type { GetStaticProps } from "next";
import type { BuildQueryParamsType } from "../../utils/params";
import type { StatsData } from "../../utils/writters";

export type Props = BasePagingPageMetadata<Group> & {
  groupsStats: StatsData;
};

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
        href="/groupes.atom"
      />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${title} (RSS)`}
        href="/groupes.rss"
      />
    </Head>
    <ContentBlock className="title">
      <Heading1 className="title">Les élu·es</Heading1>
      <Paragraph>
        Retrouvez toustes les élu·es cité·es sur ce site et les statistiques qui
        les concernent.
      </Paragraph>

      <Groups entries={entries} base={"/groupes/"} />

      <nav className="pagination">
        {page > 1 ? (
          <Anchor
            icon="arrow-left"
            href={page > 2 ? `/groupes/pages/${page - 1}` : "/groupes"}
            rel="previous"
          >
            Précédent
          </Anchor>
        ) : null}{" "}
        {page < pagesCount ? (
          <Anchor
            icon="arrow-right"
            iconPosition="last"
            href={`/groupes/pages/${page + 1}`}
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
  baseEntries: GroupStats[]
): BaseListingPageMetadata<Group> => {
  const title = `Les groupes politiques`;
  const description =
    "Retrouvez tous les groupes politiques du Douaisis cités sur ce site et les statistiques relatives à leurs tribunes.";
  const entries = baseEntries
    .map<Group>((stats) => {
      return {
        id: stats.id,
        date: stats.writtings[stats.writtings.length - 1].date,
        title: `${stats.name} (${stats.partyAbbr})`,
        description: `Fiche du groupe ${stats.name} - ${stats.party}.`,
        stats,
        illustration: {
          url: `images/groups/${stats.logo}`,
          alt: `Logo de ${stats.name}`,
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
  const groupsStats = await readGroupStats();
  const castedParams = readParams(PARAMS_DEFINITIONS, params || {}) as Params;
  const page = castedParams?.page || 1;
  const baseProps = entriesToBaseListingMetadata(
    await readGroupsEntries(pathJoin(".", "contents", "groups"))
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
      groupsStats,
    } as Props,
  };
};

export default Entries;
