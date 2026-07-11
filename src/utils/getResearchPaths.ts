import { getRelativeLocaleUrl } from "astro:i18n";
import config from "@/config";

/**
 * Returns a fully navigable URL for a research page from its collection entry
 * id (`topic[/series]/slug`), applying locale routing and the Astro base.
 * e.g. `/research/nlp/transformer/attention-is-all-you-need`
 */
export function getResearchUrl(
  id: string,
  locale: string | undefined = config.site.lang
): string {
  return getRelativeLocaleUrl(locale, `research/${id}`);
}
