import { pathJoin } from "../../utils/files";
import { DOMAIN_NAME } from "../../utils/constants";
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
        <Heading2>Statistiques</Heading2>
        <UnorderedList>
          <ListItem>
            <Strong>Nombre de tribunes :</Strong> {entry.stats.writtings.length}
          </ListItem>
          <ListItem>
            <Strong>Nombre de phrases par tribune :</Strong>{" "}
            {(
              entry.stats.summary.sentences.mean.count /
              entry.stats.summary.sentences.mean.total
            ).toPrecision(2)}{" "}
            (minimum: {entry.stats.summary.sentences.min.value.toPrecision(2)},
            maximun: {entry.stats.summary.sentences.max.value.toPrecision(2)})
          </ListItem>
          <ListItem>
            <Strong>Sentiments détectés :</Strong>
            <br />
            En moyenne,{" "}
            {(
              entry.stats.summary.sentiments.positive.mean.count /
              entry.stats.summary.sentiments.positive.mean.total
            ).toFixed(2)}{" "}
            phrases positives,{" "}
            {(
              entry.stats.summary.sentiments.neutral.mean.count /
              entry.stats.summary.sentiments.neutral.mean.total
            ).toFixed(2)}{" "}
            phrases neutres,{" "}
            {(
              entry.stats.summary.sentiments.negative.mean.count /
              entry.stats.summary.sentiments.negative.mean.total
            ).toFixed(2)}{" "}
            phrases négatives.
          </ListItem>
          <ListItem>
            <Strong>Questions :</Strong>{" "}
            {(
              entry.stats.summary.questions.mean.count /
              entry.stats.summary.questions.mean.total
            ).toPrecision(2)}{" "}
            fois par tribune
          </ListItem>
          <ListItem>
            <Strong>Exclamations :</Strong>{" "}
            {(
              entry.stats.summary.exclamations.mean.count /
              entry.stats.summary.exclamations.mean.total
            ).toPrecision(2)}{" "}
            fois par tribune
          </ListItem>
          <ListItem>
            <Strong>Utilisations du gras :</Strong>{" "}
            {(
              entry.stats.summary.bolds.mean.count /
              entry.stats.summary.bolds.mean.total
            ).toPrecision(2)}{" "}
            fois par tribune
          </ListItem>
          <ListItem>
            <Strong>Utilisations des majuscules :</Strong>{" "}
            {(
              entry.stats.summary.caps.mean.count /
              entry.stats.summary.caps.mean.total
            ).toPrecision(2)}{" "}
            fois par tribune
          </ListItem>
        </UnorderedList>
        <Heading2>Tops tribunes</Heading2>
        <UnorderedList>
          {entry.stats.summary.sentiments.negative.max.value ? (
            <ListItem>
              <Anchor
                href={`/tribunes/${entry.stats.summary.sentiments.negative.max.ids[0]}`}
              >
                Tribune la plus négative (
                {entry.stats.summary.sentiments.negative.max.value} phrases
                négatives).
              </Anchor>
            </ListItem>
          ) : null}
          {entry.stats.summary.sentiments.positive.max.value ? (
            <ListItem>
              <Anchor
                href={`/tribunes/${entry.stats.summary.sentiments.positive.max.ids[0]}`}
              >
                Tribune la plus positive (
                {entry.stats.summary.sentiments.positive.max.value} phrases
                positives).
              </Anchor>
            </ListItem>
          ) : null}
          {entry.stats.summary.exclamations.max.value ? (
            <ListItem>
              <Anchor
                href={`/tribunes/${entry.stats.summary.exclamations.max.ids[0]}`}
              >
                Tribune la plus affirmative (
                {entry.stats.summary.exclamations.max.value} phrases
                affirmatives).
              </Anchor>
            </ListItem>
          ) : null}
          {entry.stats.summary.questions.max.value ? (
            <ListItem>
              <Anchor
                href={`/tribunes/${entry.stats.summary.questions.max.ids[0]}`}
              >
                Tribune la plus interrogative (
                {entry.stats.summary.questions.max.value} phrases
                interrogative).
              </Anchor>
            </ListItem>
          ) : null}
          {entry.stats.summary.bolds.max.value ? (
            <ListItem>
              <Anchor
                href={`/tribunes/${entry.stats.summary.bolds.max.ids[0]}`}
              >
                Tribune la plus grasse ({entry.stats.summary.bolds.max.value}{" "}
                utilisations du gras).
              </Anchor>
            </ListItem>
          ) : null}
          {entry.stats.summary.caps.max.value ? (
            <ListItem>
              <Anchor href={`/tribunes/${entry.stats.summary.caps.max.ids[0]}`}>
                Tribune la plus criarde ({entry.stats.summary.caps.max.value} mots en
                MAJUSCULES).
              </Anchor>
            </ListItem>
          ) : null}
        </UnorderedList>
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
