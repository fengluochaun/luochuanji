import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  REPO_ROOT,
  RESEARCH_DATA_DIR,
  ResearchError,
  log,
  warn,
} from "./util.mjs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Structural checks on an imported research page.
 * Throws ResearchError with the full problem list on failure;
 * returns the parsed meta.json on success.
 */
export async function verifyLocal(researchPath) {
  const dir = path.join(REPO_ROOT, RESEARCH_DATA_DIR, researchPath);

  if (!existsSync(dir)) {
    throw new ResearchError(
      `research page not found: ${RESEARCH_DATA_DIR}/${researchPath}/`
    );
  }

  const problems = [];
  let meta;

  const metaPath = path.join(dir, "meta.json");
  if (!existsSync(metaPath)) {
    problems.push("meta.json is missing");
  } else {
    try {
      meta = JSON.parse(await readFile(metaPath, "utf-8"));
    } catch (error) {
      problems.push(`meta.json is not valid JSON: ${error.message}`);
    }
  }

  if (meta !== undefined) {
    if (typeof meta.title !== "string" || meta.title.trim() === "") {
      problems.push("meta.json: `title` must be a non-empty string");
    }
    if (typeof meta.description !== "string") {
      problems.push("meta.json: `description` must be a string");
    }
    if (
      typeof meta.date !== "string" ||
      !DATE_RE.test(meta.date) ||
      Number.isNaN(Date.parse(meta.date))
    ) {
      problems.push("meta.json: `date` must be a valid YYYY-MM-DD string");
    }
    if (
      !Array.isArray(meta.tags) ||
      meta.tags.length === 0 ||
      meta.tags.some(tag => typeof tag !== "string" || tag.trim() === "")
    ) {
      problems.push(
        "meta.json: `tags` must be a non-empty array of non-empty strings"
      );
    }
    if (meta.comments !== undefined && typeof meta.comments !== "boolean") {
      problems.push("meta.json: `comments` must be a boolean when present");
    }
  }

  const contentPath = path.join(dir, "content.html");
  if (!existsSync(contentPath)) {
    problems.push("content.html is missing");
  } else {
    const content = await readFile(contentPath, "utf-8");
    if (content.trim() === "") {
      problems.push("content.html is empty");
    } else if (/<script[\s>]/i.test(content)) {
      problems.push(
        "content.html must not contain <script> tags (the importer strips them)"
      );
    }
  }

  const stylesPath = path.join(dir, "styles.css");
  if (!existsSync(stylesPath)) {
    problems.push("styles.css is missing");
  } else if ((await readFile(stylesPath, "utf-8")).trim() === "") {
    warn(`styles.css is empty for ${researchPath}`);
  }

  if (problems.length > 0) {
    throw new ResearchError(
      `verification failed for ${researchPath}:\n  - ${problems.join("\n  - ")}`
    );
  }

  log(`local verify passed: ${RESEARCH_DATA_DIR}/${researchPath}/`);
  return meta;
}

/**
 * Resolve the public base URL used for remote verification:
 * `$PAPER2HTML_PUBLIC_BASE_URL` first, then `<site.url>/research` parsed from
 * `astro-paper.config.ts`.
 */
async function resolvePublicBaseUrl() {
  const fromEnv = (process.env.PAPER2HTML_PUBLIC_BASE_URL ?? "").trim();
  if (fromEnv !== "") {
    return fromEnv.replace(/\/+$/, "");
  }

  let configSource = "";
  try {
    configSource = await readFile(
      path.join(REPO_ROOT, "astro-paper.config.ts"),
      "utf-8"
    );
  } catch (error) {
    warn(`could not read astro-paper.config.ts: ${error.message}`);
  }
  const match = configSource.match(/url:\s*["']([^"']+)["']/);
  if (match) {
    return `${match[1].replace(/\/+$/, "")}/research`;
  }

  throw new ResearchError(
    "cannot resolve the public base URL: set PAPER2HTML_PUBLIC_BASE_URL " +
      "(e.g. https://blog.luochuanji.com/research)"
  );
}

/**
 * Fetch the public page and require HTTP 200 plus the page title in the body.
 */
export async function verifyRemote(researchPath, meta) {
  const base = await resolvePublicBaseUrl();
  const url = `${base}/${researchPath}/`;
  log(`remote verify: GET ${url}`);

  let response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new ResearchError(
      `remote verify failed: could not fetch ${url}: ${error.message}`
    );
  }

  if (response.status !== 200) {
    throw new ResearchError(
      `remote verify failed: ${url} responded with HTTP ${response.status}`
    );
  }

  const bodyText = await response.text();
  const title = typeof meta?.title === "string" ? meta.title : "";
  if (
    title !== "" &&
    !bodyText.includes(title) &&
    !bodyText.includes(escapeHtml(title))
  ) {
    throw new ResearchError(
      `remote verify failed: response body does not contain the page title "${title}"`
    );
  }

  log(`remote verify passed: ${url}`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
