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
 * Site-shell normalization for academic / cheatsheet paper2html bodies.
 *
 * Paper2html single-file pages carry chrome that the blog already owns:
 * sticky in-page TOC (TocRail replaces it), SHA/render meta, duplicate H1
 * from the Markdown title, and a leading 「版本说明」blockquote. They also
 * wrap body content in `.layout { max-width: 1280px; 260px | 1fr }`, which
 * is wider than the site `--app-width` and leaves a second TOC column.
 *
 * This keeps hero eyebrow + title, strips the rest, unwraps `.layout` to
 * `main` contents, and wraps each top-level `h2[id]` block as
 * `section.card[id]` so PaperLayout's left TocRail can index sections.
 */
function normalizePaperBody($, body) {
  // Site TocRail is the only TOC — embedded paper TOC double-numbers
  // (CSS `ol li` matches nested `ul li` and also prefixes already-numbered
  // titles like "1. 文献核心信息").
  body.find("nav.toc").remove();

  // Prefer the article column; drop the 260px | 1fr grid shell.
  const layout = body.find(".layout").first();
  if (layout.length) {
    const main = layout.find("> main").first();
    if (main.length) {
      layout.replaceWith(main.contents());
    } else {
      layout.replaceWith(layout.contents());
    }
  }

  // Hero keeps eyebrow + h1; drop SHA256 / Rendered / source-path chips.
  body.find("header.hero .meta").remove();

  // Generator footer + interactive hosts (TOC/lightbox) — site owns chrome.
  body.find("footer.aris-footer, #cite-pop, dialog.lightbox, #figure-lightbox").remove();

  // Markdown title reappears as the first body h1 after the hero — remove it.
  const hero = body.find("header.hero").first();
  if (hero.length) {
    let node = hero.next();
    while (node.length && node.is("h1")) {
      const next = node.next();
      node.remove();
      node = next;
    }
    // Leading deep-note 「版本说明」blockquote — site meta + source link
    // already cover provenance.
    if (
      node.length &&
      node.is("blockquote") &&
      /版本说明|阅读源|检索日期|reading basis/i.test(node.text())
    ) {
      node.remove();
    }
  }

  // Wrap each h2[id] + following siblings until the next h2 as section.card
  // so PaperLayout TocRail (`section.card[id] > h2`) works for academic
  // deep-notes that don't emit section cards.
  const h2s = body.find("h2[id]").toArray();
  for (const el of h2s) {
    const $h2 = $(el);
    if ($h2.closest("section.card").length) continue;
    const id = $h2.attr("id");
    if (!id) continue;
    const section = $("<section></section>")
      .addClass("card")
      .attr("id", id);
    $h2.before(section);
    // Move h2 into section, then following siblings until next h2/header/section.
    section.append($h2);
    let sib = section.next();
    while (
      sib.length &&
      !sib.is("h2") &&
      !sib.is("header") &&
      !(sib.is("section") && sib.hasClass("card"))
    ) {
      const next = sib.next();
      section.append(sib);
      sib = next;
    }
    // Drop the id from the inner h2 so fragment targets stay on the section.
    $h2.removeAttr("id");
  }
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

  normalizePaperBody($, body);

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
