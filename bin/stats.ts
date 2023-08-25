import {
  createBaseStatsItem,
  shrinkStats,
  sortByName,
  aggregatesStats,
  computeStats,
} from "../src/utils/stats";
import { parse } from "yaml";
import { readFile, writeFile, readDir } from "../src/utils/files";
import { join as pathJoin } from "path";
import axios from "axios";
import { exec as _exec } from "node:child_process";
import nodeLefff from "node-lefff";
import { toASCIIString } from "../src/utils/ascii";
import type {
  SentimentOccurenceItem,
  StatsSummary,
} from "../src/utils/writters";
import type {
  BaseGroup,
  TribuneFrontmatterMetadata,
} from "../src/utils/tribunes";

run();

async function run() {
  const globalStats = await createBaseStatsObject();
  const nl = await nodeLefff.load();
  const files = await readDir(pathJoin("contents", "tribunes"));
  const writtersAggregations = {};
  const groupsAggregations = {};

  for (const file of files) {
    console.warn(`➕ - Processing ${file}.`);

    const content = await readFile(pathJoin("contents", "tribunes", file));
    const parts = content
      .split(/\-\-\-/)
      .map((s) => s.trim())
      .filter((id) => id);
    const metadata = parse(parts[0]) as TribuneFrontmatterMetadata;
    const markdown = parts[1];
    const response = await axios({
      method: "post",
      url: `http://localhost:9000`,
      params: {
        properties:
          '{"annotators":"tokenize,ssplit,mwt,pos,lemma,ner,parse,sentiment","outputFormat":"json"}',
      },
      data: markdown,
    });

    const sentiments = response.data.sentences.map(
      ({ sentiment }) => sentiment
    );
    const words = response.data.sentences.reduce(
      (words, sentence) =>
        words.concat(
          sentence.tokens
            .filter(({ pos }) => ["NOUN", "ADJ", "VERB"].includes(pos))
            .map(({ lemma, characterOffsetBegin, characterOffsetEnd }) => ({
              word: lemma,
              offset: [characterOffsetBegin, characterOffsetEnd],
            }))
        ),
      []
    );

    const { id, date, group, authors } = metadata;
    const groupAggregation = groupsAggregations[group.id] || {
      id: group.id,
      name: group.name,
      party: group.party,
      partyAbbr: group.abbr,
      type: group.type,
      logo: group.logo,
      totalWords: 0,
      writtings: [],
      sentences: [],
      sentiments: [],
      exclamations: [],
      questions: [],
      bolds: [],
      caps: [],
      words: [],
      authors,
      locality: "Douai",
      country: "France",
    };

    groupsAggregations[group.id] = groupAggregation;
    groupAggregation.authors = [
      ...groupAggregation.authors,
      ...authors.filter(
        ({ name }) =>
          !groupAggregation.authors.some(
            ({ name: otherName }) => name === otherName
          )
      ),
    ].sort(sortByName);

    const aggregationsList = [
      groupAggregation,
      ...authors.map(({ name, mandates, portrait }) => {
        const writerAggregation = writtersAggregations[toASCIIString(name)] || {
          totalWords: 0,
          writtings: [],
          sentences: [],
          sentiments: [],
          exclamations: [],
          questions: [],
          bolds: [],
          caps: [],
          words: [],
          portrait,
          name,
          mandates,
          groups: [group],
          locality: "Douai",
          country: "France",
        };

        writtersAggregations[toASCIIString(name)] = writerAggregation;
        writerAggregation.groups = [
          ...writerAggregation.groups,
          ...(writerAggregation.groups.some(
            ({ name: otherName }) => name === otherName
          )
            ? []
            : []),
        ].sort(sortByName);

        writerAggregation.mandates = [
          ...Array.from(new Set(writerAggregation.mandates.concat(mandates))),
        ];

        return writerAggregation;
      }),
    ];

    aggregationsList.forEach((aggregation) => {
      aggregation.writtings.push({ date, id });
    });

    const exclamation = {
      id,
      date,
      count: response.data.sentences.reduce((count, sentence) => {
        return sentence.tokens.reduce((count, { lemma }) => {
          return count + (lemma === "!" ? 1 : 0);
        }, count);
      }, 0),
    };
    aggregationsList.forEach((aggregation) => {
      aggregation.exclamations.push(exclamation);
    });

    const question = {
      id,
      date,
      count: response.data.sentences.reduce((count, sentence) => {
        return sentence.tokens.reduce((count, { lemma }) => {
          return count + (lemma === "?" ? 1 : 0);
        }, count);
      }, 0),
    };
    aggregationsList.forEach((aggregation) => {
      aggregation.questions.push(question);
    });

    const bold = {
      id,
      date,
      // Very approximative count, could parse MD contents and
      // use the AST
      count:
        Math.floor([...Array.from(content.matchAll(/\*\*/gm))]?.length / 2) ||
        0,
    };
    aggregationsList.forEach((aggregation) => {
      aggregation.bolds.push(bold);
    });

    const cap = {
      id,
      date,
      count: response.data.sentences.reduce((count, sentence) => {
        return sentence.tokens.reduce((count, { originalText }) => {
          return (
            count +
            (originalText.match(/[a-zA-Z]{5,}/) &&
            originalText.toUpperCase() === originalText
              ? 1
              : 0)
          );
        }, count);
      }, 0),
    };
    aggregationsList.forEach((aggregation) => {
      aggregation.caps.push(cap);
    });

    const sentence = { id, date, count: response.data.sentences.length };
    aggregationsList.forEach((aggregation) => {
      aggregation.sentences.push(sentence);
    });

    const sentiment = {
      id,
      date,
      positive: sentiments.filter((sentiment) => sentiment === "Positive")
        .length,
      neutral: sentiments.filter((sentiment) => sentiment === "Neutral").length,
      negative: sentiments.filter((sentiment) => sentiment === "Negative")
        .length,
    };
    aggregationsList.forEach((aggregation) => {
      aggregation.sentiments.push(sentiment);
    });

    words.forEach((word) => {
      const lemma = nl.lem(word.word);

      aggregationsList.forEach((aggregation) => {
        aggregation.words[lemma] = (aggregation.words[lemma] || 0) + 1;
        aggregation.totalWords += word.word.length > 3 ? 1 : 0;
      });
    });
  }

  for (const key of Object.keys(writtersAggregations)) {
    const summary = {
      sentences: computeStats(writtersAggregations[key].sentences),
      exclamations: computeStats(writtersAggregations[key].exclamations),
      questions: computeStats(writtersAggregations[key].questions),
      bolds: computeStats(writtersAggregations[key].bolds),
      caps: computeStats(writtersAggregations[key].caps),
      sentiments: computeSentimentStats(writtersAggregations[key].sentiments),
    };
    const allWords = Object.keys(writtersAggregations[key].words).filter(
      (word) => word.length > 3
    );

    globalStats.authors[key].totalWords = writtersAggregations[key].totalWords;
    globalStats.authors[key].totalSignificantWords = allWords.length;

    const finalAggregation = {
      ...writtersAggregations[key],
      summary: shrinkSummary(summary),
      words: allWords
        .sort((wordA, wordB) =>
          writtersAggregations[key].words[wordA] <
          writtersAggregations[key].words[wordB]
            ? 1
            : writtersAggregations[key].words[wordA] >
              writtersAggregations[key].words[wordB]
            ? -1
            : 0
        )
        .slice(0, 25)
        .map((word) => ({
          word,
          count: writtersAggregations[key].words[word],
        })),
    };

    await writeFile(
      pathJoin("contents", "writters", `${key}.json`),
      JSON.stringify(finalAggregation, null, 2)
    );
  }

  for (const key of Object.keys(groupsAggregations)) {
    const summary = {
      sentences: computeStats(groupsAggregations[key].sentences),
      exclamations: computeStats(groupsAggregations[key].exclamations),
      questions: computeStats(groupsAggregations[key].questions),
      bolds: computeStats(groupsAggregations[key].bolds),
      caps: computeStats(groupsAggregations[key].caps),
      sentiments: computeSentimentStats(groupsAggregations[key].sentiments),
    };

    aggregatesStats(summary.sentences, globalStats.sentences);
    aggregatesStats(summary.exclamations, globalStats.exclamations);
    aggregatesStats(summary.questions, globalStats.questions);
    aggregatesStats(summary.bolds, globalStats.bolds);
    aggregatesStats(summary.caps, globalStats.caps);
    aggregatesStats(
      summary.sentiments.positive,
      globalStats.sentiments.positive
    );
    aggregatesStats(
      summary.sentiments.negative,
      globalStats.sentiments.negative
    );
    aggregatesStats(summary.sentiments.neutral, globalStats.sentiments.neutral);

    const finalAggregation = {
      ...groupsAggregations[key],
      summary: shrinkSummary(summary),
      words: Object.keys(groupsAggregations[key].words)
        .filter((word) => word.length > 3)
        .sort((wordA, wordB) =>
          groupsAggregations[key].words[wordA] <
          groupsAggregations[key].words[wordB]
            ? 1
            : groupsAggregations[key].words[wordA] >
              groupsAggregations[key].words[wordB]
            ? -1
            : 0
        )
        .slice(0, 25)
        .map((word) => ({ word, count: groupsAggregations[key].words[word] })),
    };

    await writeFile(
      pathJoin("contents", "groups", `${key}.json`),
      JSON.stringify(finalAggregation, null, 2)
    );
  }

  await writeFile(
    pathJoin("contents", `globalStats.json`),
    JSON.stringify(shrinkSummary(globalStats), null, 2)
  );
}

