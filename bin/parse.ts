import { readFile, writeFile, readDir, access } from "../src/utils/files";
import { join as pathJoin } from "path";
import axios from "axios";
import { tmpdir } from "node:os";
import { exec as _exec } from "node:child_process";
import { promisify } from "node:util";
import nodeLefff from "node-lefff";
import { toASCIIString } from "../src/utils/ascii";
import type {
  OccurenceItem,
  SentimentOccurenceItem,
  StatItem,
  StatsSummary,
} from "../src/utils/writters";

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

        await new Promise((resolve) => setTimeout(resolve, 500));
        await exec(`google-chrome  --headless --screenshot=${tempFile} ${source}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await exec(`convert ${tempFile} -trim ${captureDestination}`);
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
      const author = authorParts.shift() as string;
      const title = authorParts.join("\n");
      const content = parts
        .slice(mayorCase ? 0 : 1)
        .join("\n\n")
        .trim();
      const group = mayorCase
        ? "Majorité municipale : Douai au Cœur (Parti Socialiste)"
        : parts.slice(0, 1).join("");
      const groupDetails = buildGroupDetails(group);
      const source = mayorCase
        ? sourcesCaptures[1] || sourcesCaptures[0]
        : sourcesCaptures[0];
      let portrait = toASCIIString(author) + ".jpg";

      try {
        await access(pathJoin("public", "images", "portraits", portrait));
      } catch (err) {
        portrait = "default.svg";
      }

      const date = `${occurence}-01T00:00:00Z`;
      const id = `${occurence}-${publication}-${toASCIIString(author)}`;
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

      const groupAggregation = groupsAggregations[groupDetails.id] || {
        id: groupDetails.id,
        name: groupDetails.name,
        party: groupDetails.party,
        partyAbbr: groupDetails.abbr,
        type: groupDetails.type,
        logo: groupDetails.logo,
        writtings: [],
        sentences: [],
        sentiments: [],
        exclamations: [],
        questions: [],
        bolds: [],
        caps: [],
        words: [],
        portrait,
        authors: [author],
        locality: "Douai",
        country: "France",
      };

      groupsAggregations[groupDetails.id] = groupAggregation;
      groupAggregation.authors = [
        ...Array.from(new Set(groupAggregation.authors.concat(author))),
      ].sort();

      const writerAggregation = writtersAggregations[toASCIIString(author)] || {
        writtings: [],
        sentences: [],
        sentiments: [],
        exclamations: [],
        questions: [],
        bolds: [],
        caps: [],
        words: [],
        portrait,
        name: author,
        mandates: [title],
        groups: [group],
        groupsIds: [groupDetails.id],
        locality: "Douai",
        country: "France",
      };

      writtersAggregations[toASCIIString(author)] = writerAggregation;
      writerAggregation.groups = [
        ...Array.from(new Set(writerAggregation.groups.concat(group))),
      ];
      writerAggregation.groupsIds = [
        ...Array.from(
          new Set(writerAggregation.groupsIds.concat(groupDetails.id))
        ),
      ];
      writerAggregation.mandates = [
        ...Array.from(new Set(writerAggregation.mandates.concat(title))),
      ];

      writerAggregation.writtings.push({ date, id });
      groupAggregation.writtings.push({ date, id });

      const exclamation = {
        id,
        date,
        count: response.data.sentences.reduce((count, sentence) => {
          return sentence.tokens.reduce((count, { lemma }) => {
            return count + (lemma === "!" ? 1 : 0);
          }, count);
        }, 0),
      };
      writerAggregation.exclamations.push(exclamation);
      groupAggregation.exclamations.push(exclamation);

      const question = {
        id,
        date,
        count: response.data.sentences.reduce((count, sentence) => {
          return sentence.tokens.reduce((count, { lemma }) => {
            return count + (lemma === "?" ? 1 : 0);
          }, count);
        }, 0),
      };
      writerAggregation.questions.push(question);
      groupAggregation.questions.push(question);

      const bold = {
        id,
        date,
        // Very approximative count, could parse MD contents and
        // use the AST
        count:
          Math.floor([...Array.from(content.matchAll(/\*\*/gm))]?.length / 2) ||
          0,
      };
      writerAggregation.bolds.push(bold);
      groupAggregation.bolds.push(bold);

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
      writerAggregation.caps.push(cap);
      groupAggregation.caps.push(cap);

      const sentence = { id, date, count: response.data.sentences.length };
      writerAggregation.sentences.push(sentence);
      groupAggregation.sentences.push(sentence);

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
      writerAggregation.sentiments.push(sentiment);
      groupAggregation.sentiments.push(sentiment);

      words.forEach((word) => {
        const lemma = nl.lem(word.word);
        writerAggregation.words[lemma] =
          (writerAggregation.words[lemma] || 0) + 1;
        groupAggregation.words[lemma] =
          (groupAggregation.words[lemma] || 0) + 1;
      });

      const markdown = `---
id: "${id}"
author: "${author}"
title: "${title}"
group: "${group}"
groupId: "${groupDetails.id}"
date: "${date}"
publication: "${publication}"
source: "${source}"
language: "fr"
locality: "Douai"
country: "France"
portrait: "${portrait}"
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

    const finalAggregation = {
      ...writtersAggregations[key],
      summary: shrinkSummary(summary),
      words: Object.keys(writtersAggregations[key].words)
        .filter((word) => word.length > 3)
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

  function buildGroupDetails(group) {
    const matches = group.match(/^(.*) :([^\(]*)(\(.*\)|)$/);
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
    if (group.includes("Douai dynamique et durable")) {
      party = "Alliance LReM-Modem";
      abbr = "DVD";
    }
    if (group.includes("Ensemble faisons Douai")) {
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

  function createBaseStatsItem(): StatItem {
    return {
      mean: { count: 0, total: 0 },
      min: { value: Infinity, ids: [] },
      max: { value: -Infinity, ids: [] },
    };
  }

  function createBaseStatsObject(): StatsSummary {
    return {
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

  function aggregatesStats(statsItem: StatItem, statsObject: StatItem) {
    statsObject.mean.total += statsItem.mean.total;
    statsObject.mean.count++;
    if (statsObject.min.value > statsItem.min.value) {
      statsObject.min = statsItem.min;
    }
    if (statsObject.min.value === statsItem.min.value) {
      statsObject.min = {
        value: statsItem.min.value,
        ids: [...statsObject.min.ids, ...statsItem.min.ids],
      };
    }
    if (statsObject.max.value < statsItem.max.value) {
      statsObject.max = statsItem.max;
    }
    if (statsObject.max.value === statsItem.max.value) {
      statsObject.max = {
        value: statsItem.max.value,
        ids: [...statsObject.max.ids, ...statsItem.max.ids],
      };
    }
  }

  function computeStats(occurences: OccurenceItem[]): StatItem {
    return {
      mean: {
        count: occurences.reduce((total, { count }) => total + count, 0),
        total: occurences.length,
      },
      min: occurences.reduce(
        (actualMin, { count: value, id }) => {
          if (actualMin.value > value) {
            return {
              value,
              ids: [id],
            };
          }
          if (actualMin.value === value) {
            return {
              value,
              ids: [...actualMin.ids, id],
            };
          }
          return actualMin;
        },
        { value: Infinity, ids: [] } as StatItem["min"]
      ),
      max: occurences.reduce(
        (actualMax, { count: value, id }) => {
          if (actualMax.value < value) {
            return {
              value,
              ids: [id],
            };
          }
          if (actualMax.value === value) {
            return {
              value,
              ids: [...actualMax.ids, id],
            };
          }
          return actualMax;
        },
        { value: -Infinity, ids: [] } as StatItem["max"]
      ),
    };
  }

  function computeSentimentStats(
    occurences: SentimentOccurenceItem[]
  ): StatsSummary["sentiments"] {
    return ["positive", "neutral", "negative"].reduce((stats, sentiment) => {
      const reshapedOccurences = occurences.map(
        ({ id, date, ...occurence }) => ({
          id,
          date,
          count: occurence[sentiment],
        })
      );

      return {
        ...stats,
        [sentiment]: computeStats(reshapedOccurences),
      };
    }, {} as Partial<StatsSummary["sentiments"]>) as StatsSummary["sentiments"];
  }

  function shrinkStats(statsItem: StatItem): StatItem {
    return {
      mean: statsItem.mean,
      min: {
        value: statsItem.min.value,
        ids: statsItem.min.ids.slice(0, 5),
        restLength: statsItem.min.ids.slice(5).length,
      },
      max: {
        value: statsItem.max.value,
        ids: statsItem.max.ids.slice(0, 5),
        restLength: statsItem.max.ids.slice(5).length,
      },
    };
  }

  function shrinkSummary(summary: StatsSummary): StatsSummary {
    return {
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
}
