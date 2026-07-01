(function () {
  'use strict';

  var CONFIG = {};
  var API_BASE = window.PINPOINT_API_URL || 'http://localhost:4000/v1';
  var state = 'idle'; // idle | pinning | form | annotating
  var pin = { x: 0, y: 0, element: '' };
  var overlayEl = null;
  var pinMarkerEl = null;
  var formEl = null;
  var toastEl = null;
  var buttonEl = null;
  var annotationsArr = [];
  var selectedColor = '#FF4444';
  var activeDrawing = null;
  var screenshotData = null;
  var annotatingEl = null;
  var annotatingSvg = null;
  var annotatingColors = ['#FF4444', '#FF8800', '#FFCC00', '#44BB44', '#4488FF', '#AA44FF'];
  var labelPopupEl = null;
  var savedFormData = {};

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

    if (!CONFIG.projectId) {
      console.error('[PinPoint] Missing projectId');
      return;
    }

    injectStyles();
    createButton();

    fetch(API_BASE + '/feedback/widget/' + CONFIG.projectId + '/config')
      .then(function (r) { return r.json(); })
      .then(function (body) {
        if (body.success && body.data) {
          CONFIG.whiteLabel = body.data.whiteLabel === true;
        }
      })
      .catch(function () {});
  }

  function injectStyles() {
    var css = document.createElement('style');
    css.textContent = [
      '.pp-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
      '.pp-widget-btn { position: fixed; z-index: 2147483645; display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: none; border-radius: 9999px; cursor: pointer; font-size: 14px; font-weight: 500; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.15s, box-shadow 0.15s; }',
      '.pp-widget-btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }',
      '.pp-widget-overlay { position: fixed; inset: 0; z-index: 2147483646; background: rgba(0,0,0,0.3); cursor: crosshair; }',
      '.pp-widget-pin { position: fixed; z-index: 2147483647; width: 32px; height: 32px; transform: translate(-50%, -50%); pointer-events: none; }',
      '.pp-widget-pin svg { width: 100%; height: 100%; }',
      '.pp-widget-form { position: fixed; z-index: 2147483647; width: 380px; max-width: calc(100vw - 32px); background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.2); padding: 24px; font-size: 14px; }',
      '.pp-widget-form h3 { margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111; }',
      '.pp-widget-form label { display: block; margin-bottom: 4px; font-size: 12px; font-weight: 500; color: #555; }',
      '.pp-widget-form input, .pp-widget-form textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; color: #111; outline: none; transition: border-color 0.15s; }',
      '.pp-widget-form input:focus, .pp-widget-form textarea:focus { border-color: ' + CONFIG.color + '; }',
      '.pp-widget-form textarea { resize: vertical; min-height: 80px; }',
      '.pp-widget-form .pp-row { margin-bottom: 12px; }',
      '.pp-widget-form .pp-flex { display: flex; gap: 12px; }',
      '.pp-widget-form .pp-flex .pp-row { flex: 1; }',
      '.pp-widget-submit { width: 100%; padding: 10px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #fff; cursor: pointer; transition: opacity 0.15s; }',
      '.pp-widget-submit:hover { opacity: 0.9; }',
      '.pp-widget-submit:disabled { opacity: 0.5; cursor: not-allowed; }',
      '.pp-widget-cancel { margin-top: 8px; width: 100%; padding: 8px; border: none; border-radius: 8px; font-size: 13px; color: #666; background: transparent; cursor: pointer; }',
      '.pp-widget-cancel:hover { background: #f3f4f6; }',
      '.pp-widget-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 2147483647; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 500; box-shadow: 0 4px 16px rgba(0,0,0,0.15); animation: ppFadeIn 0.2s ease; }',
      '.pp-widget-toast.success { background: #059669; color: #fff; }',
      '.pp-widget-toast.error { background: #dc2626; color: #fff; }',
      '@keyframes ppFadeIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }',
      '@keyframes ppPulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.15); } }',
      '.pp-dark .pp-widget-form { background: #1f2937; }',
      '.pp-dark .pp-widget-form h3 { color: #f9fafb; }',
      '.pp-dark .pp-widget-form label { color: #9ca3af; }',
      '.pp-dark .pp-widget-form input, .pp-dark .pp-widget-form textarea { background: #374151; border-color: #4b5563; color: #f9fafb; }',
      '.pp-dark .pp-widget-cancel:hover { background: #374151; color: #d1d5db; }',
      '.pp-branding { text-align: center; padding: 6px 0 0; font-size: 11px; }',
      '.pp-branding a { color: #9ca3af; text-decoration: none; }',
      '.pp-branding a:hover { color: #6b7280; }',
      '.pp-dark .pp-branding a { color: #6b7280; }',
      '.pp-dark .pp-branding a:hover { color: #9ca3af; }',

      '.pp-annotate-overlay { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.85); display: flex; flex-direction: column; }',
      '.pp-annotate-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; flex-shrink: 0; }',
      '.pp-annotate-header h3 { color: #fff; font-size: 16px; font-weight: 600; margin: 0; }',
      '.pp-annotate-body { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 16px; }',
      '.pp-annotate-image-wrap { position: relative; display: inline-block; line-height: 0; }',
      '.pp-annotate-image-wrap img { display: block; max-width: 80vw; max-height: calc(100vh - 160px); object-fit: contain; border-radius: 8px; }',
      '.pp-annotate-svg { position: absolute; inset: 0; }',
      '.pp-annotate-svg rect { cursor: crosshair; }',
      '.pp-annotate-toolbar { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; background: rgba(0,0,0,0.6); flex-shrink: 0; }',
      '.pp-annotate-color { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }',
      '.pp-annotate-color.active { border-color: #fff; transform: scale(1.15); }',
      '.pp-annotate-btn { padding: 8px 18px; border-radius: 8px; border: none; font-size: 13px; font-weight: 500; cursor: pointer; }',
      '.pp-annotate-btn-primary { background: #3B82F6; color: #fff; }',
      '.pp-annotate-btn-primary:hover { opacity: 0.9; }',
      '.pp-annotate-btn-primary:disabled { opacity: 0.5; cursor: default; }',
      '.pp-annotate-btn-secondary { background: rgba(255,255,255,0.1); color: #fff; }',
      '.pp-annotate-btn-secondary:hover { background: rgba(255,255,255,0.2); }',
      '.pp-annotate-count { color: rgba(255,255,255,0.5); font-size: 12px; }',
      '.pp-annotate-label-popup { position: fixed; z-index: 2147483647; background: #1f2937; border-radius: 10px; padding: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 8px; }',
      '.pp-annotate-label-popup input { background: #374151; border: 1px solid #4b5563; border-radius: 6px; padding: 8px 10px; font-size: 13px; color: #fff; width: 200px; outline: none; }',
      '.pp-annotate-label-popup input:focus { border-color: #3B82F6; }',
      '.pp-annotate-label-popup button { background: #3B82F6; color: #fff; border: none; border-radius: 6px; padding: 6px 10px; font-size: 14px; cursor: pointer; }',
    ].join('');
    document.head.appendChild(css);
  }

  function createButton() {
    buttonEl = document.createElement('div');
    buttonEl.className = 'pp-widget pp-widget-btn';
    buttonEl.style.backgroundColor = CONFIG.color;
    applyPosition(buttonEl, CONFIG.position);
    buttonEl.innerHTML = getIcon(CONFIG.icon) + CONFIG.buttonText;
    buttonEl.addEventListener('click', startPinning);
    document.body.appendChild(buttonEl);
  }

  function applyPosition(el, pos) {
    var sides = pos.split('-');
    el.style[sides[0]] = '24px';
    el.style[sides[1]] = '24px';
  }

  function getIcon(icon) {
    switch (icon) {
      case 'bug': return '<span style="font-size:16px">🐛</span> ';
      case 'feedback': return '<span style="font-size:16px">📝</span> ';
      default: return '<span style="font-size:16px">💬</span> ';
    }
  }

  function startPinning() {
    if (state !== 'idle') return;
    state = 'pinning';
    buttonEl.style.display = 'none';

    overlayEl = document.createElement('div');
    overlayEl.className = 'pp-widget pp-widget-overlay';
    if (CONFIG.darkMode) overlayEl.classList.add('pp-dark');
    overlayEl.addEventListener('click', onPinClick);
    overlayEl.addEventListener('mousemove', onPinMove);
    document.body.appendChild(overlayEl);

    pinMarkerEl = document.createElement('div');
    pinMarkerEl.className = 'pp-widget pp-widget-pin';
    pinMarkerEl.style.display = 'none';
    pinMarkerEl.innerHTML = '<svg viewBox="0 0 24 24" fill="' + CONFIG.color + '" stroke="#fff" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>';
    document.body.appendChild(pinMarkerEl);
  }

  function onPinMove(e) {
    if (pinMarkerEl) {
      pinMarkerEl.style.left = e.clientX + 'px';
      pinMarkerEl.style.top = e.clientY + 'px';
      pinMarkerEl.style.display = 'block';
    }
  }

  function onPinClick(e) {
    pin.x = e.clientX;
    pin.y = e.clientY;
    pin.element = getElementSelector(e.target);

    if (pinMarkerEl) {
      pinMarkerEl.style.animation = 'ppPulse 0.6s ease';
      pinMarkerEl.style.left = e.clientX + 'px';
      pinMarkerEl.style.top = e.clientY + 'px';
    }

    setTimeout(function () {
      cleanupOverlay();
      showForm();
    }, 400);
  }

  function getElementSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return 'body';
    var path = [];
    while (el && el !== document.body && el !== document.documentElement && path.length < 5) {
      var selector = el.tagName.toLowerCase();
      if (el.id) { path.unshift('#' + el.id); break; }
      if (el.className && typeof el.className === 'string') {
        var classes = el.className.trim().split(/\s+/).slice(0, 2);
        if (classes.length) selector += '.' + classes.join('.');
      }
      path.unshift(selector);
      el = el.parentElement;
    }
    return path.join(' > ');
  }

  function cleanupOverlay() {
    if (overlayEl) { overlayEl.remove(); overlayEl = null; }
    if (pinMarkerEl) { pinMarkerEl.remove(); pinMarkerEl = null; }
    document.removeEventListener('mousemove', onPinMove);
  }

  function showForm() {
    state = 'form';
    var isDark = CONFIG.darkMode || window.matchMedia('(prefers-color-scheme: dark)').matches;

    formEl = document.createElement('div');
    formEl.className = 'pp-widget pp-widget-form' + (isDark ? ' pp-dark' : '');
    formEl.style.borderTop = '3px solid ' + CONFIG.color;

    var cx = Math.min(pin.x, window.innerWidth - 400);
    if (cx < 16) cx = 16;
    var cy = Math.min(pin.y - 180, window.innerHeight - 500);
    if (cy < 16) cy = Math.max(16, pin.y + 20);

    formEl.style.left = cx + 'px';
    formEl.style.top = cy + 'px';

    formEl.innerHTML = [
      '<h3>Leave Feedback</h3>',
      '<div class="pp-row">',
      '  <input id="pp-title" type="text" placeholder="Brief title (optional)" />',
      '</div>',
      '<div class="pp-row">',
      '  <textarea id="pp-comment" placeholder="What\'s the issue? (required)" required></textarea>',
      '</div>',
      '<div class="pp-flex">',
      '  <div class="pp-row">',
      '    <label for="pp-name">Name</label>',
      '    <input id="pp-name" type="text" placeholder="Your name" />',
      '  </div>',
      '  <div class="pp-row">',
      '    <label for="pp-email">Email</label>',
      '    <input id="pp-email" type="email" placeholder="you@example.com" />',
      '  </div>',
      '</div>',
      '<button class="pp-widget-submit" id="pp-submit" style="background:' + CONFIG.color + '">Continue to Annotate →</button>',
      '<button class="pp-widget-cancel" id="pp-cancel">Cancel</button>',
      (CONFIG.whiteLabel ? '' : '<div class="pp-branding"><a href="https://pinpoint.com" target="_blank" rel="noopener">Powered by PinPoint</a></div>'),
    ].join('');

    document.body.appendChild(formEl);

    document.getElementById('pp-comment').focus();
    document.getElementById('pp-submit').addEventListener('click', continueToAnnotate);
    document.getElementById('pp-cancel').addEventListener('click', cancelForm);
    document.getElementById('pp-comment').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.ctrlKey) submitFeedback();
    });
  }

  function cancelForm() {
    cleanupForm();
    resetToIdle();
  }

  function cleanupForm() {
    if (formEl) { formEl.remove(); formEl = null; }
  }

  function resetToIdle() {
    state = 'idle';
    if (buttonEl) buttonEl.style.display = 'flex';
  }

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
      userAgent: ua,
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
    if (ua.includes('iOS') || (ua.includes('iPhone') || ua.includes('iPad'))) return 'iOS';
    return 'Unknown';
  }

  function takeScreenshot() {
    return new Promise(function (resolve) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
      script.onload = function () {
        if (window.htmlToImage) {
          window.htmlToImage.toPng(document.body, { quality: 0.7, pixelRatio: 1.0 })
            .then(function (dataUrl) { resolve(dataUrl); })
            .catch(function () { resolve(null); });
        } else {
          resolve(null);
        }
      };
      script.onerror = function () { resolve(null); };
      document.head.appendChild(script);
    });
  }

  async function continueToAnnotate() {
    var comment = document.getElementById('pp-comment').value.trim();
    if (!comment) {
      document.getElementById('pp-comment').focus();
      return;
    }

    var btn = document.getElementById('pp-submit');
    btn.disabled = true;
    btn.textContent = 'Capturing screenshot...';

    savedFormData = {
      title: document.getElementById('pp-title').value.trim(),
      comment: comment,
      name: document.getElementById('pp-name').value.trim(),
      email: document.getElementById('pp-email').value.trim(),
    };

    try {
      if (formEl) formEl.style.display = 'none';
      var dataUrl = await takeScreenshot();
      if (formEl) formEl.style.display = '';
    } catch (_) {
      if (formEl) formEl.style.display = '';
    }

    if (dataUrl) {
      btn.disabled = false;
      btn.textContent = 'Continue to Annotate \u2192';
      screenshotData = dataUrl;
      if (formEl) formEl.style.display = 'none';
      showAnnotator();
    } else {
      gatherAndSubmit();
    }
  }

  function gatherAndSubmit() {
    var btn = document.getElementById('pp-submit');
    btn.disabled = true;
    btn.textContent = 'Submitting...';
    sendToApi(buildFeedbackBody(), function () {
      btn.disabled = false;
      btn.textContent = 'Continue to Annotate \u2192';
    });
  }

  function buildFeedbackBody() {
    var title = savedFormData.title || (savedFormData.comment.length > 100 ? savedFormData.comment.slice(0, 97) + '...' : savedFormData.comment);
    var body = {
      comment: savedFormData.comment,
      title: title,
      pageUrl: window.location.href,
      coordinates: { x: pin.x, y: pin.y, element: pin.element },
      metadata: collectMetadata(),
    };
    if (savedFormData.name) body.reporterName = savedFormData.name;
    if (savedFormData.email) body.reporterEmail = savedFormData.email;
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
        showToast('Feedback submitted! Thank you.', 'success');
        resetToIdle();
        return;
      }
      showToast(data.error?.message || 'Submission failed', 'error');
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    }
    if (onError) onError();
  }

  function showAnnotator() {
    state = 'annotating';
    annotationsArr = [];
    activeDrawing = null;

    annotatingEl = document.createElement('div');
    annotatingEl.className = 'pp-widget pp-annotate-overlay';

    annotatingEl.innerHTML = [
      '<div class="pp-annotate-header">',
      '  <button class="pp-annotate-btn pp-annotate-btn-secondary" id="pp-annotate-back">\u2190 Back</button>',
      '  <h3>Annotate Screenshot</h3>',
      '  <button class="pp-annotate-btn pp-annotate-btn-primary" id="pp-annotate-submit">Submit Feedback</button>',
      '</div>',
      '<div class="pp-annotate-body">',
      '  <div class="pp-annotate-image-wrap" id="pp-annotate-wrap">',
      '    <img id="pp-annotate-img" src="' + screenshotData + '" alt="Screenshot" />',
      '    <svg class="pp-annotate-svg" id="pp-annotate-svg"></svg>',
      '  </div>',
      '</div>',
      '<div class="pp-annotate-toolbar" id="pp-annotate-toolbar"></div>',
    ].join('');

    document.body.appendChild(annotatingEl);

    var toolbar = document.getElementById('pp-annotate-toolbar');
    annotatingColors.forEach(function (c) {
      var cb = document.createElement('button');
      cb.className = 'pp-annotate-color' + (c === selectedColor ? ' active' : '');
      cb.style.backgroundColor = c;
      cb.addEventListener('click', function (e) {
        e.stopPropagation();
        selectedColor = c;
        toolbar.querySelectorAll('.pp-annotate-color').forEach(function (b) { b.classList.remove('active'); });
        cb.classList.add('active');
      });
      toolbar.appendChild(cb);
    });

    var sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:20px;background:rgba(255,255,255,0.2);margin:0 8px;';
    toolbar.appendChild(sep);

    var countEl = document.createElement('span');
    countEl.className = 'pp-annotate-count';
    countEl.id = 'pp-annotate-count';
    countEl.textContent = '0 annotations';
    toolbar.appendChild(countEl);

    var img = document.getElementById('pp-annotate-img');
    img.addEventListener('load', function () { renderAnnotations(); });

    var wrap = document.getElementById('pp-annotate-wrap');
    wrap.addEventListener('mousedown', onAnnotateMouseDown);
    document.addEventListener('mousemove', onAnnotateMouseMove);
    document.addEventListener('mouseup', onAnnotateMouseUp);

    document.getElementById('pp-annotate-back').addEventListener('click', function (e) {
      e.stopPropagation();
      cancelAnnotator();
    });

    document.getElementById('pp-annotate-submit').addEventListener('click', function (e) {
      e.stopPropagation();
      var sbtn = document.getElementById('pp-annotate-submit');
      sbtn.disabled = true;
      sbtn.textContent = 'Submitting...';
      sendToApi(buildFeedbackBody(), function () {
        sbtn.disabled = false;
        sbtn.textContent = 'Submit Feedback';
      });
    });
  }

  function cancelAnnotator() {
    cleanupAnnotator();
    var fb = document.getElementById('pp-submit');
    if (fb) { fb.disabled = false; fb.textContent = 'Continue to Annotate \u2192'; }
    if (formEl) formEl.style.display = '';
    state = 'form';
  }

  function cleanupAnnotator() {
    if (labelPopupEl) { labelPopupEl.remove(); labelPopupEl = null; }
    if (annotatingEl) { annotatingEl.remove(); annotatingEl = null; }
    document.removeEventListener('mousemove', onAnnotateMouseMove);
    document.removeEventListener('mouseup', onAnnotateMouseUp);
  }

  function getAnnotateFraction(clientX, clientY) {
    var img = document.getElementById('pp-annotate-img');
    if (!img) return null;
    var r = img.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  }

  function onAnnotateMouseDown(e) {
    e.stopPropagation();
    var frac = getAnnotateFraction(e.clientX, e.clientY);
    if (!frac) return;

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

    if (w > 0.005 && h > 0.005) {
      var id = Math.random().toString(36).substring(2, 9);
      var ann = { id: id, x: x, y: y, width: w, height: h, color: selectedColor, label: '' };
      annotationsArr.push(ann);
      renderAnnotations();
      showLabelPopup(id);
    }

    activeDrawing = null;
    renderAnnotationPreview();
  }

  function showLabelPopup(annId) {
    if (labelPopupEl) { labelPopupEl.remove(); labelPopupEl = null; }

    var ann = annotationsArr.find(function (a) { return a.id === annId; });
    if (!ann) return;

    var img = document.getElementById('pp-annotate-img');
    if (!img) return;
    var r = img.getBoundingClientRect();
    var cx = r.left + r.width * (ann.x + ann.width / 2);
    var cy = r.top + r.height * (ann.y + ann.height / 2);

    labelPopupEl = document.createElement('div');
    labelPopupEl.className = 'pp-widget pp-annotate-label-popup';
    labelPopupEl.innerHTML = '<input id="pp-annotate-label-input" type="text" placeholder="Describe this area..." maxlength="200" /><button id="pp-annotate-label-save">\u2713</button>';

    var left = Math.min(Math.max(cx - 130, 16), window.innerWidth - 260);
    var top = Math.min(cy + 24, window.innerHeight - 80);
    labelPopupEl.style.left = left + 'px';
    labelPopupEl.style.top = top + 'px';

    document.body.appendChild(labelPopupEl);

    var input = document.getElementById('pp-annotate-label-input');
    input.focus();

    function saveLabel() {
      ann.label = input.value.trim();
      if (labelPopupEl) { labelPopupEl.remove(); labelPopupEl = null; }
      renderAnnotations();
    }

    document.getElementById('pp-annotate-label-save').addEventListener('click', function (e) {
      e.stopPropagation();
      saveLabel();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveLabel(); }
      if (e.key === 'Escape') { if (labelPopupEl) { labelPopupEl.remove(); labelPopupEl = null; } }
    });

    setTimeout(function () {
      function closeOut(e) {
        if (labelPopupEl && !labelPopupEl.contains(e.target)) {
          saveLabel();
          document.removeEventListener('mousedown', closeOut);
        }
      }
      document.addEventListener('mousedown', closeOut);
    }, 0);
  }

  function renderAnnotations() {
    var svg = document.getElementById('pp-annotate-svg');
    var img = document.getElementById('pp-annotate-img');
    if (!svg || !img) return;
    var r = img.getBoundingClientRect();
    var w = r.width;
    var h = r.height;

    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.style.width = w + 'px';
    svg.style.height = h + 'px';
    svg.innerHTML = '';

    annotationsArr.forEach(function (a) {
      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', a.x * w);
      rect.setAttribute('y', a.y * h);
      rect.setAttribute('width', Math.max(2, a.width * w));
      rect.setAttribute('height', Math.max(2, a.height * h));
      rect.setAttribute('fill', a.color);
      rect.setAttribute('fill-opacity', '0.15');
      rect.setAttribute('stroke', a.color);
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('rx', '4');
      rect.style.cursor = 'pointer';
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
    var svg = document.getElementById('pp-annotate-svg');
    if (!svg) return;
    var prev = svg.querySelector('.pp-drawing-preview');
    if (prev) prev.remove();
    if (!activeDrawing) return;

    var img = document.getElementById('pp-annotate-img');
    if (!img) return;
    var r = img.getBoundingClientRect();
    var w = r.width;
    var h = r.height;

    var x = Math.min(activeDrawing.startX, activeDrawing.currentX) * w;
    var y = Math.min(activeDrawing.startY, activeDrawing.currentY) * h;
    var rw = Math.abs(activeDrawing.currentX - activeDrawing.startX) * w;
    var rh = Math.abs(activeDrawing.currentY - activeDrawing.startY) * h;

    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'pp-drawing-preview');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(0, rw));
    rect.setAttribute('height', Math.max(0, rh));
    rect.setAttribute('fill', selectedColor);
    rect.setAttribute('fill-opacity', '0.2');
    rect.setAttribute('stroke', selectedColor);
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('stroke-dasharray', '6 3');
    rect.setAttribute('rx', '4');
    svg.appendChild(rect);
  }

  function showToast(message, type) {
    if (toastEl) { toastEl.remove(); toastEl = null; }
    toastEl = document.createElement('div');
    toastEl.className = 'pp-widget pp-widget-toast ' + type;
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(function () {
      if (toastEl) { toastEl.remove(); toastEl = null; }
    }, 3000);
  }

  window.Feedback = { init: init };
})();
