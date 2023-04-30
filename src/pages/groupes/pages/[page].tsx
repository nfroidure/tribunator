import { pathJoin } from "../../../utils/files";
import Entries, {
  entriesToBaseListingMetadata,
  getStaticProps,
} from "../index";
import { buildAssets } from "../../../utils/build";
import { readGroupsEntries } from "../../../utils/groups";
import type { GetStaticPaths } from "next";

export { getStaticProps };
export default Entries;

export const getStaticPaths: GetStaticPaths = async () => {
  const baseProps = entriesToBaseListingMetadata(
    await readGroupsEntries(pathJoin(".", "contents", "groups"))
  );

  // WARNING: This is not a nice way to generate the news feeds
  // but having scripts run in the NextJS build context is a real
  // pain
  await buildAssets(baseProps, "/groupes");

  const paths = new Array(baseProps.pagesCount)
    .fill("")
    .map((_, index) => index + 1)
    .filter((page) => page !== 1)
    .map((page) => ({
      params: { page: page.toString() },
    }));

  return { paths, fallback: false };
};
