import Heading2 from "./h2";
import UnorderedList from "./ul";
import ListItem from "./li";
import Anchor from "./a";
import type { StatsSummary } from "../utils/writters";

const Top = ({ summary }: { summary: StatsSummary }) => (
  <>
    <Heading2>Top des tribunes</Heading2>
    <UnorderedList>
      {summary.sentiments.negative.max.value ? (
        <ListItem>
          <Anchor href={`/tribunes/${summary.sentiments.negative.max.ids[0]}`}>
            Tribune la plus négative ({summary.sentiments.negative.max.value}{" "}
            phrases négatives).
          </Anchor>
        </ListItem>
      ) : null}
      {summary.sentiments.positive.max.value ? (
        <ListItem>
          <Anchor href={`/tribunes/${summary.sentiments.positive.max.ids[0]}`}>
            Tribune la plus positive ({summary.sentiments.positive.max.value}{" "}
            phrases positives).
          </Anchor>
        </ListItem>
      ) : null}
      {summary.exclamations.max.value ? (
        <ListItem>
          <Anchor href={`/tribunes/${summary.exclamations.max.ids[0]}`}>
            Tribune la plus affirmative ({summary.exclamations.max.value}{" "}
            phrases affirmatives).
          </Anchor>
        </ListItem>
      ) : null}
      {summary.questions.max.value ? (
        <ListItem>
          <Anchor href={`/tribunes/${summary.questions.max.ids[0]}`}>
            Tribune la plus interrogative ({summary.questions.max.value} phrases
            interrogative).
          </Anchor>
        </ListItem>
      ) : null}
      {summary.bolds.max.value ? (
        <ListItem>
          <Anchor href={`/tribunes/${summary.bolds.max.ids[0]}`}>
            Tribune la plus grasse ({summary.bolds.max.value} utilisations du
            gras).
          </Anchor>
        </ListItem>
      ) : null}
      {summary.caps.max.value ? (
        <ListItem>
          <Anchor href={`/tribunes/${summary.caps.max.ids[0]}`}>
            Tribune la plus criarde ({summary.caps.max.value} mots en
            MAJUSCULES).
          </Anchor>
        </ListItem>
      ) : null}
    </UnorderedList>
  </>
);

export default Top;
