import { pathJoin } from "../../utils/files";
import { readEntries } from "../../utils/frontmatter";
import {
  authorToWritterFilename,
  readWritterEntry,
} from "../../utils/writters";
import { DOMAIN_NAME, PUBLICATIONS } from "../../utils/constants";
import { fixText } from "../../utils/text";
import { renderMarkdown } from "../../utils/markdown";
import { entriesToBaseListingMetadata } from ".";
import { toASCIIString } from "../../utils/ascii";
import UnorderedList from "../../components/ul";
import ListItem from "../../components/li";
import Strong from "../../components/strong";
import Layout from "../../layouts/main";
import ContentBlock from "../../components/contentBlock";
import Heading1 from "../../components/h1";
import Heading2 from "../../components/h2";
import Paragraph from "../../components/p";
import Share from "../../components/share";
import Img from "../../components/img";
import Anchor from "../../components/a";
import type { Tribune, TribuneFrontmatterMetadata } from "../../utils/tribunes";
import type { GetStaticProps, GetStaticPaths } from "next";

type Stats = {
  sentences: number;
  sentiments: {
    positive: number;
    neutral: number;
    negative: number;
  };
  exclamations: number;
  questions: number;
  bolds: number;
  caps: number;
};
type Params = { id: string };
type Props = {
  entry: Tribune;
  stats: Stats;
};

const Entry = ({ entry, stats }: Props) => {
  return (
    <Layout
      title={`${fixText(entry.title)}`}
      description={fixText(entry.description)}
    >
      <ContentBlock>
        <Heading1>{entry.title}</Heading1>
        <Paragraph>
          <Strong>{entry.description}</Strong>
        </Paragraph>
        {entry.illustration ? (
          <p className="entry_illustration">
            <Img
              float="left"
              orientation="landscape"
              src={"/" + entry.illustration.url}
              alt={entry.illustration.alt}
            />
          </p>
        ) : null}
        <Heading2>Contenu</Heading2>
        {renderMarkdown({ index: 0 }, entry.content)}
        <Heading2>Détails</Heading2>
        <UnorderedList>
          <ListItem>
            <Strong>Auteur·e :</Strong>{' '}
            <Anchor href={`/elu-es/${toASCIIString(entry.author)}`}>
              {entry.author}
            </Anchor>
          </ListItem>
          <ListItem>
            <Strong>Groupe politique :</Strong>{' '}
            <Anchor href={`/groupes/${toASCIIString(entry.groupId)}`}>
              {entry.group}
            </Anchor>
          </ListItem>
          <ListItem>
            <Strong>Source :</Strong> {PUBLICATIONS[entry.publication]} (page{" "}
            {entry.source.replace(/^.*p([0-9]+).*$/, "$1")})
          </ListItem>
        </UnorderedList>
        <Heading2>Statistiques</Heading2>
        <UnorderedList>
          <ListItem>
            <Strong>Nombre de phrases :</Strong> {stats.sentences}
          </ListItem>
          <ListItem>
            <Strong>Sentiments détectés :</Strong>
            <br />
            {stats.sentiments.positive} phrase
            {stats.sentiments.positive > 1 ? "s" : ""} positive
            {stats.sentiments.positive > 1 ? "s" : ""},
            <br />
            {stats.sentiments.neutral} phrase
            {stats.sentiments.neutral > 1 ? "s" : ""} neutre
            {stats.sentiments.neutral > 1 ? "s" : ""},
            <br />
            {stats.sentiments.negative} phrase
            {stats.sentiments.negative > 1 ? "s" : ""} négative
            {stats.sentiments.negative > 1 ? "s" : ""}.
          </ListItem>
          <ListItem>
            <Strong>Questions :</Strong> {stats.questions}
          </ListItem>
          <ListItem>
            <Strong>Exclamations :</Strong> {stats.exclamations}
          </ListItem>
          <ListItem>
            <Strong>Utilisations du gras :</Strong> {stats.bolds}
          </ListItem>
          <ListItem>
            <Strong>Utilisations des majuscules :</Strong> {stats.caps}
          </ListItem>
        </UnorderedList>
        <aside>
          <Heading2>Commenter et partager</Heading2>
          <Share
            url={`https://${DOMAIN_NAME}/tribunes/${entry.id}`}
            title={entry.title}
          />
        </aside>
      </ContentBlock>
      <style>{`
      :global(.entry_illustration) {
        margin: 0 !important;
      }
      @media print {
        aside {
          display: none;
        }
      }
      `}</style>
    </Layout>
  );
};

export default Entry;

export const getStaticPaths: GetStaticPaths = async () => {
  const baseProps = entriesToBaseListingMetadata(
    await readEntries<TribuneFrontmatterMetadata>(
      pathJoin(".", "contents", "tribunes")
    )
  );

  const paths = baseProps.entries.map((entry) => ({
    params: { id: entry.id },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  const baseProps = entriesToBaseListingMetadata(
    await readEntries<TribuneFrontmatterMetadata>(pathJoin(".", "contents", "tribunes"))
  );
  const entry = baseProps.entries.find(
    ({ id }) => id === (params || {}).id
  );
  const writterStats = await readWritterEntry(
    authorToWritterFilename(entry.author)
  );
  const stats = {
    sentences: writterStats.sentences.find(({ date }) => date === entry.date)
      .count,
    sentiments: {
      positive: writterStats.sentiments.find(({ date }) => date === entry.date)
        .positive,
      neutral: writterStats.sentiments.find(({ date }) => date === entry.date)
        .neutral,
      negative: writterStats.sentiments.find(({ date }) => date === entry.date)
        .negative,
    },
    exclamations: writterStats.exclamations.find(
      ({ date }) => date === entry.date
    ).count,
    questions: writterStats.questions.find(({ date }) => date === entry.date)
      .count,
    bolds: writterStats.bolds.find(({ date }) => date === entry.date).count,
    caps: writterStats.caps.find(({ date }) => date === entry.date).count,
  };

  return {
    props: {
      entry,
      stats,
    },
  };
};
