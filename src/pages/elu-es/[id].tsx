import { DOMAIN_NAME } from "../../utils/constants";
import { pathJoin } from "../../utils/files";
import { fixText } from "../../utils/text";
import { readWrittersEntries } from "../../utils/writters";
import { entriesToBaseListingMetadata } from ".";
import { Fragment } from "react";
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
import Heading3 from "../../components/h3";

const INSTANCES = {
  "cm-douai": "Conseil Municipal de la Ville de Douai",
};

type Params = { id: string };
type Props = {
  entry: Writter;
};

const Entry = ({ entry }: Props) => {
  return (
    <Layout
      title={`${fixText(entry.title)}`}
      description={fixText(entry.description)}
      image={`/images/banners/${entry.id}.png`}
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
              <Fragment key={group.id}>
                {index ? ", " : ""}
                <Anchor href={`/groupes/${group.id}`}>
                  {group.name} ({group.party})
                </Anchor>
              </Fragment>
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
        {entry.presences ? (
          <>
            <Heading2>Feuille de présence</Heading2>
            {Object.keys(entry.presences).map((instance) => (
              <Fragment key={instance}>
                <Heading3>{INSTANCES[instance]}</Heading3>
                <UnorderedList>
                  {entry.presences[instance].map((presence) => (
                    <ListItem>
                      <Strong>
                        {new Intl.DateTimeFormat("fr-FR", {
                          year: "numeric",
                          month: "long",
                        }).format(new Date(presence.date))}
                         :
                      </Strong>{" "}
                      {presence.present ? "✅ présent·e" : "❌ absent·e"}
                      {presence.arrivedLate || presence.leftBeforeTheEnd
                        ? ` (${presence.arrivedLate ? "en retard" : ""}${
                            presence.arrivedLate && presence.leftBeforeTheEnd
                              ? " et "
                              : ""
                          }${
                            presence.leftBeforeTheEnd ? "parti·e plus tôt" : ""
                          })`
                        : ""}
                      {presence.delegation ? (
                        <>
                          , a donné son pouvoir à{" "}
                          <Anchor href={`/elu-es/${presence.delegation.id}`}>
                            {presence.delegation.name}
                          </Anchor>
                        </>
                      ) : null}
                    </ListItem>
                  ))}
                </UnorderedList>
              </Fragment>
            ))}
          </>
        ) : null}
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
