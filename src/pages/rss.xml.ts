import rss from "@astrojs/rss";
import { getAllEntries } from "@/utils/getAllEntries";
import config from "@/config";

export async function GET() {
  // Posts + research pages, merged and sorted by last update.
  const entries = await getAllEntries(config.site.lang);

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: config.site.url,
    items: entries.map(entry => ({
      link: entry.href,
      title: entry.title,
      description: entry.description,
      pubDate: new Date(entry.modDatetime ?? entry.pubDatetime),
    })),
  });
}