async function createBaseStatsObject(): Promise<StatsSummary> {
  let globalStats;

  try {
    globalStats = JSON.parse(
      (await readFile(pathJoin("contents", `globalStats.json`))).toString()
    ) as StatsSummary;
  } catch (err) {
    console.error(`💥 - Cannot read the global stats object.`);
  }

  return {
    authors: {},
    ...globalStats,
    sentences: createBaseStatsItem(),
    exclamations: createBaseStatsItem(),
    questions: createBaseStatsItem(),
    bolds: createBaseStatsItem(),
    caps: createBaseStatsItem(),
    sentiments: {
      positive: createBaseStatsItem(),
      neutral: createBaseStatsItem(),
      negative: createBaseStatsItem(),
    },
  };
}

function computeSentimentStats(
  occurences: SentimentOccurenceItem[]
): StatsSummary["sentiments"] {
  return ["positive", "neutral", "negative"].reduce((stats, sentiment) => {
    const reshapedOccurences = occurences.map(({ id, date, ...occurence }) => ({
      id,
      date,
      count: occurence[sentiment],
    }));

    return {
      ...stats,
      [sentiment]: computeStats(reshapedOccurences),
    };
  }, {} as Partial<StatsSummary["sentiments"]>) as StatsSummary["sentiments"];
}

function shrinkSummary(
  summary: Omit<StatsSummary, "authors">
): Omit<StatsSummary, "authors"> {
  return {
    ...summary,
    sentences: shrinkStats(summary.sentences),
    exclamations: shrinkStats(summary.exclamations),
    questions: shrinkStats(summary.questions),
    bolds: shrinkStats(summary.bolds),
    caps: shrinkStats(summary.caps),
    sentiments: {
      positive: shrinkStats(summary.sentiments.positive),
      neutral: shrinkStats(summary.sentiments.neutral),
      negative: shrinkStats(summary.sentiments.negative),
    },
  };
}
