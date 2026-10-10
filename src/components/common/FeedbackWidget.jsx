'use client';

import { useEffect } from 'react';

import { WIDGET_VERSION, widgetUrl } from '@/lib/widget';

const PROJECT_ID =
  process.env.NEXT_PUBLIC_WIDGET_PROJECT_ID || '07916aa1-88ef-44f5-afd7-0703dceb0926';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
const COLOR = process.env.NEXT_PUBLIC_WIDGET_COLOR || '#3B82F6';
const POSITION = process.env.NEXT_PUBLIC_WIDGET_POSITION || 'bottom-right';
const BUTTON_TEXT = process.env.NEXT_PUBLIC_WIDGET_BUTTON_TEXT || 'Feedback';
const ICON = process.env.NEXT_PUBLIC_WIDGET_ICON || 'chat';

// Dogfoods our own widget on every page of the PinPoint app itself.
// Exact equivalent of the raw embed snippet:
//   window.PINPOINT_API_URL = "...";
//   <script src="/widget.js"></script>
//   Feedback.init({ projectId, color, position, buttonText, icon })
export function FeedbackWidget() {
  useEffect(() => {
    if (!PROJECT_ID) return;

    // 1. Same as: window.PINPOINT_API_URL = "..."
    window.PINPOINT_API_URL = API_URL;

    const config = {
      projectId: PROJECT_ID,
      color: COLOR,
      position: POSITION,
      buttonText: BUTTON_TEXT,
      icon: ICON,
    };

    // Self-heal stale widget: widget.js is served immutable, and an older copy
    // may already be loaded in this long-lived tab. Reload when versions differ.
    // eslint-disable-next-line no-underscore-dangle
    if (window.Feedback && window.Feedback.version === WIDGET_VERSION) {
      window.Feedback.init(config);
      return;
    }
    if (window.Feedback) {
      document.querySelectorAll('script[data-pinpoint-widget]').forEach((s) => s.remove());
      delete window.Feedback;
      window._pp_initialized = false;
    }

    let script = document.querySelector('script[data-pinpoint-widget]');
    if (!script) {
      script = document.createElement('script');
      script.src = widgetUrl();
      script.async = true;
      script.dataset.pinpointWidget = 'true';
      script.onload = () => {
        if (window.Feedback) window.Feedback.init(config);
      };
      document.body.appendChild(script);
    } else {
      script.addEventListener(
        'load',
        () => {
          if (window.Feedback) window.Feedback.init(config);
        },
        { once: true }
      );
    }
  }, []);

  return null;
}

export default FeedbackWidget;
