import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";
import { slugifyStr } from "./slugify";

type Tag = {
  tag: string;
  tagName: string;
};

/**
 * De-duplicates and sorts flattened tag labels.
 *
 * - `tag` is the slug used in URLs; `tagName` is the original label for display
 * - Uniqueness is based on the slug (so differently-cased labels collapse)
 */
function toUniqueSortedTags(tagLists: string[][]): Tag[] {
  return tagLists
    .flat()
    .map(tag => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
}

/**
 * Builds a de-duplicated, sorted tag list from posts.
 * Drafts and scheduled posts are excluded via `postFilter()`.
 */
export function getUniqueTags(posts: CollectionEntry<"posts">[]): Tag[] {
  return toUniqueSortedTags(
    posts.filter(postFilter).map(post => post.data.tags)
  );
}

/**
 * Same as `getUniqueTags` but for already-filtered unified entries
 * (posts + research pages from `getAllEntries()`).
 */
export function getUniqueTagsFromEntries(entries: { tags: string[] }[]): Tag[] {
  return toUniqueSortedTags(entries.map(entry => entry.tags));
}
