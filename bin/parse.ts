import { readFile, writeFile, readDir, access } from "../src/utils/files";
import { join as pathJoin } from "path";
import axios from "axios";
import { tmpdir } from "node:os";
import { exec as _exec } from "node:child_process";
import { promisify } from "node:util";
import nodeLefff from "node-lefff";
import { toASCIIString } from "../src/utils/ascii";
import type {
  SentimentOccurenceItem,
  StatsSummary,
} from "../src/utils/writters";
import type { Author, BaseGroup } from "../src/utils/tribunes";
import {
  createBaseStatsItem,
  shrinkStats,
  sortByName,
  aggregatesStats,
  computeStats,
} from "../src/utils/stats";

const exec = promisify(_exec);

run();

async function run() {
  const nl = await nodeLefff.load();

  const files = await readDir(pathJoin("sources", "tribunes"));
  const writtersAggregations = {};
  const groupsAggregations = {};
  const globalStats = createBaseStatsObject();

  for (const file of files) {
    const content = await readFile(pathJoin("sources", "tribunes", file));

    console.warn(`➕ - Processing ${file}.`);

    const publication = file.split("-").slice(2).join("-").replace(/\.md$/, "");
    const occurence = file.split("-").slice(0, 2).join("-");
    const parts = content.split(/[\-]{3,}/gm);
    const sources = parts[0]
      .split(/(\r?\n)+/gm)
      .filter((line) => line.startsWith("https://"));
    const tempDir = tmpdir();
    const sourcesCaptures = await sources.reduce(
      async (sourcesCaptures, source) => {
        const captures = await sourcesCaptures;
        const filename = `${publication}-${occurence}-p${source.replace(
          /^.*p([0-9]+).svgz/,
          "$1"
        )}.png`;
        const captureDestination = pathJoin(
          "public",
          "images",
          "sources",
          filename
        );
        const tempFile = pathJoin(tempDir, filename);

        // await new Promise((resolve) => setTimeout(resolve, 500));
        // await exec(
        //   `google-chrome  --headless --screenshot=${tempFile} ${source}`
        // );
        // await new Promise((resolve) => setTimeout(resolve, 500));
        // await exec(`convert ${tempFile} -trim ${captureDestination}`);
        return [...captures, captureDestination];
      },
      Promise.resolve([] as string[])
    );

    if (!sources.length) {
      console.error(`🤔 - No sources for ${file} !`);
      continue;
    }

    const tribunes = parts.slice(1);

    for (const tribune of tribunes) {
      const parts = tribune.trim().split(/\n[\n]+/gm);
      const authorPart = (parts.pop() as string).trim();
      const mayorCase = !!authorPart.match(/^\s*votre maire/i);
      const authorParts = authorPart.split(/\n/).slice(mayorCase ? 1 : 0);

      if (authorParts.length % 2 !== 0) {
        console.error(`🤔 - Author parts for ${file} looks strange!`);
      }

      const authors: Author[] = [];

      do {
        const name = authorParts.shift() as string;
        const id = toASCIIString(name);
        let portrait = id + ".jpg";
        const mandates = (authorParts.shift() as string).split(/\s*,\s+/);

        try {
          await access(pathJoin("public", "images", "portraits", portrait));
        } catch (err) {
          portrait = "default.svg";
        }

        const author = {
          id,
          name,
          mandates,
          portrait,
          totalSignificantWords: 0,
          totalWords: 0,
        };

        authors.push(author);
        globalStats.authors[author.id] = author;
      } while (authorParts.length);

      const content = parts
        .slice(mayorCase ? 0 : 1)
        .join("\n\n")
        .trim();
      const group: BaseGroup = buildGroupDetails(
        mayorCase
          ? "Majorité municipale : Douai au Cœur (Parti Socialiste)"
          : parts.slice(0, 1).join("")
      );
      const source = mayorCase
        ? sourcesCaptures[1] || sourcesCaptures[0]
        : sourcesCaptures[0];

      const date = `${occurence}-01T00:00:00Z`;
      const id = `${occurence}-${publication}-${authors
        .map(({ id }) => id)
        .join("-")}`;
      const response = await axios({
        method: "post",
        url: `http://localhost:9000`,
        params: {
          properties:
            '{"annotators":"tokenize,ssplit,mwt,pos,lemma,ner,parse,sentiment","outputFormat":"json"}',
        },
        data: content,
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
          const writerAggregation = writtersAggregations[
            toASCIIString(name)
          ] || {
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
        neutral: sentiments.filter((sentiment) => sentiment === "Neutral")
          .length,
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

      const markdown = `---
id: "${id}"
authors:${authors
        .map(
          ({ id, name, mandates, portrait }) => `
- id: "${id}"
  name: "${name}"
  mandates: ${mandates
    .map(
      (mandate) => `
  - "${mandate}"`
    )
    .join("")}
  portrait: "${portrait}"`
        )
        .join("")}
group:
  id: "${group.id}"
  name: "${group.name}"
  type: "${group.type}"
  party: "${group.party}"
  abbr: "${group.abbr}"
  logo: "${group.logo}"
date: "${date}"
publication: "${publication}"
source: "${source}"
language: "fr"
locality: "Douai"
country: "France"
---

${content}
`;
      await writeFile(pathJoin("contents", "tribunes", `${id}.md`), markdown);
    }
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

function buildGroupDetails(fullName): BaseGroup {
  const matches = fullName.match(/^(.*) :([^\(]*)(\(.*\)|)$/);
  const name = matches[2].trim() || "Non-Affilié·es";
  const type = matches[1].trim();
  let party = matches[3].trim() || "Sans-Étiquette";
  let abbr = "SE";
  let logo = "default.svg";

  if (party.includes("Europe Écologie les Verts")) {
    party = "Europe Écologie-Les Verts";
    abbr = "EELV";
    logo = "eelv-douaisis.svg";
  }
  if (party.includes("Vivre Douai")) {
    party = "Citoyen·nes de Vivre Douai";
    abbr = "SE";
    logo = "douai-au-coeur.svg";
  }
  if (party.includes("Parti Socialiste")) {
    party = "Parti Socialiste";
    abbr = "PS";
    logo = "ps.png";
  }
  if (
    party.includes("L’humain d’abord pour Douai") ||
    party.includes("Parti Communiste")
  ) {
    party = "Parti Communiste Français";
    abbr = "PCF";
    logo = "pcf.svg";
  }
  if (party.includes("Rassemblement National")) {
    party = "Rassemblement National";
    abbr = "RN";
  }
  if (party.includes("UMP")) {
    party = "Union pour un Mouvement Populaire";
    abbr = "UMP";
  }
  if (fullName.includes("Douai dynamique et durable")) {
    party = "Alliance LReM-Modem";
    abbr = "DVD";
  }
  if (fullName.includes("Ensemble faisons Douai")) {
    party = "Sans-Étiquette";
    abbr = "SE";
  }

  return {
    id: toASCIIString(`${name} ${abbr}`),
    name,
    type,
    party,
    abbr,
    logo,
  };
}

function createBaseStatsObject() {
  return {
    authors: {},
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
