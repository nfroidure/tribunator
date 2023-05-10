import { pathJoin, readJSON } from "./files";
import type { StatsSummary } from "./writters";

export async function readGlobalStats(): Promise<StatsSummary> {
  return readJSON<StatsSummary>(pathJoin(".", "contents", "globalStats.json"));
}
