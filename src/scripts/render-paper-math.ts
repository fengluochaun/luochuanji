/**
 * Client-side KaTeX auto-render for imported research pages.
 *
 * Scoped to the `.paper-root` container only — site content outside the paper
 * is never touched. Delimiters mirror the paper2html cheatsheet template's
 * own bootstrap script (which the importer strips), so formulas written for
 * the standalone page render identically in-site, with KaTeX served locally
 * instead of from a CDN.
 */
import renderMathInElement from "katex/contrib/auto-render";

function renderPaperMath(): void {
  const paperRoot = document.querySelector(".paper-root");
  if (!(paperRoot instanceof HTMLElement)) return;

  renderMathInElement(paperRoot, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false },
    ],
    throwOnError: false,
  });
}

renderPaperMath();

// Re-render after View Transitions navigation (no-op on non-paper pages).
document.addEventListener("astro:after-swap", renderPaperMath);
