import type { CollectionEntry } from "astro:content";
import { BLOG_PATH } from "@/content.config";

export type PostCategory = "essays" | "notes";

/**
 * Post category is derived from the first path segment under BLOG_PATH:
 * `src/content/posts/essays/foo.md` → "essays".
 * Anything not under a known category dir falls back to "essays" (杂谈).
 */
export function getPostCategory(post: CollectionEntry<"posts">): PostCategory {
  const rel = post.filePath?.replace(`${BLOG_PATH}/`, "") ?? "";
  const first = rel.split("/")[0];
  return first === "notes" ? "notes" : "essays";
}

export function filterByCategory(
  posts: CollectionEntry<"posts">[],
  category: PostCategory
): CollectionEntry<"posts">[] {
  return posts.filter(post => getPostCategory(post) === category);
}
