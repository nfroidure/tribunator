import Layout from "../layouts/main";
import ContentBlock from "../components/contentBlock";
import { fixText } from "../utils/text";
import { renderMarkdown } from "../utils/markdown";
import Heading1 from "../components/h1";
import Heading2 from "../components/h2";
import Heading3 from "../components/h3";
import Paragraph from "../components/p";
import { readGlobalStats } from "../utils/globalStats";
import Strong from "../components/strong";
import UnorderedList from "../components/ul";
import ListItem from "../components/li";
import Anchor from "../components/a";
import { CSS_BREAKPOINT_START_M } from "../utils/constants";
import {
  getStaticProps as baseGetStaticProps,
  type Props as BaseProps,
} from "./[...slug]";
import type { GetStaticProps } from "next";
import type { StatsSummary } from "../utils/writters";

type Props = BaseProps & {
  globalStats: StatsSummary;
};

const Page = ({ entry, globalStats }: Props) => (
  <Layout
    title={`${fixText(entry.title)}`}
    description={fixText(entry.description)}
    image={entry.illustration?.href}
  >
    <ContentBlock>
      <Heading1>{entry.title}</Heading1>
      <Paragraph>
        <Strong>{entry.description}</Strong>
      </Paragraph>

      <Heading2>🏆 Les bons élèves</Heading2>
      <div className="top">
        <div className="column">
          <Heading3>✅ Assiduité</Heading3>
          <UnorderedList>
            {(globalStats.presences["cm-douai"] || [])
              .sort((presenceA, presenceB) => {
                const ratioA = presenceA.present / presenceA.total;
                const ratioB = presenceB.present / presenceB.total;

                return ratioA > ratioB ? -1 : ratioA < ratioB ? 1 : 0;
              })
              .slice(0, 10)
              .map((presence) => (
                <ListItem>
                  <Anchor
                    href={`/elu-es/${globalStats.authors[presence.id].id}`}
                  >
                    {globalStats.authors[presence.id].name}
                  </Anchor>
                   : {((presence.present / presence.total) * 100).toFixed(2)}%
                </ListItem>
              ))}
          </UnorderedList>
        </div>
        <div className="column">
          <Heading3>✍️ Variété de vocabulaire</Heading3>
          <UnorderedList>
            {Object.keys(globalStats.authors)
              .sort((authorIdA, authorIdB) => {
                const ratioA =
                  globalStats.authors[authorIdA].totalSignificantWords /
                  globalStats.authors[authorIdA].totalWords;
                const ratioB =
                  globalStats.authors[authorIdB].totalSignificantWords /
                  globalStats.authors[authorIdB].totalWords;

                return ratioA > ratioB ? -1 : ratioA < ratioB ? 1 : 0;
              })
              .slice(0, 10)
              .map((authorId) => (
                <ListItem>
                  <Anchor href={`/elu-es/${globalStats.authors[authorId].id}`}>
                    {globalStats.authors[authorId].name}
                  </Anchor>
                   :{" "}
                  {(
                    globalStats.authors[authorId].totalSignificantWords /
                    globalStats.authors[authorId].totalWords
                  ).toFixed(2)}
                </ListItem>
              ))}
          </UnorderedList>
        </div>
      </div>
      <Heading2>🤔 Les mauvais élèves</Heading2>
      <div className="top">
        <div className="column">
          <Heading3>🤷 Absentéisme</Heading3>
          <UnorderedList>
            {(globalStats.presences["cm-douai"] || [])
              .sort((presenceA, presenceB) => {
                const absenceA = presenceA.total - presenceA.present;
                const absenceB = presenceB.total - presenceB.present;

                return absenceA > absenceB ? -1 : absenceA < absenceB ? 1 : 0;
              })
              .slice(0, 10)
              .map((presence) => (
                <ListItem>
                  <Anchor
                    href={`/elu-es/${globalStats.authors[presence.id].id}`}
                  >
                    {globalStats.authors[presence.id].name}
                  </Anchor>
                   : {((presence.present / presence.total) * 100).toFixed(2)}%
                </ListItem>
              ))}
          </UnorderedList>
        </div>
        <div className="column">
          <Heading3>🤦‍♂ Absences sans pouvoir</Heading3>
          <UnorderedList>
            {(globalStats.presences["cm-douai"] || [])
              .sort((presenceA, presenceB) => {
                const absenceA =
                  presenceA.total - presenceA.present - presenceA.delegation;
                const absenceB =
                  presenceB.total - presenceB.present - presenceB.delegation;

                return absenceA > absenceB ? -1 : absenceA < absenceB ? 1 : 0;
              })
              .slice(0, 10)
              .map((presence) => (
                <ListItem>
                  <Anchor
                    href={`/elu-es/${globalStats.authors[presence.id].id}`}
                  >
                    {globalStats.authors[presence.id].name}
                  </Anchor>
                   : {presence.total - presence.present - presence.delegation}
                </ListItem>
              ))}
          </UnorderedList>
        </div>
      </div>
      {renderMarkdown({ index: 0 }, entry.content)}
      <div className="clear"></div>
    </ContentBlock>
    <style jsx>{`
      .clear {
        clear: both;
      }

      @media screen and (min-width: ${CSS_BREAKPOINT_START_M}) {
        .top {
          display: flex;
        }
        .top .column {
          flex: 1;
        }
      }
    `}</style>
  </Layout>
);

export default Page;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const baseProps = await baseGetStaticProps({ params: { slug: [] } });
  const globalStats = await readGlobalStats();

  return {
    props: {
      ...("props" in baseProps ? baseProps.props : {}),
      globalStats,
    } as Props,
  };
};
