#!/usr/bin/env node
/**
 * Research page CLI — the blog side of the paper2html publishing contract
 * (see .claude/skills/paper2html/scripts/publish_paper2html.sh):
 *
 *   pnpm research:publish <index.html> --to topic[/series]/slug [options]
 *   pnpm research verify <topic[/series]/slug> [--remote]
 */
import { normalizeResearchPath } from "./lib/paths.mjs";
import { runPublish } from "./lib/publish.mjs";
import { verifyLocal, verifyRemote } from "./lib/verify.mjs";
import { ResearchError, UsageError, fail } from "./lib/util.mjs";

const USAGE = `Usage:
  pnpm research:publish <index.html> --to topic[/series]/slug [options]
  pnpm research publish <index.html> --to topic[/series]/slug [options]
  pnpm research verify <topic[/series]/slug> [--remote]

Publish a finished paper2html single-file page into src/data/research/ and
verify an imported page.

Required (publish):
  <index.html>               Finished paper2html page
  --to topic[/series]/slug   Destination under /research/ (also --to=...)

Forwarded metadata (CLI wins over <title>/<meta> fallbacks in the HTML):
  --title "Readable title"
  --description "Short summary"
  --date YYYY-MM-DD          Default: today (Asia/Shanghai)
  --tags a,b,c               Default: 论文精读
  --topic-title "中文课题名"
  --series-title "中文系列名"
  --source "https://..."
  --comments true|false      Per-page giscus toggle in meta.json (default: true;
                             only written when false)
  --message "commit message" Used by --ship

Modes (at most one):
  --ship                     Import, format, check, commit only this page, push
  --check                    Import and run local checks (astro check)
  --dry-run                  Validate and print the target without writing

Other:
  --allow-private-evidence   Allow file:// / local-path references (avoid for
                             public pages)

Verify:
  <topic[/series]/slug>      Page to verify under src/data/research/
  --remote                   Also curl the public URL
                             ($PAPER2HTML_PUBLIC_BASE_URL or <site.url>/research)

Exit codes: 0 success · 1 validation/runtime failure · 2 usage error`;

const PUBLISH_VALUE_OPTIONS = new Map([
  ["--to", "to"],
  ["--title", "title"],
  ["--description", "description"],
  ["--date", "date"],
  ["--tags", "tags"],
  ["--topic-title", "topicTitle"],
  ["--series-title", "seriesTitle"],
  ["--source", "source"],
  ["--comments", "comments"],
  ["--message", "message"],
]);

const PUBLISH_MODE_FLAGS = new Map([
  ["--ship", "ship"],
  ["--check", "check"],
  ["--dry-run", "dry-run"],
]);

const PUBLISH_BOOL_FLAGS = new Map([
  ["--allow-private-evidence", "allowPrivateEvidence"],
]);

function parsePublishArgs(argv) {
  const options = { allowPrivateEvidence: false };
  const modes = [];
  let htmlPath;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }
    if (arg.startsWith("--")) {
      const eqIndex = arg.indexOf("=");
      const name = eqIndex === -1 ? arg : arg.slice(0, eqIndex);

      if (PUBLISH_MODE_FLAGS.has(name)) {
        if (eqIndex !== -1) throw new UsageError(`${name} does not take a value`);
        modes.push(PUBLISH_MODE_FLAGS.get(name));
        continue;
      }
      if (PUBLISH_BOOL_FLAGS.has(name)) {
        if (eqIndex !== -1) throw new UsageError(`${name} does not take a value`);
        options[PUBLISH_BOOL_FLAGS.get(name)] = true;
        continue;
      }
      if (PUBLISH_VALUE_OPTIONS.has(name)) {
        let value;
        if (eqIndex !== -1) {
          value = arg.slice(eqIndex + 1);
        } else {
          if (i + 1 >= argv.length) {
            throw new UsageError(`missing value for ${name}`);
          }
          value = argv[++i];
        }
        options[PUBLISH_VALUE_OPTIONS.get(name)] = value;
        continue;
      }
      throw new UsageError(`unknown option: ${name}`);
    }

    if (htmlPath !== undefined) {
      throw new UsageError(`unexpected positional argument: ${arg}`);
    }
    htmlPath = arg;
  }

  if (htmlPath === undefined) {
    throw new UsageError("missing <index.html> argument");
  }
  if (options.to === undefined) {
    throw new UsageError("missing --to topic[/series]/slug");
  }

  const uniqueModes = [...new Set(modes)];
  if (uniqueModes.length > 1) {
    throw new UsageError(
      `choose at most one of --ship / --check / --dry-run (got: ${uniqueModes.join(", ")})`
    );
  }

  return { htmlPath, options, mode: uniqueModes[0] };
}

function parseVerifyArgs(argv) {
  let target;
  let remote = false;

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }
    if (arg === "--remote") {
      remote = true;
      continue;
    }
    if (arg.startsWith("--")) {
      throw new UsageError(`unknown option: ${arg}`);
    }
    if (target !== undefined) {
      throw new UsageError(`unexpected positional argument: ${arg}`);
    }
    target = arg;
  }

  if (target === undefined) {
    throw new UsageError("missing <topic[/series]/slug> argument");
  }

  return { target, remote };
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (command === "--help" || command === "-h") {
    console.log(USAGE);
    return;
  }
  if (command === undefined) {
    throw new UsageError("missing command: expected `publish` or `verify`");
  }

  if (command === "publish") {
    const parsed = parsePublishArgs(rest);
    if (parsed.help === true) {
      console.log(USAGE);
      return;
    }
    await runPublish(parsed);
    return;
  }

  if (command === "verify") {
    const parsed = parseVerifyArgs(rest);
    if (parsed.help === true) {
      console.log(USAGE);
      return;
    }
    const researchPath = normalizeResearchPath(parsed.target);
    const meta = await verifyLocal(researchPath);
    if (parsed.remote) {
      await verifyRemote(researchPath, meta);
    }
    return;
  }

  throw new UsageError(`unknown command: ${command}`);
}

main().catch(error => {
  if (error instanceof UsageError) {
    fail(error.message);
    console.error("");
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }
  if (error instanceof ResearchError) {
    fail(error.message);
    process.exitCode = 1;
    return;
  }
  fail(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exitCode = 1;
});
