import { DOMAIN_NAME } from "../../utils/constants";
import { pathJoin } from "../../utils/files";
import { fixText } from "../../utils/text";
import { readWrittersEntries } from "../../utils/writters";
import { entriesToBaseListingMetadata } from ".";
import Layout from "../../layouts/main";
import ContentBlock from "../../components/contentBlock";
import Heading1 from "../../components/h1";
import Heading2 from "../../components/h2";
import Paragraph from "../../components/p";
import Share from "../../components/share";
import Img from "../../components/img";
import UnorderedList from "../../components/ul";
import ListItem from "../../components/li";
import Strong from "../../components/strong";
import Anchor from "../../components/a";
import Top from "../../components/top";
import Stats from "../../components/stats";
import type { GetStaticProps, GetStaticPaths } from "next";
import type { Writter } from "../../utils/writters";

type Params = { id: string };
type Props = {
  entry: Writter;
};

const Entry = ({ entry }: Props) => {
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
        <Heading2>Informations</Heading2>
        <UnorderedList>
          <ListItem>
            <Strong>Groupe politique :</Strong>{" "}
            {entry.stats.groups.map((group, index) => (
              <>
                {index ? ", " : ""}
                <Anchor href={`/groupes/${entry.stats.groupsIds[index]}`}>
                  {group}
                </Anchor>
              </>
            ))}
          </ListItem>
          <ListItem>
            <Strong>Mandats :</Strong> {entry.stats.mandates.join(", ")}
          </ListItem>
        </UnorderedList>
        <Heading2>Mots-Clés</Heading2>
        <UnorderedList>
          {entry.stats.words.slice(0, 10).map(({ word, count }) => (
            <ListItem key={word}>
              {word} ({count})
            </ListItem>
          ))}
        </UnorderedList>
        <Stats stats={entry.stats} />
        <Top summary={entry.stats.summary} />
        <Heading2>Liste des tribunes</Heading2>
        <UnorderedList>
          {entry.stats.writtings.map(({ id, date }) => (
            <ListItem key={id}>
              <Anchor href={`/tribunes/${id}`}>
                {new Intl.DateTimeFormat("fr-FR", {
                  year: "numeric",
                  month: "long",
                }).format(new Date(date))}
              </Anchor>
            </ListItem>
          ))}
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
    await readWrittersEntries(pathJoin(".", "contents", "writters"))
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
    await readWrittersEntries(pathJoin(".", "contents", "writters"))
  );
  const entry = baseProps.entries.find(({ id }) => id === (params || {}).id);

  return {
    props: {
      entry,
    },
  };
};
