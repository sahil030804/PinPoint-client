(function () {
  'use strict';

  /* ─── Config & State ─── */
  var CONFIG = {};
  var API_BASE = window.PINPOINT_API_URL || 'http://localhost:4000/v1';
  var state = 'idle'; // idle | capturing | form | annotating
  var screenshotData = null;
  var annotationsArr = [];
  var selectedColor = '#FF4444';
  var displayW = 0;
  var displayH = 0;
  var activeDrawing = null;
  var origConsoleError = null;
  var consoleErrors = [];
  var overlayEl = null;
  var modalEl = null;
  var annotatingEl = null;
  var labelPopupEl = null;
  var toastEl = null;
  var buttonEl = null;
var annotateBodyEl = null;
var closeOutHandler = null;
var annotatingColors = ['#FF4444', '#FF8800', '#FFCC00', '#44BB44', '#4488FF', '#AA44FF'];

  /* ─── Init ─── */
  function init(config) {
    CONFIG = {
      projectId: config.projectId,
      color: config.color || '#3B82F6',
      position: config.position || 'bottom-right',
      buttonText: config.buttonText || 'Feedback',
      icon: config.icon || 'chat',
      darkMode: config.darkMode || false,
      whiteLabel: config.whiteLabel || false,
    };
    if (!CONFIG.projectId) { console.error('[PinPoint] Missing projectId'); return; }
    if (window._pp_initialized) return;
    window._pp_initialized = true;

    injectStyles();
    createButton();
    preloadHtmlToImage();
    startConsoleCapture();
    bindGlobalKeys();

    fetch(API_BASE + '/feedback/widget/' + CONFIG.projectId + '/config')
      .then(function (r) { return r.json(); })
      .then(function (body) {
        if (body.success && body.data) CONFIG.whiteLabel = body.data.whiteLabel === true;
      })
      .catch(function () {});
  }

  /* ─── Console Error Capture ─── */
  function startConsoleCapture() {
    origConsoleError = console.error;
    console.error = function () {
      try {
        var msg = Array.prototype.slice.call(arguments).map(function (a) {
          return typeof a === 'object' ? JSON.stringify(a) : String(a);
        }).join(' ');
        consoleErrors.push({ message: msg, time: new Date().toISOString() });
        if (consoleErrors.length > 20) consoleErrors.shift();
      } catch (_) {}
      return origError.apply(console, arguments);
    };
    window.addEventListener('error', function (e) {
      consoleErrors.push({ message: e.message + ' at ' + (e.filename || '') + ':' + (e.lineno || ''), time: new Date().toISOString() });
      if (consoleErrors.length > 20) consoleErrors.shift();
    });
  }

  /* ─── Keyboard Shortcuts ─── */
  function bindGlobalKeys() {
    document.addEventListener('keydown', function (e) {
      if (state === 'form') {
        if (e.key === 'Escape') { cancelForm(); return; }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          var submitBtn = document.getElementById('pp-submit');
          if (submitBtn && !submitBtn.disabled) submitFeedback();
          return;
        }
      }
      if (state === 'annotating') {
        if (e.key === 'Escape') { backToForm(); return; }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          var annSubmit = document.getElementById('pp-annotate-submit');
          if (annSubmit && !annSubmit.disabled) submitFeedback();
          return;
        }
      }
    });
  }

  /* ─── Screenshot Library ─── */
  var _htmlToImageLoaded = false;
  function preloadHtmlToImage() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
    script.onload = function () { _htmlToImageLoaded = true; };
    script.onerror = function () { _htmlToImageLoaded = false; };
    document.head.appendChild(script);
  }

  function takeScreenshot() {
    return new Promise(function (resolve) {
      function doCapture() {
        if (window.htmlToImage) {
          window.htmlToImage.toPng(document.body, { quality: 0.7, pixelRatio: 1.0 })
            .then(function (dataUrl) { resolve(dataUrl); })
            .catch(function () { resolve(null); });
        } else { resolve(null); }
      }
      if (_htmlToImageLoaded) { doCapture(); return; }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
      s.onload = function () { _htmlToImageLoaded = true; doCapture(); };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
  }

  /* ─── CSS Injection ─── */
  function injectStyles() {
    var css = document.createElement('style');
    css.textContent = [
      '/* Reset */',
      '.pp-widget *, .pp-widget *::before, .pp-widget *::after { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; }',

      '/* Floating Button */',
      '.pp-widget-btn { position: fixed; z-index: 2147483645; display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: none; border-radius: 9999px; cursor: pointer; font-size: 14px; font-weight: 600; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.18); transition: transform 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s; letter-spacing: 0.01em; }',
      '.pp-widget-btn:hover { transform: scale(1.06); box-shadow: 0 6px 24px rgba(0,0,0,0.24); }',
      '.pp-widget-btn:active { transform: scale(0.97); }',

      '/* Overlay */',
      '.pp-widget-overlay { position: fixed; inset: 0; z-index: 2147483646; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; animation: ppFadeIn 0.2s ease; }',

      '/* Modal */',
      '.pp-modal { position: fixed; z-index: 2147483647; width: 480px; max-width: calc(100vw - 32px); max-height: calc(100vh - 48px); overflow-y: auto; background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05); animation: ppScaleIn 0.25s cubic-bezier(.4,0,.2,1); }',
      '.pp-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }',
      '.pp-modal-header h3 { font-size: 17px; font-weight: 700; color: #111827; letter-spacing: -0.01em; }',
      '.pp-modal-close { width: 32px; height: 32px; border: none; border-radius: 8px; background: transparent; color: #9ca3af; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: background 0.15s, color 0.15s; }',
      '.pp-modal-close:hover { background: #f3f4f6; color: #374151; }',

      '/* Screenshot Preview */',
      '.pp-screenshot-preview { margin: 16px 24px 0; position: relative; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; background: #f9fafb; cursor: pointer; transition: border-color 0.15s; }',
      '.pp-screenshot-preview:hover { border-color: #93c5fd; }',
      '.pp-screenshot-preview img { display: block; width: 100%; max-height: 180px; object-fit: cover; object-position: top; }',
      '.pp-screenshot-preview .pp-annotate-badge { position: absolute; bottom: 8px; right: 8px; padding: 5px 10px; border-radius: 6px; background: rgba(0,0,0,0.7); color: #fff; font-size: 12px; font-weight: 500; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 4px; pointer-events: none; }',
      '.pp-screenshot-preview .pp-no-screenshot { padding: 32px; text-align: center; color: #9ca3af; font-size: 13px; }',

      '/* Form Body */',
      '.pp-modal-body { padding: 16px 24px 20px; }',
      '.pp-form-group { margin-bottom: 14px; }',
      '.pp-form-group label { display: block; margin-bottom: 5px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }',
      '.pp-form-group input, .pp-form-group textarea, .pp-form-group select { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; outline: none; transition: border-color 0.15s, box-shadow 0.15s; background: #fff; }',
      '.pp-form-group input:focus, .pp-form-group textarea:focus, .pp-form-group select:focus { border-color: ' + CONFIG.color + '; box-shadow: 0 0 0 3px ' + CONFIG.color + '15; }',
      '.pp-form-group textarea { resize: vertical; min-height: 80px; line-height: 1.5; }',
      '.pp-form-group input::placeholder, .pp-form-group textarea::placeholder { color: #d1d5db; }',
      '.pp-form-row { display: flex; gap: 12px; }',
      '.pp-form-row .pp-form-group { flex: 1; }',

      '/* Category & Priority Pills */',
      '.pp-pills { display: flex; gap: 6px; flex-wrap: wrap; }',
      '.pp-pill { padding: 6px 12px; border-radius: 8px; border: 1.5px solid #e5e7eb; background: #fff; font-size: 12px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; user-select: none; }',
      '.pp-pill:hover { border-color: #d1d5db; background: #f9fafb; }',
      '.pp-pill.active { border-color: ' + CONFIG.color + '; background: ' + CONFIG.color + '10; color: ' + CONFIG.color + '; font-weight: 600; }',
      '.pp-pill.active-bug { border-color: #ef4444; background: #fef2f2; color: #ef4444; }',
      '.pp-pill.active-feature { border-color: #3b82f6; background: #eff6ff; color: #3b82f6; }',
      '.pp-pill.active-improvement { border-color: #f59e0b; background: #fffbeb; color: #f59e0b; }',
      '.pp-pill.active-general { border-color: #6b7280; background: #f9fafb; color: #6b7280; }',

      '/* Submit Area */',
      '.pp-submit-area { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; flex-wrap: wrap; gap: 8px; }',
      '@media (max-width: 480px) { .pp-shortcut-hint { display: none; } .pp-submit-area { justify-content: flex-end; } }',
      '.pp-submit-btn { padding: 10px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer; transition: opacity 0.15s, transform 0.1s; letter-spacing: 0.01em; }',
      '.pp-submit-btn:hover { opacity: 0.9; }',
      '.pp-submit-btn:active { transform: scale(0.98); }',
      '.pp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }',
      '.pp-shortcut-hint { font-size: 11px; color: #9ca3af; }',
      '.pp-shortcut-hint kbd { padding: 1px 5px; border-radius: 4px; border: 1px solid #e5e7eb; background: #f9fafb; font-size: 11px; font-family: inherit; }',

      /* Cancel */
      '.pp-cancel-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; color: #6b7280; background: transparent; cursor: pointer; transition: background 0.15s; }',
      '.pp-cancel-btn:hover { background: #f3f4f6; }',

      /* Branding */
      '.pp-branding { text-align: center; padding: 0 24px 16px; font-size: 11px; color: #d1d5db; }',
      '.pp-branding a { color: #9ca3af; text-decoration: none; }',
      '.pp-branding a:hover { color: #6b7280; }',

      /* Toast */
      '.pp-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 2147483647; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.15); animation: ppFadeUp 0.3s ease; display: flex; align-items: center; gap: 8px; }',
      '.pp-toast-success { background: #059669; color: #fff; }',
      '.pp-toast-error { background: #dc2626; color: #fff; }',

      /* Annotations Overlay */
      '.pp-annotate-overlay { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.88); display: flex; flex-direction: column; animation: ppFadeIn 0.2s ease; }',
      '.pp-annotate-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; flex-shrink: 0; }',
      '.pp-annotate-header h3 { color: #fff; font-size: 16px; font-weight: 600; }',
      '.pp-annotate-body { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 16px; cursor: crosshair; }',
      '.pp-annotate-image-wrap { position: relative; display: inline-block; line-height: 0; }',
      '.pp-annotate-image-wrap img { display: block; max-width: 85vw; max-height: calc(100vh - 160px); object-fit: contain; border-radius: 8px; }',
      '.pp-annotate-svg { position: absolute; inset: 0; pointer-events: none; }',
      '.pp-annotate-svg rect { pointer-events: auto; cursor: pointer; }',
      '.pp-annotate-toolbar { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; background: rgba(0,0,0,0.6); flex-shrink: 0; }',
      '.pp-annotate-color { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.1s, border-color 0.1s; }',
      '.pp-annotate-color:hover { transform: scale(1.1); }',
      '.pp-annotate-color.active { border-color: #fff; transform: scale(1.15); }',
      '.pp-annotate-sep { width: 1px; height: 22px; background: rgba(255,255,255,0.2); margin: 0 4px; }',
      '.pp-annotate-count { color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500; }',
      '.pp-annotate-btn { padding: 8px 18px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }',
      '.pp-annotate-btn-primary { background: ' + CONFIG.color + '; color: #fff; }',
      '.pp-annotate-btn-primary:hover { opacity: 0.9; }',
      '.pp-annotate-btn-primary:disabled { opacity: 0.5; cursor: default; }',
      '.pp-annotate-btn-secondary { background: rgba(255,255,255,0.12); color: #fff; }',
      '.pp-annotate-btn-secondary:hover { background: rgba(255,255,255,0.2); }',

      /* Label Popup */
      '.pp-label-popup { position: fixed; z-index: 2147483647; background: #1f2937; border-radius: 10px; padding: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 8px; animation: ppScaleIn 0.15s ease; }',
      '.pp-label-popup input { background: #374151; border: 1px solid #4b5563; border-radius: 6px; padding: 8px 10px; font-size: 13px; color: #fff; width: 200px; outline: none; pointer-events: auto; }',
      '.pp-label-popup input:focus { border-color: #3B82F6; }',
      '.pp-label-popup button { background: #3B82F6; color: #fff; border: none; border-radius: 6px; padding: 6px 10px; font-size: 14px; cursor: pointer; pointer-events: auto; }',

      /* Dark Mode */
      '.pp-dark .pp-modal { background: #1f2937; }',
      '.pp-dark .pp-modal-header h3 { color: #f9fafb; }',
      '.pp-dark .pp-modal-close:hover { background: #374151; color: #d1d5db; }',
      '.pp-dark .pp-form-group label { color: #9ca3af; }',
      '.pp-dark .pp-form-group input, .pp-dark .pp-form-group textarea, .pp-dark .pp-form-group select { background: #374151; border-color: #4b5563; color: #f9fafb; }',
      '.pp-dark .pp-form-group input::placeholder, .pp-dark .pp-form-group textarea::placeholder { color: #6b7280; }',
      '.pp-dark .pp-pill { border-color: #4b5563; background: #374151; color: #9ca3af; }',
      '.pp-dark .pp-pill:hover { background: #4b5563; }',
      '.pp-dark .pp-cancel-btn:hover { background: #374151; color: #d1d5db; }',
      '.pp-dark .pp-screenshot-preview { border-color: #4b5563; background: #374151; }',
      '.pp-dark .pp-shortcut-hint kbd { border-color: #4b5563; background: #374151; color: #9ca3af; }',

      /* Animations */
      '@keyframes ppFadeIn { from { opacity: 0; } to { opacity: 1; } }',
      '@keyframes ppFadeUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }',
      '@keyframes ppScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }',
      '@keyframes ppPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }',
    ].join('\n');
    document.head.appendChild(css);
  }

  /* ─── Button ─── */
  function createButton() {
    buttonEl = document.createElement('div');
    buttonEl.className = 'pp-widget pp-widget-btn';
    buttonEl.style.backgroundColor = CONFIG.color;
    applyPosition(buttonEl, CONFIG.position);
    buttonEl.innerHTML = getIcon(CONFIG.icon) + '<span>' + CONFIG.buttonText + '</span>';
    buttonEl.addEventListener('click', startCapture);
    document.body.appendChild(buttonEl);
  }

  function applyPosition(el, pos) {
    var sides = pos.split('-');
    el.style[sides[0]] = '24px';
    el.style[sides[1]] = '24px';
  }

  function getIcon(icon) {
    switch (icon) {
      case 'bug': return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>';
      case 'feedback': return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
      default: return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    }
  }

  /* ─── Step 1: Instant Screenshot ─── */
  function startCapture() {
    if (state !== 'idle') return;
    state = 'capturing';
    buttonEl.style.display = 'none';

    // Show capturing indicator
    var indicator = document.createElement('div');
    indicator.className = 'pp-widget pp-toast pp-toast-success';
    indicator.id = 'pp-capturing-indicator';
    indicator.innerHTML = '📸 Capturing...';
    indicator.style.background = CONFIG.color;
    document.body.appendChild(indicator);

    takeScreenshot().then(function (dataUrl) {
      var ind = document.getElementById('pp-capturing-indicator');
      if (ind) ind.remove();
      screenshotData = dataUrl;
      state = 'idle';
      if (screenshotData) {
        showAnnotator();
      } else {
        showForm();
      }
    });
  }

  /* ─── Step 2: Feedback Modal ─── */
  function showForm() {
    state = 'form';
    var isDark = CONFIG.darkMode || window.matchMedia('(prefers-color-scheme: dark)').matches;
    var saved = getSavedUserInfo();

    // Overlay
    overlayEl = document.createElement('div');
    overlayEl.className = 'pp-widget pp-widget-overlay' + (isDark ? ' pp-dark' : '');
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) cancelForm();
    });
    document.body.appendChild(overlayEl);

    // Modal
    modalEl = document.createElement('div');
    modalEl.className = 'pp-widget pp-modal' + (isDark ? ' pp-dark' : '');
    modalEl.style.borderTop = '3px solid ' + CONFIG.color;
    overlayEl.appendChild(modalEl);

    var badgeText = annotationsArr.length > 0
      ? '✏️ ' + annotationsArr.length + ' annotation' + (annotationsArr.length !== 1 ? 's' : '')
      : '✏️ Annotate';
    var screenshotHtml = screenshotData
      ? '<div class="pp-screenshot-preview" id="pp-screenshot-click">' +
        '<img src="' + screenshotData + '" alt="Screenshot" />' +
        '<div class="pp-annotate-badge">' + badgeText + '</div>' +
        '</div>'
      : '<div class="pp-screenshot-preview"><div class="pp-no-screenshot">Screenshot could not be captured</div></div>';

    modalEl.innerHTML = [
      '<div class="pp-modal-header">',
      '  <h3>Send Feedback</h3>',
      '  <button class="pp-modal-close" id="pp-modal-close">✕</button>',
      '</div>',
      screenshotHtml,
      '<div class="pp-modal-body">',
      '  <div class="pp-form-group">',
      '    <label>Description *</label>',
      '    <textarea id="pp-comment" placeholder="Describe the issue or feedback..." required></textarea>',
      '  </div>',
      '  <div class="pp-form-row">',
      '    <div class="pp-form-group">',
      '      <label>Category</label>',
      '      <div class="pp-pills" id="pp-category-pills">',
      '        <div class="pp-pill active active-bug" data-value="bug">🐛 Bug</div>',
      '        <div class="pp-pill" data-value="feature">✨ Feature</div>',
      '        <div class="pp-pill" data-value="improvement">⚡ Improvement</div>',
      '        <div class="pp-pill" data-value="general">💬 General</div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="pp-form-row">',
      '    <div class="pp-form-group">',
      '      <label>Priority</label>',
      '      <div class="pp-pills" id="pp-priority-pills">',
      '        <div class="pp-pill" data-value="low">🟢 Low</div>',
      '        <div class="pp-pill active" data-value="medium">🟡 Medium</div>',
      '        <div class="pp-pill" data-value="high">🔴 High</div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="pp-form-row">',
      '    <div class="pp-form-group">',
      '      <label>Name</label>',
      '      <input id="pp-name" type="text" placeholder="Your name" value="' + escapeHtml(saved.name || '') + '" />',
      '    </div>',
      '    <div class="pp-form-group">',
      '      <label>Email</label>',
      '      <input id="pp-email" type="email" placeholder="you@example.com" value="' + escapeHtml(saved.email || '') + '" />',
      '    </div>',
      '  </div>',
      '  <div class="pp-submit-area">',
      '    <button class="pp-cancel-btn" id="pp-cancel">Cancel</button>',
      '    <div style="display:flex;align-items:center;gap:12px">',
      '      <span class="pp-shortcut-hint">⌘<kbd>Enter</kbd> to submit</span>',
      '      <button class="pp-submit-btn" id="pp-submit" style="background:' + CONFIG.color + '">Submit Feedback</button>',
      '    </div>',
      '  </div>',
      '</div>',
      (CONFIG.whiteLabel ? '' : '<div class="pp-branding"><a href="https://pinpoint.com" target="_blank" rel="noopener">Powered by PinPoint</a></div>'),
    ].join('');

    // Events
    document.getElementById('pp-comment').focus();
    document.getElementById('pp-modal-close').addEventListener('click', cancelForm);
    document.getElementById('pp-cancel').addEventListener('click', cancelForm);
    document.getElementById('pp-submit').addEventListener('click', submitFeedback);

    // Screenshot click → annotate
    var preview = document.getElementById('pp-screenshot-click');
    if (preview) {
      preview.addEventListener('click', function () {
        if (screenshotData) showAnnotator();
      });
    }

    // Category pills
    setupPills('pp-category-pills', 'bug');
    // Priority pills
    setupPills('pp-priority-pills', 'medium');
  }

  function setupPills(containerId, defaultVal) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var pills = container.querySelectorAll('.pp-pill');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active', 'active-bug', 'active-feature', 'active-improvement', 'active-general'); });
        pill.classList.add('active');
        var val = pill.getAttribute('data-value');
        if (containerId === 'pp-category-pills') {
          pill.classList.add('active-' + val);
        }
        // Store selection
        container.setAttribute('data-selected', val);
      });
    });
    container.setAttribute('data-selected', defaultVal);
  }

  function getSelectedPillValue(containerId) {
    var c = document.getElementById(containerId);
    return c ? c.getAttribute('data-selected') || '' : '';
  }

  function cancelForm() {
    cleanupForm();
    resetToIdle();
  }

  function cleanupForm() {
    if (overlayEl) { overlayEl.remove(); overlayEl = null; }
    modalEl = null;
  }

  function resetToIdle() {
    state = 'idle';
    screenshotData = null;
    annotationsArr = [];
    if (buttonEl) buttonEl.style.display = 'flex';
  }

  /* ─── Step 3: Annotations ─── */
  function showAnnotator() {
    state = 'annotating';
    annotationsArr = [];
    activeDrawing = null;
    displayW = 0;
    displayH = 0;

    // Hide modal
    if (modalEl) modalEl.style.display = 'none';

    annotatingEl = document.createElement('div');
    annotatingEl.className = 'pp-widget pp-annotate-overlay';
    annotatingEl.innerHTML = [
      '<div class="pp-annotate-header">',
      '  <button class="pp-annotate-btn pp-annotate-btn-secondary" id="pp-annotate-back">← Back</button>',
      '  <h3>Annotate Screenshot</h3>',
      '  <button class="pp-annotate-btn pp-annotate-btn-primary" id="pp-annotate-submit">Done</button>',
      '</div>',
      '<div class="pp-annotate-body" id="pp-annotate-body">',
      '  <div class="pp-annotate-image-wrap" id="pp-annotate-wrap">',
      '    <img id="pp-annotate-img" src="' + screenshotData + '" alt="Screenshot" />',
      '    <div id="pp-annotate-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);color:#fff;font-size:16px;font-weight:500;pointer-events:none;">Loading screenshot...</div>',
      '    <svg class="pp-annotate-svg" id="pp-annotate-svg"></svg>',
      '  </div>',
      '</div>',
      '<div class="pp-annotate-toolbar" id="pp-annotate-toolbar"></div>',
    ].join('');

    document.body.appendChild(annotatingEl);

    // Toolbar
    var toolbar = document.getElementById('pp-annotate-toolbar');
    annotatingColors.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'pp-annotate-color' + (c === selectedColor ? ' active' : '');
      btn.style.backgroundColor = c;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        selectedColor = c;
        toolbar.querySelectorAll('.pp-annotate-color').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
      toolbar.appendChild(btn);
    });

    var sep = document.createElement('span');
    sep.className = 'pp-annotate-sep';
    toolbar.appendChild(sep);

    var countEl = document.createElement('span');
    countEl.className = 'pp-annotate-count';
    countEl.id = 'pp-annotate-count';
    countEl.textContent = '0 annotations';
    toolbar.appendChild(countEl);

    function setupAnnotator() {
      var img = document.getElementById('pp-annotate-img');
      if (!img) return;

      var naturalW = img.naturalWidth;
      var naturalH = img.naturalHeight;
      if (!naturalW || !naturalH) return;

      // Calculate display size to fit viewport
      var bodyEl = document.getElementById('pp-annotate-body');
      if (!bodyEl) return;
      var bodyRect = bodyEl.getBoundingClientRect();
      var maxW = bodyRect.width * 0.95;
      var maxH = bodyRect.height * 0.95;
      var scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
      displayW = Math.round(naturalW * scale);
      displayH = Math.round(naturalH * scale);

      // Set explicit dimensions on img (override CSS max-width/object-fit)
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      img.style.objectFit = 'none';
      img.style.width = displayW + 'px';
      img.style.height = displayH + 'px';

      // Match SVG to img
      var svg = document.getElementById('pp-annotate-svg');
      if (svg) {
        svg.setAttribute('width', displayW);
        svg.setAttribute('height', displayH);
        svg.style.width = displayW + 'px';
        svg.style.height = displayH + 'px';
      }

      // Remove loading overlay
      var loading = document.getElementById('pp-annotate-loading');
      if (loading) loading.remove();

      // Show toolbar
      var tb = document.getElementById('pp-annotate-toolbar');
      if (tb) tb.style.opacity = '1';

      // Attach drawing events
      annotateBodyEl = document.getElementById('pp-annotate-body');
      if (annotateBodyEl) {
        annotateBodyEl.addEventListener('mousedown', onAnnotateMouseDown);
      }
      document.addEventListener('mousemove', onAnnotateMouseMove);
      document.addEventListener('mouseup', onAnnotateMouseUp);
    }

    var img = document.getElementById('pp-annotate-img');
    if (img.complete && img.naturalWidth > 0) {
      setupAnnotator();
    } else {
      img.onload = setupAnnotator;
    }
    img.onerror = function () {
      cleanupAnnotator();
      showForm();
    };

    document.getElementById('pp-annotate-back').addEventListener('click', function (e) {
      e.stopPropagation();
      backToForm();
    });
    document.getElementById('pp-annotate-submit').addEventListener('click', function (e) {
      e.stopPropagation();
      backToForm();
    });
  }

  function backToForm() {
    cleanupAnnotator();
    if (modalEl) {
      modalEl.style.display = '';
      state = 'form';
    } else {
      showForm();
    }
  }

  function cleanupAnnotator() {
    closeLabelPopup();
    if (annotateBodyEl) { annotateBodyEl.removeEventListener('mousedown', onAnnotateMouseDown); annotateBodyEl = null; }
    if (annotatingEl) { annotatingEl.remove(); annotatingEl = null; }
    document.removeEventListener('mousemove', onAnnotateMouseMove);
    document.removeEventListener('mouseup', onAnnotateMouseUp);
  }

  function getAnnotateFraction(clientX, clientY) {
    var wrap = document.getElementById('pp-annotate-wrap');
    if (!wrap) return null;
    var r = wrap.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  }

  function onAnnotateMouseDown(e) {
    e.stopPropagation();
    closeLabelPopup();

    var frac = getAnnotateFraction(e.clientX, e.clientY);
    if (!frac) return;

    // Check if clicking existing annotation → delete it
    var clicked = annotationsArr.find(function (a) {
      return frac.x >= a.x && frac.x <= a.x + a.width && frac.y >= a.y && frac.y <= a.y + a.height;
    });
    if (clicked) {
      annotationsArr = annotationsArr.filter(function (a) { return a.id !== clicked.id; });
      renderAnnotations();
      return;
    }

    activeDrawing = { startX: frac.x, startY: frac.y, currentX: frac.x, currentY: frac.y };
  }

  function onAnnotateMouseMove(e) {
    if (!activeDrawing) return;
    var frac = getAnnotateFraction(e.clientX, e.clientY);
    if (!frac) return;
    activeDrawing.currentX = frac.x;
    activeDrawing.currentY = frac.y;
    renderAnnotationPreview();
  }

  function onAnnotateMouseUp(e) {
    if (!activeDrawing) return;
    var x = Math.min(activeDrawing.startX, activeDrawing.currentX);
    var y = Math.min(activeDrawing.startY, activeDrawing.currentY);
    var w = Math.abs(activeDrawing.currentX - activeDrawing.startX);
    var h = Math.abs(activeDrawing.currentY - activeDrawing.startY);

    if (w > 0.008 && h > 0.008) {
      var id = Math.random().toString(36).substring(2, 9);
      var ann = { id: id, x: x, y: y, width: w, height: h, color: selectedColor, label: '' };
      annotationsArr.push(ann);
      renderAnnotations();
      showLabelPopup(id);
    }

    activeDrawing = null;
    clearAnnotationPreview();
  }

  function closeLabelPopup() {
    if (closeOutHandler) { document.removeEventListener('mousedown', closeOutHandler); closeOutHandler = null; }
    if (labelPopupEl) { labelPopupEl.remove(); labelPopupEl = null; }
  }

  function showLabelPopup(annId) {
    closeLabelPopup();
    var ann = annotationsArr.find(function (a) { return a.id === annId; });
    if (!ann) return;

    var wrap = document.getElementById('pp-annotate-wrap');
    if (!wrap) return;
    var r = wrap.getBoundingClientRect();
    var cx = r.left + displayW * (ann.x + ann.width / 2);
    var cy = r.top + displayH * (ann.y + ann.height / 2);

    labelPopupEl = document.createElement('div');
    labelPopupEl.className = 'pp-widget pp-label-popup';
    labelPopupEl.innerHTML = '<input id="pp-label-input" type="text" placeholder="Describe this area..." maxlength="200" /><button id="pp-label-save">✓</button>';

    labelPopupEl.style.left = Math.min(Math.max(cx - 130, 16), window.innerWidth - 260) + 'px';
    labelPopupEl.style.top = Math.min(cy + 24, window.innerHeight - 80) + 'px';
    document.body.appendChild(labelPopupEl);

    var input = document.getElementById('pp-label-input');
    input.focus();

    function saveLabel() {
      ann.label = input.value.trim();
      closeLabelPopup();
      renderAnnotations();
    }

    document.getElementById('pp-label-save').addEventListener('click', function (e) {
      e.stopPropagation();
      saveLabel();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveLabel(); }
      if (e.key === 'Escape') { closeLabelPopup(); }
    });

    setTimeout(function () {
      function closeOut(e) {
        if (labelPopupEl && !labelPopupEl.contains(e.target)) {
          saveLabel();
        }
      }
      closeOutHandler = closeOut;
      document.addEventListener('mousedown', closeOut);
    }, 0);
  }

  function renderAnnotations() {
    var svg = document.getElementById('pp-annotate-svg');
    if (!svg || !displayW || !displayH) return;

    svg.setAttribute('width', displayW);
    svg.setAttribute('height', displayH);
    svg.style.width = displayW + 'px';
    svg.style.height = displayH + 'px';
    svg.innerHTML = '';

    annotationsArr.forEach(function (a, i) {
      var x = a.x * displayW;
      var y = a.y * displayH;
      var rw = Math.max(2, a.width * displayW);
      var rh = Math.max(2, a.height * displayH);

      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', rw);
      rect.setAttribute('height', rh);
      rect.setAttribute('fill', a.color);
      rect.setAttribute('fill-opacity', '0.15');
      rect.setAttribute('stroke', a.color);
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('rx', '4');
      rect.style.cursor = 'pointer';

      // Number label
      var numBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      numBg.setAttribute('x', x);
      numBg.setAttribute('y', y - 18);
      numBg.setAttribute('width', 20);
      numBg.setAttribute('height', 18);
      numBg.setAttribute('rx', 4);
      numBg.setAttribute('fill', a.color);
      svg.appendChild(numBg);

      var numText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      numText.setAttribute('x', x + 10);
      numText.setAttribute('y', y - 5);
      numText.setAttribute('text-anchor', 'middle');
      numText.setAttribute('fill', '#fff');
      numText.setAttribute('font-size', '11');
      numText.setAttribute('font-weight', '700');
      numText.textContent = String(i + 1);
      svg.appendChild(numText);

      if (a.label) {
        var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = a.label;
        rect.appendChild(title);
      }
      svg.appendChild(rect);
    });

    var countEl = document.getElementById('pp-annotate-count');
    if (countEl) {
      countEl.textContent = annotationsArr.length + ' annotation' + (annotationsArr.length !== 1 ? 's' : '');
    }
  }

  function renderAnnotationPreview() {
    if (!activeDrawing || !displayW || !displayH) return;
    var svg = document.getElementById('pp-annotate-svg');
    if (!svg) return;

    var rect = svg.querySelector('.pp-drawing-preview');
    if (!rect) {
      rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('class', 'pp-drawing-preview');
      svg.appendChild(rect);
    }

    var x = Math.min(activeDrawing.startX, activeDrawing.currentX) * displayW;
    var y = Math.min(activeDrawing.startY, activeDrawing.currentY) * displayH;
    var rw = Math.abs(activeDrawing.currentX - activeDrawing.startX) * displayW;
    var rh = Math.abs(activeDrawing.currentY - activeDrawing.startY) * displayH;

    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(2, rw));
    rect.setAttribute('height', Math.max(2, rh));
    rect.setAttribute('fill', selectedColor);
    rect.setAttribute('fill-opacity', '0.2');
    rect.setAttribute('stroke', selectedColor);
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('stroke-dasharray', '6 3');
    rect.setAttribute('rx', '4');
  }

  function clearAnnotationPreview() {
    var svg = document.getElementById('pp-annotate-svg');
    if (!svg) return;
    var prev = svg.querySelector('.pp-drawing-preview');
    if (prev) prev.remove();
  }

  /* ─── Submit ─── */
  function submitFeedback() {
    var comment = document.getElementById('pp-comment');
    if (!comment || !comment.value.trim()) {
      if (comment) comment.focus();
      return;
    }

    var btn = document.getElementById('pp-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

    // Save user info
    var nameVal = (document.getElementById('pp-name') || {}).value || '';
    var emailVal = (document.getElementById('pp-email') || {}).value || '';
    saveUserInfo(nameVal, emailVal);

    var body = buildFeedbackBody(comment.value.trim(), nameVal, emailVal);
    sendToApi(body, function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Feedback'; }
    });
  }

  function buildFeedbackBody(comment, name, email) {
    var title = comment.length > 100 ? comment.slice(0, 97) + '...' : comment;
    var body = {
      comment: comment,
      title: title,
      pageUrl: window.location.href,
      metadata: collectMetadata(),
      category: getSelectedPillValue('pp-category-pills') || 'bug',
      priority: getSelectedPillValue('pp-priority-pills') || 'medium',
      consoleErrors: consoleErrors.length > 0 ? consoleErrors.slice(-10) : undefined,
    };
    if (name) body.reporterName = name;
    if (email) body.reporterEmail = email;
    if (screenshotData) body.screenshot = screenshotData;
    if (annotationsArr.length > 0) body.annotations = annotationsArr;
    return body;
  }

  async function sendToApi(body, onError) {
    try {
      var res = await fetch(API_BASE + '/widget/' + CONFIG.projectId + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (data.success) {
        cleanupAnnotator();
        cleanupForm();
        showToast('Feedback submitted! Thank you 🎉', 'success');
        resetToIdle();
        return;
      }
      showToast(data.error?.message || 'Submission failed', 'error');
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    }
    if (onError) onError();
  }

  /* ─── Metadata ─── */
  function collectMetadata() {
    var ua = navigator.userAgent;
    return {
      browser: getBrowser(ua),
      os: getOS(ua),
      screenResolution: screen.width + 'x' + screen.height,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      deviceType: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop',
      referrer: document.referrer || '',
      url: window.location.href,
      cookiesEnabled: navigator.cookieEnabled,
      darkMode: CONFIG.darkMode || window.matchMedia('(prefers-color-scheme: dark)').matches,
    };
  }

  function getBrowser(ua) {
    if (ua.includes('Edg')) return 'Edge ' + (ua.match(/Edg\/([\d.]+)/) || [])[1];
    if (ua.includes('Chrome')) return 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/) || [])[1];
    if (ua.includes('Firefox')) return 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/) || [])[1];
    if (ua.includes('Safari')) return 'Safari ' + (ua.match(/Version\/([\d.]+)/) || [])[1];
    return 'Unknown';
  }

  function getOS(ua) {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  /* ─── localStorage ─── */
  function getSavedUserInfo() {
    try {
      var raw = localStorage.getItem('pp_user_info');
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }

  function saveUserInfo(name, email) {
    try {
      if (name || email) {
        localStorage.setItem('pp_user_info', JSON.stringify({ name: name, email: email }));
      }
    } catch (_) {}
  }

  /* ─── Toast ─── */
  function showToast(message, type) {
    if (toastEl) { toastEl.remove(); toastEl = null; }
    toastEl = document.createElement('div');
    toastEl.className = 'pp-widget pp-toast pp-toast-' + type;
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(function () {
      if (toastEl) { toastEl.remove(); toastEl = null; }
    }, 3500);
  }

  /* ─── Utils ─── */
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.Feedback = { init: init };
})();
