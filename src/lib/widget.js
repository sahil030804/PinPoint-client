// Single source of truth for the embeddable widget version + URL.
// Bump WIDGET_VERSION on every public/widget.js change: widget.js is served
// immutable (max-age=1y), so the query string is the only cache-buster.
// window.Feedback.version in widget.js must always equal WIDGET_VERSION.
export const WIDGET_VERSION = '6';

export function widgetUrl() {
  const base = process.env.NEXT_PUBLIC_WIDGET_URL || '/widget.js';
  return `${base}?v=${WIDGET_VERSION}`;
}
