import { UsageError } from "./util.mjs";

const SEGMENT_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Normalize a research target to `topic[/series]/slug`.
 *
 * Port of `normalize_research_path` in
 * `.claude/skills/paper2html/scripts/publish_paper2html.sh` — keep the two in
 * sync. Accepts full public URLs, `/research/...`, `public/research/...`,
 * trailing `/index.html`, query strings and fragments.
 */
export function normalizeResearchPath(rawValue) {
  let value = String(rawValue ?? "").trim();
  value = value.replace(/^https?:\/\/[^/]+\/research\//i, "");
  value = value.replace(/[?#][\s\S]*$/, "");
  value = value.replace(/^\/?research\//i, "");
  value = value.replace(/^public\/research\//i, "");
  value = value.replace(/\/index\.html$/i, "");

  const segments = value
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .split("/")
    .filter(segment => segment.length > 0);

  if (segments.length < 2) {
    throw new UsageError(
      "research path must include at least topic and page slug (topic[/series]/slug)"
    );
  }
  if (segments.length > 3) {
    throw new UsageError(
      `research path must be topic[/series]/slug (max 3 segments), got ${segments.length}: ${segments.join("/")}`
    );
  }
  for (const segment of segments) {
    if (segment === "." || segment === ".." || !SEGMENT_RE.test(segment)) {
      throw new UsageError(`invalid research path segment: ${segment}`);
    }
  }

  return segments.join("/");
}
