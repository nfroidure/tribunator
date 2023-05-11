import { DOMAIN_NAME } from "../../utils/constants";
import { pathJoin } from "../../utils/files";
import { fixText } from "../../utils/text";
import { readGroupsEntries } from "../../utils/groups";
import { entriesToBaseListingMetadata } from ".";
import { toASCIIString } from "../../utils/ascii";
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
import type { Group } from "../../utils/groups";

type Params = { id: string };
type Props = {
  entry: Group;
};

const Entry = ({ entry }: Props) => {
  return (
    <Layout
      title={`${fixText(entry.title)}`}
      description={fixText(entry.description)}
    >
      <ContentBlock>
        <Heading1>
          {entry.stats.name} ({entry.stats.partyAbbr})
        </Heading1>
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
            <Strong>Membres :</Strong>{" "}
            {entry.stats.authors.map((author, index) => (
              <>
                {index ? ", " : ""}
                <Anchor href={`/elu-es/${toASCIIString(author)}`}>
                  {author}
                </Anchor>
              </>
            ))}
          </ListItem>
          <ListItem>
            <Strong>Type :</Strong> {entry.stats.type}
          </ListItem>
          <ListItem>
            <Strong>Parti :</Strong> {entry.stats.party}
          </ListItem>
        </UnorderedList>
        <Heading2>Mots-Clés</Heading2>
        <UnorderedList>
          {entry.stats.words.slice(0, 10).map(({ word, count }) => (
            <ListItem key="work">
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
    await readGroupsEntries(pathJoin(".", "contents", "groups"))
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
    await readGroupsEntries(pathJoin(".", "contents", "groups"))
  );
  const entry = baseProps.entries.find(({ id }) => id === (params || {}).id);

  return {
    props: {
      entry,
    },
  };
};
