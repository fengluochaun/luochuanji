import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

/** Imported paper2html research pages (written by `pnpm research:publish`). */
export const RESEARCH_PATH = "src/data/research";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

/**
 * Paper2html 精读页：每页一个目录
 * `src/data/research/<topic>[/<series>]/<slug>/{meta.json, content.html, styles.css}`，
 * entry id 即 `topic[/series]/slug`，与 `/research/<id>/` 路由一一对应。
 */
const research = defineCollection({
  loader: glob({
    pattern: "**/meta.json",
    base: `./${RESEARCH_PATH}`,
    generateId: ({ entry }) => entry.replace(/\/meta\.json$/, ""),
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().default(""),
    date: z.coerce.date(),
    tags: z.array(z.string()).default(["论文精读"]),
    source: z.string().optional(),
    topicTitle: z.string().optional(),
    seriesTitle: z.string().optional(),
    importedAt: z.string().optional(),
  }),
});

export const collections = { posts, pages, research };
