import { getCollection, type CollectionEntry } from "astro:content";
import { getPostUrl } from "./getPostPaths";
import { getResearchUrl } from "./getResearchPaths";
import { postFilter } from "./postFilter";
import config from "@/config";

/**
 * Unified shape for anything listable on the site: regular blog posts and
 * imported paper2html research pages. Used by the home page, tag pages and
 * the RSS feed so both content types share one merged, date-sorted stream.
 */
export type UnifiedEntry = {
  type: "post" | "research";
  title: string;
  description: string;
  pubDatetime: Date;
  modDatetime: Date | null;
  tags: string[];
  href: string;
  featured: boolean;
  timezone?: string;
};

function mapPostToEntry(
  post: CollectionEntry<"posts">,
  locale: string
): UnifiedEntry {
  const { data } = post;
  return {
    type: "post",
    title: data.title,
    description: data.description,
    pubDatetime: data.pubDatetime,
    modDatetime: data.modDatetime ?? null,
    tags: data.tags,
    href: getPostUrl(post.id, post.filePath, locale),
    featured: data.featured === true,
    timezone: data.timezone,
  };
}

function mapResearchToEntry(
  entry: CollectionEntry<"research">,
  locale: string
): UnifiedEntry {
  const { data } = entry;
  return {
    type: "research",
    title: data.title,
    description: data.description,
    pubDatetime: data.date,
    modDatetime: null,
    tags: data.tags,
    href: getResearchUrl(entry.id, locale),
    featured: false,
  };
}

function lastUpdatedEpoch(entry: UnifiedEntry): number {
  return (entry.modDatetime ?? entry.pubDatetime).getTime();
}

/**
 * Returns all listable entries (posts + research pages) merged and sorted by
 * "last updated" descending. Posts respect drafts/scheduling via
 * `postFilter()`; research pages are always listed once imported.
 */
export async function getAllEntries(
  locale: string = config.site.lang
): Promise<UnifiedEntry[]> {
  const posts = await getCollection("posts");
  const research = await getCollection("research");

  return [
    ...posts.filter(postFilter).map(post => mapPostToEntry(post, locale)),
    ...research.map(entry => mapResearchToEntry(entry, locale)),
  ].sort((a, b) => lastUpdatedEpoch(b) - lastUpdatedEpoch(a));
}
