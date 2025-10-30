(function() {
  'use strict';
  
  // Prevent double-loading
  if (window.webAnalyticsLoaded) {
    console.log('Web Analytics: Already loaded, skipping duplicate');
    return;
  }
  window.webAnalyticsLoaded = true;
  
  // Get client ID from script tag
  const script = document.currentScript;
  const urlParams = new URL(script.src).searchParams;
  const clientId = urlParams.get('id') || script.getAttribute('data-client-id');
  
  if (!clientId) {
    console.error('Web Analytics: Missing client ID');
    return;
  }
  
  console.log('Client ID:', clientId);

  // Get or create session ID
  function getSessionId() {
    let sessionId = localStorage.getItem('wa_session_id');
    if (!sessionId) {
      sessionId = 'ses_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('wa_session_id', sessionId);
    }
    return sessionId;
  }

  const sessionId = getSessionId();
  const apiEndpoint = script.src.split('/track.js')[0] + '/api/track';

  // Send event to API
  function track(event, url, data) {
    const payload = {
      clientId: clientId,
      sessionId: sessionId,
      event: event,
      url: url || window.location.href,
      data: data || {},
      timestamp: new Date().toISOString()
    };

    // Use fetch (sendBeacon has CORS issues with local files)
    console.log('Tracking:', payload);
    fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'cors',
      credentials: 'omit'
    }).then(function(res) {
      if (!res.ok) {
        return res.json().then(function(err) {
          console.error('Web Analytics error:', err);
        });
      }
      console.log('Tracked successfully');
    }).catch(function(err) {
      console.error('Web Analytics error:', err);
    });
  }

  // Collect device/referrer data
  function getDeviceData() {
    return {
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language || navigator.userLanguage,
      languages: navigator.languages ? navigator.languages.join(',') : ''
    };
  }

  // Extract UTM parameters
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utmParams = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function(key) {
      if (params.get(key)) {
        utmParams[key] = params.get(key);
      }
    });
    return Object.keys(utmParams).length > 0 ? utmParams : null;
  }

  // Track page performance metrics
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        const firstPaint = timing.responseEnd - timing.fetchStart;
        
        track('performance', window.location.href, {
          load_time: loadTime,
          dom_ready: domReady,
          first_paint: firstPaint
        });
      }
    }, 0);
  });

  // Track JavaScript errors
  window.addEventListener('error', function(e) {
    track('js_error', window.location.href, {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno
    });
  });

  // Track tab visibility (user engagement)
  let tabHidden = false;
  let tabHiddenTime = null;
  
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      tabHidden = true;
      tabHiddenTime = Date.now();
    } else {
      if (tabHidden && tabHiddenTime) {
        const awayTime = Math.round((Date.now() - tabHiddenTime) / 1000);
        track('tab_return', window.location.href, { away_seconds: awayTime });
        tabHidden = false;
      }
    }
  });

  // Track initial pageview with device data
  const deviceData = getDeviceData();
  const utmParams = getUTMParams();
  track('pageview', window.location.href, Object.assign({}, deviceData, utmParams ? { utm: utmParams } : {}));

  // Track time on page
  let pageStartTime = Date.now();
  let lastActivityTime = Date.now();
  let idleTimeout;

  // Track pageview on history changes (SPA support)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    // Track time spent on previous page
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    if (timeSpent > 0) {
      track('time_on_page', window.location.href, { seconds: timeSpent });
    }
    pageStartTime = Date.now();
    
    originalPushState.apply(this, arguments);
    track('pageview', window.location.href);
  };
  
  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    track('pageview', window.location.href);
  };

  window.addEventListener('popstate', function() {
    track('pageview', window.location.href);
  });

  // Track scroll depth
  let maxScroll = 0;
  let scrollMilestones = [25, 50, 75, 100];
  let trackedMilestones = [];

  function trackScroll() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollHeight > 0 ? Math.round((window.scrollY / scrollHeight) * 100) : 100;
    
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      scrollMilestones.forEach(function(milestone) {
        if (scrollPercent >= milestone && trackedMilestones.indexOf(milestone) === -1) {
          trackedMilestones.push(milestone);
          track('scroll_depth', window.location.href, { depth: milestone });
        }
      });
    }
  }

  window.addEventListener('scroll', function() {
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(trackScroll, 150);
  });

  // Track clicks on ALL interactive elements automatically
  // Also detect rage clicks and dead clicks
  let clickTracker = {};
  
  document.addEventListener('click', function(e) {
    // Ignore clicks if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    
    const target = e.target;
    const tagName = target.tagName.toLowerCase();
    
    // Reset idle timer on click
    lastActivityTime = Date.now();
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(function() {
      track('idle', window.location.href, { idle_seconds: 60 });
    }, 60000);

    // Auto-track buttons and links
    if (tagName === 'button' || tagName === 'a') {
      const elementId = target.id || target.className || tagName;
      const linkHref = tagName === 'a' ? target.href : null;
      
      // Detect special link types
      let linkType = 'link';
      if (linkHref) {
        if (linkHref.startsWith('tel:')) {
          linkType = 'phone';
          track('phone_click', window.location.href, {
            phone_number: linkHref.replace('tel:', ''),
            text: target.textContent?.trim()
          });
        } else if (linkHref.startsWith('mailto:')) {
          linkType = 'email';
          track('email_click', window.location.href, {
            email: linkHref.replace('mailto:', ''),
            text: target.textContent?.trim()
          });
        } else if (linkHref.match(/\.(pdf|doc|docx|zip|csv|xlsx)$/i)) {
          linkType = 'download';
          track('download_click', window.location.href, {
            file: linkHref,
            text: target.textContent?.trim()
          });
        }
      }
      
      track('click', window.location.href, {
        element: elementId,
        text: target.textContent?.trim().substring(0, 100) || '',
        href: linkHref,
        tag: tagName,
        type: linkType
      });
    }
    
    // Also track elements with data-track for custom naming
    const trackAttr = target.getAttribute('data-track') || target.closest('[data-track]')?.getAttribute('data-track');
    if (trackAttr) {
      track('click', window.location.href, {
        element: trackAttr,
        text: target.textContent?.trim().substring(0, 100) || ''
      });
    }
    
    // Rage click detection (3+ clicks in 1 second on same element)
    const elementPath = getElementPath(target);
    const now = Date.now();
    
    if (!clickTracker[elementPath]) {
      clickTracker[elementPath] = { count: 1, timestamp: now };
    } else {
      if (now - clickTracker[elementPath].timestamp < 1000) {
        clickTracker[elementPath].count++;
        if (clickTracker[elementPath].count === 3) {
          track('rage_click', window.location.href, {
            element: elementPath,
            text: target.textContent?.trim().substring(0, 50) || ''
          });
        }
      } else {
        clickTracker[elementPath] = { count: 1, timestamp: now };
      }
    }
    
    // Dead click detection (click on non-interactive element)
    // Skip if user is just selecting/highlighting text
    if (selection && selection.toString().length > 0) {
      return;
    }
    
    const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].indexOf(tagName) !== -1;
    const hasClickHandler = target.onclick || target.getAttribute('onclick');
    const isCursorPointer = window.getComputedStyle(target).cursor === 'pointer';
    
    if (!isInteractive && !hasClickHandler && !isCursorPointer && !trackAttr) {
      track('dead_click', window.location.href, {
        element: tagName,
        text: target.textContent?.trim().substring(0, 50) || ''
      });
    }
  });

  function getElementPath(element) {
    if (element.id) return '#' + element.id;
    if (element.className) return element.tagName.toLowerCase() + '.' + element.className.split(' ')[0];
    return element.tagName.toLowerCase();
  }

  // Track form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    const formName = form.getAttribute('data-track') || form.id || form.name || 'unnamed-form';
    
    track('form_submit', window.location.href, {
      form: formName
    });
  });

  // Track form field focus (form starts) with timing
  let trackedForms = new Set();
  let fieldStartTime = {};
  let fieldKeystrokes = {};
  
  document.addEventListener('focus', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      const fieldKey = e.target.name || e.target.id || 'field';
      fieldStartTime[fieldKey] = Date.now();
      fieldKeystrokes[fieldKey] = 0;
      
      const form = e.target.closest('form');
      if (form) {
        const formName = form.getAttribute('data-track') || form.id || form.name || 'unnamed-form';
        const formKey = formName + '-' + window.location.href;
        
        if (!trackedForms.has(formKey)) {
          trackedForms.add(formKey);
          track('form_start', window.location.href, {
            form: formName,
            field: fieldKey
          });
        }
      }
    }
  }, true);

  // Track field-level timing and corrections
  document.addEventListener('blur', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      const fieldKey = e.target.name || e.target.id || 'field';
      if (fieldStartTime[fieldKey]) {
        const timeSpent = Math.round((Date.now() - fieldStartTime[fieldKey]) / 1000);
        track('field_time', window.location.href, {
          field: fieldKey,
          seconds: timeSpent,
          keystrokes: fieldKeystrokes[fieldKey] || 0
        });
        delete fieldStartTime[fieldKey];
        delete fieldKeystrokes[fieldKey];
      }
    }
  }, true);

  // Track keystrokes in fields (corrections indicator)
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      const fieldKey = e.target.name || e.target.id || 'field';
      fieldKeystrokes[fieldKey] = (fieldKeystrokes[fieldKey] || 0) + 1;
      
      // Track backspace/delete (corrections)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        track('field_correction', window.location.href, {
          field: fieldKey
        });
      }
    }
  }, true);

  // Track copy events (what users find valuable)
  document.addEventListener('copy', function(e) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length > 0) {
      track('copy_text', window.location.href, {
        text: text.substring(0, 200)
      });
    }
  });

  // Detect orientation changes (mobile)
  window.addEventListener('orientationchange', function() {
    const orientation = window.screen.orientation ? window.screen.orientation.type : 
                       (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    track('orientation_change', window.location.href, { orientation: orientation });
  });

  // Track exit intent
  window.addEventListener('beforeunload', function() {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    const activeTime = Math.round((lastActivityTime - pageStartTime) / 1000);
    
    track('exit', window.location.href, { 
      time_spent: timeSpent,
      active_time: activeTime,
      scroll_depth: maxScroll 
    });
  });

  // Expose global tracking function for custom events
  window.webAnalytics = {
    track: track,
    // Helper for tracking conversions
    conversion: function(value) {
      track('conversion', window.location.href, { value: value || 1 });
    }
  };

  // Feedback Widget (only loads if enabled)
  var feedbackWidget = {
    state: 'collapsed',
    widgetStyle: 'glassmorphic', // glassmorphic, ticker, b2b-saas
    mediaRecorder: null,
    audioChunks: [],
    recordingStartTime: null,
    maxDuration: 60000,
    timerInterval: null,
    currentBlob: null,
    recentQuotes: [],
    
    init: function() {
      // Check if enabled for this client and get style + recent quotes
      fetch(apiEndpoint.replace('/track', '/feedback/enabled?clientId=' + clientId))
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.enabled) {
            feedbackWidget.widgetStyle = data.style || 'glassmorphic';
            feedbackWidget.recentQuotes = data.recentQuotes || [];
            feedbackWidget.createWidget();
          }
        })
        .catch(function(err) { console.log('Feedback widget check failed:', err); });
    },
    
    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'tb-feedback-widget';
      widget.innerHTML = this.getHTML('collapsed');
      document.body.appendChild(widget);
      this.attachEventListeners();
    },
    
    attachEventListeners: function() {
      var widget = document.getElementById('tb-feedback-widget');
      if (!widget) return;
      
      // Find and attach click handlers based on current state
      var expandBtn = widget.querySelector('[data-action="expand"]');
      var collapseBtn = widget.querySelector('[data-action="collapse"]');
      var startBtn = widget.querySelector('[data-action="start-recording"]');
      var stopBtn = widget.querySelector('[data-action="stop-recording"]');
      var submitBtn = widget.querySelector('[data-action="submit"]');
      var redoBtn = widget.querySelector('[data-action="redo"]');
      
      if (expandBtn) {
        expandBtn.onclick = function() { feedbackWidget.expand(); };
      }
      if (collapseBtn) {
        collapseBtn.onclick = function() { feedbackWidget.collapse(); };
      }
      if (startBtn) {
        startBtn.onclick = function() { feedbackWidget.startRecording(); };
      }
      if (stopBtn) {
        stopBtn.onclick = function() { feedbackWidget.stopRecording(); };
      }
      if (submitBtn) {
        submitBtn.onclick = function() { feedbackWidget.submitFeedback(); };
      }
      if (redoBtn) {
        redoBtn.onclick = function() { feedbackWidget.expand(); };
      }
    },
    
    getHTML: function(state) {
      // Route to different styles
      if (this.widgetStyle === 'ticker') {
        return this.getTickerHTML(state);
      }
      if (this.widgetStyle === 'b2b-saas') {
        return this.getB2BSaasHTML(state);
      }
      // Default: glassmorphic button style
      return this.getGlassmorphicHTML(state);
    },
    
    getGlassmorphicHTML: function(state) {
      var styles = {
        base: 'position:fixed;bottom:20px;right:20px;z-index:9999;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
        collapsed: 'width:60px;height:60px;border-radius:30px;background:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.12),0 0 0 0 rgba(255,255,255,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;animation:pulseGlow 3s ease-in-out infinite;',
        expanded: 'width:320px;min-height:200px;border-radius:16px;background:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.12);padding:20px;'
      };
      
      if (state === 'collapsed') {
        return '<div style="' + styles.base + styles.collapsed + '" data-action="expand"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div><style>@keyframes pulseGlow { 0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 0 rgba(255,255,255,0.5); } 50% { box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 20px 5px rgba(255,255,255,0.8); }}@media (max-width: 768px) { #tb-feedback-widget { bottom:16px !important; right:16px !important; width:52px !important; height:52px !important; } #tb-feedback-widget.expanded { width:calc(100vw - 32px) !important; max-width:320px !important; }}</style>';
      }
      
      if (state === 'expanded') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;"><div style="font-size:20px;margin-bottom:10px;">🎙️</div><h3 style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#111;">Voice Feedback</h3><p style="margin:0 0 20px 0;font-size:13px;color:#666;">Share your thoughts (max 60s)</p><button data-action="start-recording" style="width:100%;padding:12px;background:linear-gradient(135deg,#EF4444,#DC2626);color:white;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 2px 8px rgba(239,68,68,0.3);">Start Recording</button><button data-action="collapse" style="width:100%;margin-top:10px;padding:8px;background:transparent;color:#666;border:none;font-size:12px;cursor:pointer;">Cancel</button></div></div>';
      }
      
      if (state === 'recording') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;"><div style="width:60px;height:60px;margin:0 auto 15px;background:#EF4444;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:recordPulse 1.5s ease-in-out infinite;"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4"/></svg></div><div id="tb-timer" style="font-size:24px;font-weight:600;color:#111;margin-bottom:20px;">00:00</div><button data-action="stop-recording" style="width:100%;padding:12px;background:#111;color:white;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;">Stop Recording</button></div><style>@keyframes recordPulse { 0%, 100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.1); opacity:0.8; }}</style></div>';
      }
      
      if (state === 'review') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;"><div style="font-size:20px;margin-bottom:10px;">🎧</div><h3 style="margin:0 0 15px 0;font-size:16px;font-weight:600;color:#111;">Review Recording</h3><audio id="tb-review-audio" controls style="width:100%;margin-bottom:20px;"></audio><button data-action="submit" style="width:100%;padding:12px;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;margin-bottom:10px;">Submit Feedback</button><button data-action="redo" style="width:100%;padding:8px;background:transparent;color:#666;border:none;font-size:12px;cursor:pointer;">Record Again</button></div></div>';
      }
      
      if (state === 'submitting') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;padding:20px 0;"><div style="width:40px;height:40px;margin:0 auto 15px;border:3px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin:0;font-size:14px;color:#666;">Submitting...</p></div><style>@keyframes spin { to { transform:rotate(360deg); }}</style></div>';
      }
      
      if (state === 'thankyou') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;padding:20px 0;"><div style="font-size:48px;margin-bottom:10px;animation:scaleIn 0.3s ease-out;">✅</div><h3 style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#111;">Thank You!</h3><p style="margin:0;font-size:13px;color:#666;">Your feedback has been received</p></div><style>@keyframes scaleIn { from { transform:scale(0); } to { transform:scale(1); }}</style></div>';
      }
      
      return '';
    },
    
    getTickerHTML: function(state) {
      // Ticker bar at bottom with scrolling quotes + mic button
      if (state === 'collapsed') {
        var quotesHTML = '';
        if (this.recentQuotes.length > 0) {
          // Create scrolling quotes
          var quotes = this.recentQuotes.map(function(q) {
            return '<span style="display:inline-block;padding:0 40px;white-space:nowrap;">"' + q.substring(0, 80) + (q.length > 80 ? '...' : '') + '"</span>';
          }).join('');
          quotesHTML = '<div style="overflow:hidden;flex:1;position:relative;"><div id="tb-ticker-scroll" style="display:flex;animation:tickerScroll 30s linear infinite;">' + quotes + quotes + '</div></div>';
        } else {
          quotesHTML = '<div style="flex:1;padding:0 20px;font-size:14px;color:#333;">💭 Share your feedback with us</div>';
        }
        
        return '<div style="position:fixed;bottom:0;left:0;right:0;z-index:9998;background:linear-gradient(90deg,#FEF3C7,#FDE68A,#FCD34D);border-top:2px solid #F59E0B;box-shadow:0 -4px 12px rgba(0,0,0,0.1);display:flex;align-items:center;height:50px;font-family:system-ui,-apple-system,sans-serif;">' + quotesHTML + '<div style="padding:0 20px;border-left:2px solid #F59E0B;cursor:pointer;display:flex;align-items:center;gap:8px;" data-action="expand"><span style="font-size:24px;">🎤</span><span style="font-size:14px;font-weight:600;color:#92400E;">Submit Feedback →</span></div></div><style>@keyframes tickerScroll { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); }}</style>';
      }
      
      // Modal for recording/states (overlays ticker)
      var modalBase = 'position:fixed;bottom:60px;right:20px;width:320px;background:white;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:9999;padding:24px;';
      
      if (state === 'expanded') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:12px;">🎙️</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Voice Feedback</h3><p style="margin:0 0 20px 0;font-size:14px;color:#666;">Share your thoughts (max 60s)</p><button data-action="start-recording" style="width:100%;padding:14px;background:linear-gradient(135deg,#EF4444,#DC2626);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(239,68,68,0.3);">Start Recording</button><button data-action="collapse" style="width:100%;margin-top:12px;padding:10px;background:transparent;color:#666;border:none;font-size:13px;cursor:pointer;">Cancel</button></div></div>';
      }
      
      if (state === 'recording') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="width:70px;height:70px;margin:0 auto 20px;background:#EF4444;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:recordPulse 1.5s ease-in-out infinite;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4"/></svg></div><div id="tb-timer" style="font-size:28px;font-weight:700;color:#111;margin-bottom:24px;">00:00</div><button data-action="stop-recording" style="width:100%;padding:14px;background:#111;color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">Stop Recording</button></div><style>@keyframes recordPulse { 0%, 100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.1); opacity:0.8; }}</style></div>';
      }
      
      if (state === 'review') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:12px;">🎧</div><h3 style="margin:0 0 20px 0;font-size:18px;font-weight:600;color:#111;">Review Recording</h3><audio id="tb-review-audio" controls style="width:100%;margin-bottom:20px;"></audio><button data-action="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:12px;">Submit Feedback</button><button data-action="redo" style="width:100%;padding:10px;background:transparent;color:#666;border:none;font-size:13px;cursor:pointer;">Record Again</button></div></div>';
      }
      
      if (state === 'submitting') {
        return '<div style="' + modalBase + '"><div style="text-align:center;padding:20px 0;"><div style="width:50px;height:50px;margin:0 auto 20px;border:4px solid #e5e7eb;border-top-color:#F59E0B;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin:0;font-size:15px;color:#666;">Submitting...</p></div><style>@keyframes spin { to { transform:rotate(360deg); }}</style></div>';
      }
      
      if (state === 'thankyou') {
        return '<div style="' + modalBase + '"><div style="text-align:center;padding:20px 0;"><div style="font-size:60px;margin-bottom:16px;animation:scaleIn 0.3s ease-out;">✅</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Thank You!</h3><p style="margin:0;font-size:14px;color:#666;">Your feedback has been received</p></div><style>@keyframes scaleIn { from { transform:scale(0); } to { transform:scale(1); }}</style></div>';
      }
      
      return '';
    },
    
    getB2BSaasHTML: function(state) {
      // B2B SaaS ticker - faster scroll, product-focused, purple/blue theme
      if (state === 'collapsed') {
        var quotesHTML = '';
        if (this.recentQuotes.length > 0) {
          // Create fast-scrolling product feedback quotes
          var quotes = this.recentQuotes.map(function(q) {
            return '<span style="display:inline-block;padding:0 50px;white-space:nowrap;font-size:13px;">💬 ' + q.substring(0, 70) + (q.length > 70 ? '...' : '') + '</span>';
          }).join('');
          quotesHTML = '<div style="overflow:hidden;flex:1;position:relative;"><div id="tb-ticker-scroll" style="display:flex;animation:tickerScrollFast 12s linear infinite;">' + quotes + quotes + '</div></div>';
        } else {
          quotesHTML = '<div style="flex:1;padding:0 20px;font-size:13px;color:#E0E7FF;font-weight:500;">💡 Share your product feedback</div>';
        }
        
        return '<div style="position:fixed;bottom:0;left:0;right:0;z-index:9998;background:linear-gradient(90deg,#6366F1,#8B5CF6,#A855F7);border-top:2px solid #818CF8;box-shadow:0 -4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;height:48px;font-family:system-ui,-apple-system,sans-serif;">' + quotesHTML + '<div style="padding:0 20px;border-left:2px solid #818CF8;cursor:pointer;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.1);" data-action="expand"><span style="font-size:20px;">🎤</span><span style="font-size:13px;font-weight:700;color:#FFF;text-transform:uppercase;letter-spacing:0.5px;">Voice Feedback</span></div></div><style>@keyframes tickerScrollFast { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); }}</style>';
      }
      
      // Modal for recording/states (same as ticker but purple theme)
      var modalBase = 'position:fixed;bottom:58px;right:20px;width:320px;background:white;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:9999;padding:24px;border:2px solid #8B5CF6;';
      
      if (state === 'expanded') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:12px;">🎤</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Voice Product Feedback</h3><p style="margin:0 0 20px 0;font-size:14px;color:#666;">Help us build what you need (max 60s)</p><button data-action="start-recording" style="width:100%;padding:14px;background:linear-gradient(135deg,#8B5CF6,#A855F7);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(139,92,246,0.3);">Start Recording</button><button data-action="collapse" style="width:100%;margin-top:12px;padding:10px;background:transparent;color:#666;border:none;font-size:13px;cursor:pointer;">Cancel</button></div></div>';
      }
      
      if (state === 'recording') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="width:70px;height:70px;margin:0 auto 20px;background:#8B5CF6;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:recordPulse 1.5s ease-in-out infinite;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4"/></svg></div><div id="tb-timer" style="font-size:28px;font-weight:700;color:#111;margin-bottom:24px;">00:00</div><button data-action="stop-recording" style="width:100%;padding:14px;background:#111;color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">Stop Recording</button></div><style>@keyframes recordPulse { 0%, 100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.1); opacity:0.8; }}</style></div>';
      }
      
      if (state === 'review') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:12px;">🎧</div><h3 style="margin:0 0 20px 0;font-size:18px;font-weight:600;color:#111;">Review Recording</h3><audio id="tb-review-audio" controls style="width:100%;margin-bottom:20px;"></audio><button data-action="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:12px;">Submit Feedback</button><button data-action="redo" style="width:100%;padding:10px;background:transparent;color:#666;border:none;font-size:13px;cursor:pointer;">Record Again</button></div></div>';
      }
      
      if (state === 'submitting') {
        return '<div style="' + modalBase + '"><div style="text-align:center;padding:20px 0;"><div style="width:50px;height:50px;margin:0 auto 20px;border:4px solid #e5e7eb;border-top-color:#8B5CF6;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin:0;font-size:15px;color:#666;">Submitting...</p></div><style>@keyframes spin { to { transform:rotate(360deg); }}</style></div>';
      }
      
      if (state === 'thankyou') {
        return '<div style="' + modalBase + '"><div style="text-align:center;padding:20px 0;"><div style="font-size:60px;margin-bottom:16px;animation:scaleIn 0.3s ease-out;">✅</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Thank You!</h3><p style="margin:0;font-size:14px;color:#666;">Your feedback will help shape our roadmap</p></div><style>@keyframes scaleIn { from { transform:scale(0); } to { transform:scale(1); }}</style></div>';
      }
      
      return '';
    },
    
    expand: function() {
      this.updateState('expanded');
    },
    
    collapse: function() {
      this.updateState('collapsed');
    },
    
    startRecording: function() {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
          feedbackWidget.mediaRecorder = new MediaRecorder(stream);
          feedbackWidget.audioChunks = [];
          
          feedbackWidget.mediaRecorder.ondataavailable = function(e) {
            feedbackWidget.audioChunks.push(e.data);
          };
          
          feedbackWidget.mediaRecorder.onstop = function() {
            var audioBlob = new Blob(feedbackWidget.audioChunks, { type: 'audio/webm' });
            feedbackWidget.showReview(audioBlob);
          };
          
          feedbackWidget.mediaRecorder.start();
          feedbackWidget.recordingStartTime = Date.now();
          feedbackWidget.updateState('recording');
          feedbackWidget.startTimer();
          
          setTimeout(function() {
            if (feedbackWidget.mediaRecorder && feedbackWidget.mediaRecorder.state === 'recording') {
              feedbackWidget.stopRecording();
            }
          }, feedbackWidget.maxDuration);
        })
        .catch(function(error) {
          alert('Microphone access denied. Please allow microphone access to record feedback.');
          feedbackWidget.collapse();
        });
    },
    
    stopRecording: function() {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(function(track) { track.stop(); });
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
      }
    },
    
    startTimer: function() {
      this.timerInterval = setInterval(function() {
        var elapsed = Math.floor((Date.now() - feedbackWidget.recordingStartTime) / 1000);
        var mins = Math.floor(elapsed / 60).toString();
        var secs = (elapsed % 60).toString();
        if (mins.length === 1) mins = '0' + mins;
        if (secs.length === 1) secs = '0' + secs;
        var timer = document.getElementById('tb-timer');
        if (timer) timer.textContent = mins + ':' + secs;
      }, 100);
    },
    
    showReview: function(audioBlob) {
      this.currentBlob = audioBlob;
      this.updateState('review');
      setTimeout(function() {
        var audio = document.getElementById('tb-review-audio');
        if (audio) audio.src = URL.createObjectURL(audioBlob);
      }, 100);
    },
    
    submitFeedback: function() {
      this.updateState('submitting');
      
      var formData = new FormData();
      formData.append('audio', this.currentBlob, 'feedback.webm');
      formData.append('clientId', clientId);
      formData.append('sessionId', sessionId);
      formData.append('url', window.location.href);
      formData.append('duration', Math.floor((Date.now() - this.recordingStartTime) / 1000).toString());
      
      fetch(apiEndpoint.replace('/track', '/feedback/upload'), {
        method: 'POST',
        body: formData
      })
        .then(function(response) {
          if (response.ok) {
            feedbackWidget.updateState('thankyou');
            setTimeout(function() { feedbackWidget.collapse(); }, 3000);
          } else {
            alert('Failed to submit. Please try again.');
            feedbackWidget.updateState('review');
          }
        })
        .catch(function(error) {
          alert('Failed to submit. Please try again.');
          feedbackWidget.updateState('review');
        });
    },
    
    updateState: function(newState) {
      this.state = newState;
      var widget = document.getElementById('tb-feedback-widget');
      if (widget) {
        widget.innerHTML = this.getHTML(newState);
        if (newState === 'expanded') {
          widget.className = 'expanded';
        } else {
          widget.className = '';
        }
        this.attachEventListeners();
      }
    }
  };

  // Initialize widget check after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { feedbackWidget.init(); });
  } else {
    feedbackWidget.init();
  }
})();

