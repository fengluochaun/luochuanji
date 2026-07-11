import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractPaper, findPrivateEvidence } from "./extract.mjs";
import { normalizeResearchPath } from "./paths.mjs";
import { scopePaperCss } from "./scope-css.mjs";
import { verifyLocal } from "./verify.mjs";
import {
  REPO_ROOT,
  RESEARCH_DATA_DIR,
  ResearchError,
  UsageError,
  capture,
  log,
  run,
  warn,
} from "./util.mjs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SITE_TIMEZONE = "Asia/Shanghai";
const DEFAULT_TAGS = ["论文精读"];

function todayInSiteTimezone() {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: SITE_TIMEZONE }).format(
    new Date()
  );
}

function isValidDate(value) {
  return DATE_RE.test(value) && !Number.isNaN(Date.parse(value));
}

function resolveDate(cliDate, htmlDate) {
  if (cliDate !== undefined) {
    if (!isValidDate(cliDate)) {
      throw new UsageError(`--date must be a valid YYYY-MM-DD, got: ${cliDate}`);
    }
    return cliDate;
  }
  if (htmlDate !== undefined) {
    if (isValidDate(htmlDate)) return htmlDate;
    warn(`ignoring invalid research-date meta value: ${htmlDate}`);
  }
  return todayInSiteTimezone();
}

function parseTags(rawTags) {
  return [
    ...new Set(
      rawTags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    ),
  ];
}

/**
 * Resolve the per-page comments toggle. Defaults to enabled (true); only an
 * explicit `--comments false` disables it. The `true` case is omitted from
 * meta.json so the collection default (true) applies and files stay minimal.
 */
function resolveComments(rawComments) {
  if (rawComments === undefined) return undefined;
  const value = rawComments.trim().toLowerCase();
  if (value === "false" || value === "0" || value === "no") return false;
  if (value === "true" || value === "1" || value === "yes") return undefined;
  throw new UsageError(
    `--comments must be true or false, got: ${rawComments}`
  );
}

/** Resolve final metadata: CLI arguments win, HTML head values are fallbacks. */
function resolveMeta(options, htmlMeta) {
  const title = options.title ?? htmlMeta.title;
  if (title === undefined) {
    throw new ResearchError(
      "cannot determine a title: pass --title or set <title> in the HTML"
    );
  }

  let description = options.description ?? htmlMeta.description;
  if (description === undefined) {
    warn("no description found (pass --description); falling back to the title");
    description = title;
  }

  const tags = parseTags(options.tags ?? htmlMeta.tags ?? "");
  const comments = resolveComments(options.comments);

  if (options.source !== undefined && !/^https?:\/\//i.test(options.source)) {
    warn(`--source does not look like an http(s) URL: ${options.source}`);
  }

  return {
    title,
    description,
    date: resolveDate(options.date, htmlMeta.date),
    tags: tags.length > 0 ? tags : [...DEFAULT_TAGS],
    ...(options.source !== undefined && { source: options.source }),
    ...(options.topicTitle !== undefined && { topicTitle: options.topicTitle }),
    ...(options.seriesTitle !== undefined && {
      seriesTitle: options.seriesTitle,
    }),
    ...(comments === false && { comments: false }),
    importedAt: new Date().toISOString(),
  };
}

/**
 * Import a paper2html single-file page into `src/data/research/<path>/`.
 *
 * Modes:
 * - (none)    validate + write + structural verify
 * - dry-run   validate and print the plan, write nothing
 * - check     as (none), then run `astro check`
 * - ship      as check, then format + commit ONLY this page's files + push
 */
export async function runPublish({ htmlPath, options, mode }) {
  const absoluteHtmlPath = path.resolve(process.cwd(), htmlPath);
  if (!existsSync(absoluteHtmlPath)) {
    throw new ResearchError(`missing HTML file: ${htmlPath}`);
  }
  if (!absoluteHtmlPath.toLowerCase().endsWith(".html")) {
    throw new ResearchError(`expected a .html file: ${htmlPath}`);
  }

  const researchPath = normalizeResearchPath(options.to);
  const slug = researchPath.split("/").at(-1);
  const targetDir = path.join(REPO_ROOT, RESEARCH_DATA_DIR, researchPath);
  const relativeTargetDir = path.relative(REPO_ROOT, targetDir);

  const html = await readFile(absoluteHtmlPath, "utf-8");
  const { styles, content, htmlMeta } = extractPaper(html);

  const evidence = findPrivateEvidence(content);
  if (evidence.length > 0) {
    const lines = evidence.map(finding => `  - ${finding}`).join("\n");
    if (options.allowPrivateEvidence === true) {
      warn(`private/local evidence allowed by --allow-private-evidence:\n${lines}`);
    } else {
      throw new ResearchError(
        `private/local evidence found (pass --allow-private-evidence to override):\n${lines}`
      );
    }
  }

  const meta = resolveMeta(options, htmlMeta);
  const scopedCss = await scopePaperCss(styles);
  if (scopedCss.trim() === "") {
    warn("the source page has no <style> blocks; styles.css will be empty");
  }
  const isUpdate = existsSync(targetDir);

  log(`source: ${htmlPath}`);
  log(`target: ${relativeTargetDir}/`);
  log(`title:  ${meta.title}`);
  log(`date:   ${meta.date}`);
  log(`tags:   ${meta.tags.join(", ")}`);

  if (mode === "dry-run") {
    log(
      `dry run: would ${isUpdate ? "update" : "create"} ` +
        `${relativeTargetDir}/{content.html, styles.css, meta.json}`
    );
    return;
  }

  await mkdir(targetDir, { recursive: true });
  await writeFile(
    path.join(targetDir, "content.html"),
    `${content}\n`,
    "utf-8"
  );
  await writeFile(
    path.join(targetDir, "styles.css"),
    `${scopedCss.trimEnd()}\n`,
    "utf-8"
  );
  await writeFile(
    path.join(targetDir, "meta.json"),
    `${JSON.stringify(meta, null, 2)}\n`,
    "utf-8"
  );
  log(
    `${isUpdate ? "updated" : "imported"}: ` +
      `${relativeTargetDir}/{content.html, styles.css, meta.json}`
  );

  await verifyLocal(researchPath);

  if (mode === "ship") {
    // Format the imported files. `src/data/research/` is prettier-ignored
    // (generated content is committed verbatim), so this is a guarded no-op —
    // kept for parity with the documented ship sequence (format → check →
    // commit → push) in case non-ignored assets are ever added here.
    run("pnpm", [
      "exec",
      "prettier",
      "--write",
      relativeTargetDir,
      "--no-error-on-unmatched-pattern",
    ]);
  }

  if (mode === "check" || mode === "ship") {
    log("running local checks (astro check)…");
    run("pnpm", ["exec", "astro", "check"]);
    log("local checks passed");
  }

  if (mode === "ship") {
    ship({ researchPath, relativeTargetDir, slug, options, isUpdate });
  }
}

function ship({ researchPath, relativeTargetDir, slug, options, isUpdate }) {
  const status = capture("git", ["status", "--porcelain", "--", relativeTargetDir]);
  if (status === "") {
    log("no changes under the research path; skipping commit and push");
    return;
  }

  const message =
    options.message ?? `feat(research): ${isUpdate ? "update" : "add"} ${slug}`;

  // Stage and commit ONLY this research page's files.
  run("git", ["add", "--", relativeTargetDir]);
  run("git", ["commit", "-m", message, "--", relativeTargetDir]);
  run("git", ["push"]);
  log(`shipped ${researchPath} (${message})`);
}
