/**
 * Type shim for `katex/contrib/auto-render` — the katex package exports this
 * subpath without a declaration file (only the core `katex` entry is typed).
 */
declare module "katex/contrib/auto-render" {
  import type { KatexOptions } from "katex";

  export type AutoRenderDelimiter = {
    left: string;
    right: string;
    display: boolean;
  };

  export type AutoRenderOptions = KatexOptions & {
    delimiters?: AutoRenderDelimiter[];
    ignoredTags?: string[];
    ignoredClasses?: string[];
    errorCallback?: (message: string, error: Error) => void;
    preProcess?: (math: string) => string;
  };

  export default function renderMathInElement(
    element: HTMLElement,
    options?: AutoRenderOptions
  ): void;
}
