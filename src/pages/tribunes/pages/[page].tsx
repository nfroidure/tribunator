import { pathJoin } from "../../../utils/files";
import Entries, {
  entriesToBaseListingMetadata,
  getStaticProps,
} from "../index";
import { readEntries } from "../../../utils/frontmatter";
import { buildAssets } from "../../../utils/build";
import type { GetStaticPaths } from "next";
import type { TribuneFrontmatterMetadata } from "../../../utils/tribunes";

export { getStaticProps };
export default Entries;

export const getStaticPaths: GetStaticPaths = async () => {
  const baseProps = entriesToBaseListingMetadata(
    await readEntries<TribuneFrontmatterMetadata>(
      pathJoin(".", "contents", "tribunes")
    )
  );

  // WARNING: This is not a nice way to generate the news feeds
  // but having scripts run in the NextJS build context is a real
  // pain
  await buildAssets(baseProps, '/tribunes');

  const paths = new Array(baseProps.pagesCount)
    .fill("")
    .map((_, index) => index + 1)
    .filter((page) => page !== 1)
    .map((page) => ({
      params: { page: page.toString() },
    }));

  return { paths, fallback: false };
};
