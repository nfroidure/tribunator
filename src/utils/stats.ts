export type OccurenceItem = {
  id: string;
  date: string;
  count: number;
};

export type StatItem = {
  mean: { count: number; total: number };
  min: { value: number; ids: string[]; restLength?: number };
  max: { value: number; ids: string[]; restLength?: number };
};

export function computeStats(occurences: OccurenceItem[]): StatItem {
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

export function createBaseStatsItem(
  firstValue?: number,
  id?: string
): StatItem {
  if (typeof firstValue === "number") {
    if (typeof id !== "string") {
      throw new Error("E_BAD_ARGS");
    }
    return {
      mean: { count: 1, total: firstValue },
      min: { value: firstValue, ids: [id] },
      max: { value: firstValue, ids: [id] },
    };
  }

  return {
    mean: { count: 0, total: 0 },
    min: { value: Infinity, ids: [] },
    max: { value: -Infinity, ids: [] },
  };
}

export function aggregatesStats(statsItem: StatItem, statsObject: StatItem) {
  statsObject.mean.total += statsItem.mean.total;
  statsObject.mean.count += 1;

  if (statsObject.min.value > statsItem.min.value) {
    statsObject.min = statsItem.min;
  } else if (statsObject.min.value === statsItem.min.value) {
    statsObject.min = {
      value: statsItem.min.value,
      ids: [...statsObject.min.ids, ...statsItem.min.ids],
    };
  }

  if (statsObject.max.value < statsItem.max.value) {
    statsObject.max = statsItem.max;
  } else if (statsObject.max.value === statsItem.max.value) {
    statsObject.max = {
      value: statsItem.max.value,
      ids: [...statsObject.max.ids, ...statsItem.max.ids],
    };
  }
}

export function shrinkStats(statsItem: StatItem): StatItem {
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

export function sortByDate<T extends { date: string }>(
  authorA: T,
  authorB: T
): number {
  if (Date.parse(authorA.date) < Date.parse(authorB.date)) {
    return -1;
  } else if (Date.parse(authorA.date) > Date.parse(authorB.date)) {
    return 1;
  }
  return 0;
}

export function sortByName<T extends { name: string }>(
  authorA: T,
  authorB: T
): number {
  if (authorA.name < authorB.name) {
    return -1;
  } else if (authorA.name > authorB.name) {
    return 1;
  }
  return 0;
}
