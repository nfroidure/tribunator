import Heading2 from "./h2";
import UnorderedList from "./ul";
import ListItem from "./li";
import type { StatsData } from "../utils/writters";
import Strong from "./strong";

const Stats = ({ stats }: { stats: StatsData }) => (
  <>
    <Heading2>Statistiques</Heading2>
    <UnorderedList>
      <ListItem>
        <Strong>Nombre de tribunes :</Strong> {stats.writtings.length}
      </ListItem>
      <ListItem>
        <Strong>Nombre de phrases par tribune :</Strong>{" "}
        {(
          stats.summary.sentences.mean.count /
          stats.summary.sentences.mean.total
        ).toPrecision(2)}{" "}
        (minimum: {stats.summary.sentences.min.value.toPrecision(2)},
        maximun: {stats.summary.sentences.max.value.toPrecision(2)})
      </ListItem>
      <ListItem>
        <Strong>Sentiments détectés :</Strong>
        <br />
        En moyenne,{" "}
        {(
          stats.summary.sentiments.positive.mean.count /
          stats.summary.sentiments.positive.mean.total
        ).toFixed(2)}{" "}
        phrases positives,{" "}
        {(
          stats.summary.sentiments.neutral.mean.count /
          stats.summary.sentiments.neutral.mean.total
        ).toFixed(2)}{" "}
        phrases neutres,{" "}
        {(
          stats.summary.sentiments.negative.mean.count /
          stats.summary.sentiments.negative.mean.total
        ).toFixed(2)}{" "}
        phrases négatives.
      </ListItem>
      <ListItem>
        <Strong>Questions :</Strong>{" "}
        {(
          stats.summary.questions.mean.count /
          stats.summary.questions.mean.total
        ).toPrecision(2)}{" "}
        fois par tribune
      </ListItem>
      <ListItem>
        <Strong>Exclamations :</Strong>{" "}
        {(
          stats.summary.exclamations.mean.count /
          stats.summary.exclamations.mean.total
        ).toPrecision(2)}{" "}
        fois par tribune
      </ListItem>
      <ListItem>
        <Strong>Utilisations du gras :</Strong>{" "}
        {(
          stats.summary.bolds.mean.count /
          stats.summary.bolds.mean.total
        ).toPrecision(2)}{" "}
        fois par tribune
      </ListItem>
      <ListItem>
        <Strong>Utilisations des majuscules :</Strong>{" "}
        {(
          stats.summary.caps.mean.count /
          stats.summary.caps.mean.total
        ).toPrecision(2)}{" "}
        fois par tribune
      </ListItem>
    </UnorderedList>
  </>
);

export default Stats;
