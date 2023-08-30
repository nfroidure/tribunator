import { pathJoin, readJSON } from "./files";
import type { GlobalStatsSummary } from "./writters";

export async function readGlobalStats(): Promise<GlobalStatsSummary> {
  return readJSON<GlobalStatsSummary>(
    pathJoin(".", "contents", "globalStats.json")
  );
}
