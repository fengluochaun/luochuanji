import postcss from "postcss";
import prefixSelector from "postcss-prefix-selector";
import { ResearchError } from "./util.mjs";

/** Scope class the PaperLayout wraps injected paper content with. */
export const PAPER_SCOPE = ".paper-root";

const ROOT_TOKEN_RE = /^(?::root|html|body)(?![\w-])/i;

/**
 * Re-root a single (already comma-split) selector under the paper scope:
 *
 * - `:root` / `html` / `body` / `html body`  →  `.paper-root`
 * - `body .foo`                              →  `.paper-root .foo`
 * - `body.foo` / `:root.dark`                →  `.paper-root.foo` / `.paper-root.dark`
 * - `body > .foo`                            →  `.paper-root > .foo`
 * - anything else                            →  `.paper-root <selector>`
 *
 * Keyframe step selectors (`from` / `to` / percentages) never reach this
 * function — postcss-prefix-selector skips rules inside `@keyframes`.
 */
export function scopeSelector(prefix, selector, prefixedSelector) {
  let sel = selector.trim();
  if (!ROOT_TOKEN_RE.test(sel)) {
    return prefixedSelector;
  }

  // Strip the leading chain of document-root tokens (e.g. "html body").
  let isDescendant = false;
  while (ROOT_TOKEN_RE.test(sel)) {
    sel = sel.replace(ROOT_TOKEN_RE, "");
    isDescendant = /^\s/.test(sel);
    if (!isDescendant) break;
    sel = sel.trimStart();
  }

  if (sel === "") return prefix;
  if (/^[>+~]/.test(sel)) return `${prefix} ${sel}`;
  if (isDescendant) return `${prefix} ${sel}`;
  return `${prefix}${sel}`;
}

/**
 * Prefix every selector in the paper's CSS with `.paper-root` so the page's
 * styles cannot leak into the site shell. `@media` params are preserved and
 * rules inside `@keyframes` are left untouched.
 */
export async function scopePaperCss(css) {
  try {
    const result = await postcss([
      prefixSelector({
        prefix: PAPER_SCOPE,
        transform: (prefix, selector, prefixedSelector) =>
          scopeSelector(prefix, selector, prefixedSelector),
      }),
    ]).process(css, { from: undefined });
    return result.css;
  } catch (error) {
    throw new ResearchError(`failed to scope CSS: ${error.message}`);
  }
}
