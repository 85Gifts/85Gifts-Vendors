/**
 * Builds a CSS `url(...)` value that safely handles data URIs and URLs with
 * quotes or parentheses.
 */
export function cssBackgroundImage(url: string): string {
  return `url("${url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`
}
