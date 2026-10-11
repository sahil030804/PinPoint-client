// Single source of truth for the embeddable widget version + URL.
// Bump WIDGET_VERSION on every public/widget.js change: widget.js is served
// immutable (max-age=1y), so the query string is the only cache-buster.
// window.Feedback.version in widget.js must always equal WIDGET_VERSION.
export const WIDGET_VERSION = '7';

export function widgetUrl() {
  // Prefer an explicit widget host; otherwise fall back to this app's own
  // public origin so the embed snippet always points at an absolute URL
  // (a relative "/widget.js" only works when the host site serves it, which
  // it never does).
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const base =
    process.env.NEXT_PUBLIC_WIDGET_URL ||
    (site ? `${site.replace(/\/$/, '')}/widget.js` : '/widget.js');
  return `${base}?v=${WIDGET_VERSION}`;
}
