import * as cheerio from "cheerio";
import { ResearchError } from "./util.mjs";

/** Unfilled template placeholders such as `__TITLE__` are treated as absent. */
const PLACEHOLDER_RE = /^__[A-Z0-9_]+__$/;

function cleanValue(value) {
  const trimmed = (value ?? "").trim();
  if (trimmed === "" || PLACEHOLDER_RE.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Extract the publishable payload from a finished paper2html single-file page:
 *
 * - `styles`: every `<style>` block, merged in document order
 * - `content`: the `<body>` markup minus the page's own fixed navbar
 *   (`nav.nav` / `header.nav` — the site header replaces it) and all
 *   `<script>` / `<link>` elements (KaTeX CDN assets are replaced by the
 *   site's locally vendored KaTeX; data-URI images pass through untouched)
 * - `htmlMeta`: `<title>` / `<meta name="research-*">` metadata fallbacks
 */
export function extractPaper(html) {
  const $ = cheerio.load(html);

  const body = $("body");
  if (body.length === 0) {
    throw new ResearchError("input HTML has no <body> element");
  }

  const styles = $("style")
    .map((_, el) => ($(el).html() ?? "").trim())
    .get()
    .filter(css => css.length > 0)
    .join("\n\n");

  const htmlMeta = {
    title: cleanValue($("head title").first().text()),
    description:
      cleanValue($('meta[name="research-description"]').attr("content")) ??
      cleanValue($('meta[name="description"]').attr("content")),
    date: cleanValue($('meta[name="research-date"]').attr("content")),
    tags: cleanValue($('meta[name="research-tags"]').attr("content")),
  };

  // The page's own fixed navbar duplicates the site header — drop it.
  body.find("nav.nav, header.nav").remove();
  // Scripts (incl. the KaTeX CDN bootstrap) and stylesheet links never run
  // in-site: the PaperLayout provides local KaTeX and injects scoped styles.
  body.find("script, noscript, link").remove();

  const content = (body.html() ?? "").trim();
  if (content === "") {
    throw new ResearchError("no publishable content found in <body>");
  }

  return { styles, content, htmlMeta };
}

const LOCAL_EVIDENCE_RE =
  /^(?:file:\/\/|~\/|\/(?:Users|home|private|tmp|var)\/|[A-Za-z]:[\\/])/i;
const EMBEDDED_OK_RE = /^(?:data:|https?:|\/\/)/i;
const MEDIA_TAGS = new Set([
  "img",
  "source",
  "video",
  "audio",
  "iframe",
  "embed",
]);

/**
 * Find references that would leak private data or break on a public
 * single-file page:
 *
 * - `file://` URLs and absolute local filesystem paths anywhere
 * - media sources that are neither `data:` URIs nor http(s) URLs
 *
 * Returns human-readable findings (empty array = clean).
 */
export function findPrivateEvidence(content) {
  const $ = cheerio.load(content);
  const findings = [];

  $("[href], [src]").each((_, el) => {
    const node = $(el);
    const tag = (el.tagName ?? "?").toLowerCase();
    for (const attr of ["href", "src"]) {
      const value = (node.attr(attr) ?? "").trim();
      if (value === "") continue;
      if (LOCAL_EVIDENCE_RE.test(value)) {
        findings.push(
          `<${tag} ${attr}="${truncate(value)}"> points at a local file`
        );
        continue;
      }
      if (attr === "src" && MEDIA_TAGS.has(tag) && !EMBEDDED_OK_RE.test(value)) {
        findings.push(
          `<${tag} src="${truncate(value)}"> is not embedded (expected a data: URI or an https URL)`
        );
      }
    }
  });

  return findings;
}

function truncate(value, max = 80) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
