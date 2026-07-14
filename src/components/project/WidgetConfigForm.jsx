'use client';

import { useState, useEffect } from 'react';
import { RadixSelect } from '@/components/common/RadixSelect';

const POSITIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
];

const ICONS = [
  { value: 'chat', label: 'Chat Bubble 💬' },
  { value: 'bug', label: 'Bug 🐛' },
  { value: 'feedback', label: 'Feedback 📝' },
];

function WidgetConfigForm({ website, onSave }) {
  const [color, setColor] = useState('#3B82F6');
  const [position, setPosition] = useState('bottom-right');
  const [buttonText, setButtonText] = useState('Feedback');
  const [icon, setIcon] = useState('chat');
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (website?.widgetConfig) {
      const cfg = website.widgetConfig;
      setColor(cfg.color || '#3B82F6');
      setPosition(cfg.position || 'bottom-right');
      setButtonText(cfg.buttonText || 'Feedback');
      setIcon(cfg.icon || 'chat');
      setDarkMode(cfg.darkMode || false);
    }
  }, [website]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await onSave(website.id, {
        widgetConfig: { color, position, buttonText, icon, darkMode },
      });
      setMessage('Widget settings saved successfully.');
    } catch (err) {
      setMessage(err.message || 'Failed to save widget settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Button Color</label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-[3px] border border-gray-300 p-0.5 dark:border-gray-600"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">{color}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
          <RadixSelect
            value={position}
            onChange={setPosition}
            options={POSITIONS}
            triggerClassName="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Button Text</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            maxLength={50}
            className="mt-1 block w-full rounded-[3px] border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
          <RadixSelect
            value={icon}
            onChange={setIcon}
            options={ICONS}
            triggerClassName="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            darkMode ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {darkMode ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {message && (
        <div className={`rounded-[3px] p-3 text-sm ${
          message.includes('successfully')
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-[3px] bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 active:scale-[0.97] transition-transform"
      >
        {saving ? 'Saving...' : 'Save Widget Settings'}
      </button>
    </form>
  );
}

export default WidgetConfigForm;
