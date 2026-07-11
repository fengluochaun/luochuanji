import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Usage / argument errors → exit code 2 (mirrors publish_paper2html.sh). */
export class UsageError extends Error {}

/** Runtime / validation failures → exit code 1. */
export class ResearchError extends Error {}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Repo root resolved relative to this script, so any cwd works. */
export const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..", "..");

/** Where imported research pages live, relative to the repo root. */
export const RESEARCH_DATA_DIR = "src/data/research";

export function log(message) {
  console.log(`[research] ${message}`);
}

export function warn(message) {
  console.warn(`[research] WARN: ${message}`);
}

export function fail(message) {
  console.error(`[research] ERROR: ${message}`);
}

/**
 * Run a command from the repo root with inherited stdio.
 * Throws ResearchError on a non-zero exit code.
 */
export function run(command, args, options = {}) {
  log(`$ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
    ...options,
  });
  if (result.error) {
    throw new ResearchError(
      `failed to run ${command}: ${result.error.message}`
    );
  }
  if (result.status !== 0) {
    throw new ResearchError(
      `${command} ${args.join(" ")} exited with code ${result.status}`
    );
  }
}

/** Run a command from the repo root and capture trimmed stdout. */
export function capture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    ...options,
  });
  if (result.error) {
    throw new ResearchError(
      `failed to run ${command}: ${result.error.message}`
    );
  }
  if (result.status !== 0) {
    const stderr = (result.stderr ?? "").trim();
    throw new ResearchError(
      `${command} ${args.join(" ")} exited with code ${result.status}` +
        (stderr ? `: ${stderr}` : "")
    );
  }
  return (result.stdout ?? "").trim();
}
