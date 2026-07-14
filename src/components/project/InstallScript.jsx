'use client';

import { useState } from 'react';

const WIDGET_URL = process.env.NEXT_PUBLIC_WIDGET_URL || '/widget.js';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

function InstallScript({ projectId, widgetConfig = {} }) {
  const [copied, setCopied] = useState(false);

  const config = {
    color: '#3B82F6',
    position: 'bottom-right',
    buttonText: 'Feedback',
    icon: 'chat',
    ...widgetConfig,
  };

  const snippet = `<script>
window.PINPOINT_API_URL = "${API_URL}";
</script>
<script src="${WIDGET_URL}"></script>
<script>
  Feedback.init({
    projectId: "${projectId}",
    color: "${config.color}",
    position: "${config.position}",
    buttonText: "${config.buttonText}",
    icon: "${config.icon}"
  });
</script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = snippet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Paste this snippet just before the closing <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">&lt;/body&gt;</code> tag on your website.
      </p>

      <div className="relative">
        <pre className="overflow-x-auto rounded-[3px] border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900">
          <code className="text-gray-800 dark:text-gray-200">{snippet}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 rounded-[3px] border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="rounded-[3px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview</p>
        <div className="relative mt-4 flex h-48 items-center justify-center rounded-[3px] border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-400">Your website preview area</p>
          <button
            className="absolute flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
            style={{
              backgroundColor: config.color || '#3B82F6',
              ...(config.position === 'bottom-right' ? { bottom: '16px', right: '16px' } : {}),
              ...(config.position === 'bottom-left' ? { bottom: '16px', left: '16px' } : {}),
              ...(config.position === 'top-right' ? { top: '16px', right: '16px' } : {}),
              ...(config.position === 'top-left' ? { top: '16px', left: '16px' } : {}),
            }}
          >
            {config.icon === 'chat' && '💬'}
            {config.icon === 'bug' && '🐛'}
            {config.icon === 'feedback' && '📝'}
            {config.buttonText || 'Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallScript;
