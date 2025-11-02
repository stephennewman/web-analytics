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
    if (element.className) {
      // Handle SVG elements where className is an object
      var className = typeof element.className === 'string' 
        ? element.className 
        : element.className.baseVal || element.className.animVal || '';
      if (className) return element.tagName.toLowerCase() + '.' + className.split(' ')[0];
    }
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
  
  // Legacy alias for backwards compatibility
  window.TrackerBee = window.webAnalytics;

  // ========================================
  // 🐝 AUTO-CONVERSION DETECTION
  // ========================================
  
  var autoConversionConfig = {
    enabled: true, // Can be disabled via data-auto-convert="false"
    conversionTracked: false, // Prevent duplicate conversions
    
    // Patterns that suggest a conversion happened
    urlPatterns: [
      /thank-you|thankyou|success|confirmation|confirmed|complete|submitted/i,
      /order-complete|purchase-complete|checkout-success/i,
      /appointment-confirmed|booking-confirmed/i
    ],
    
    // Button text that indicates conversion actions
    buttonPatterns: [
      /submit|send|purchase|buy now|place order|complete|confirm/i,
      /book now|schedule|request appointment|get started|sign up|subscribe/i
    ],
    
    // Form submission tracking
    trackFormSubmissions: true,
    
    // Check if current page is a conversion page
    isConversionPage: function() {
      var path = window.location.pathname + window.location.search;
      for (var i = 0; i < this.urlPatterns.length; i++) {
        if (this.urlPatterns[i].test(path)) {
          return true;
        }
      }
      return false;
    },
    
    // Check if button text suggests conversion
    isConversionButton: function(text) {
      if (!text) return false;
      for (var i = 0; i < this.buttonPatterns.length; i++) {
        if (this.buttonPatterns[i].test(text)) {
          return true;
        }
      }
      return false;
    },
    
    // Track conversion (only once per session on this page)
    trackConversion: function(source, details) {
      if (this.conversionTracked) {
        console.log('🐝 Conversion already tracked for this page');
        return;
      }
      
      this.conversionTracked = true;
      var sessionKey = 'wa_conversion_' + sessionId;
      
      // Check if already tracked in this session
      if (localStorage.getItem(sessionKey)) {
        console.log('🐝 Conversion already tracked in this session');
        return;
      }
      
      localStorage.setItem(sessionKey, Date.now());
      
      console.log('🐝 AUTO-CONVERSION DETECTED:', source, details);
      track('conversion', window.location.href, { 
        value: 1,
        auto_detected: true,
        source: source,
        details: details
      });
    },
    
    init: function() {
      var self = this;
      
      // Check if auto-conversion is disabled
      var scriptTag = document.currentScript || document.querySelector('script[src*="track.js"]');
      if (scriptTag && scriptTag.getAttribute('data-auto-convert') === 'false') {
        console.log('🐝 Auto-conversion detection disabled');
        this.enabled = false;
        return;
      }
      
      if (!this.enabled) return;
      
      // 1. Check if current page is a conversion/thank-you page
      if (this.isConversionPage()) {
        setTimeout(function() {
          self.trackConversion('url_pattern', {
            pattern: 'thank-you or confirmation page',
            url: window.location.href
          });
        }, 500); // Small delay to ensure page is loaded
      }
      
      // 2. Auto-detect form submissions
      if (this.trackFormSubmissions) {
        document.addEventListener('submit', function(e) {
          var form = e.target;
          
          // Check if form has conversion indicators
          var submitButton = form.querySelector('[type="submit"], button:not([type="button"])');
          var buttonText = submitButton ? submitButton.textContent : '';
          
          if (self.isConversionButton(buttonText)) {
            console.log('🐝 Form submission detected:', buttonText);
            
            // Track after small delay (form might redirect)
            setTimeout(function() {
              self.trackConversion('form_submission', {
                button_text: buttonText,
                form_action: form.action,
                form_id: form.id || 'unknown'
              });
            }, 100);
          }
        }, true);
      }
      
      // 3. Auto-detect conversion button clicks
      document.addEventListener('click', function(e) {
        var target = e.target;
        
        // Check if clicked element or parent is a button/link
        for (var i = 0; i < 3; i++) {
          if (!target) break;
          
          var tagName = target.tagName.toLowerCase();
          if (tagName === 'button' || tagName === 'a' || tagName === 'input') {
            var text = target.textContent || target.value || target.getAttribute('aria-label') || '';
            
            if (self.isConversionButton(text)) {
              console.log('🐝 Conversion button clicked:', text);
              
              // Track after small delay (button might redirect)
              setTimeout(function() {
                self.trackConversion('button_click', {
                  button_text: text,
                  element_type: tagName,
                  element_id: target.id || 'unknown'
                });
              }, 100);
              
              break;
            }
          }
          
          target = target.parentElement;
        }
      }, true);
      
      console.log('🐝 Auto-conversion detection initialized');
    }
  };
  
  // Initialize auto-conversion detection
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      autoConversionConfig.init();
    });
  } else {
    autoConversionConfig.init();
  }

  // Feedback Widget (only loads if enabled)
  var feedbackWidget = {
    state: 'collapsed',
    widgetStyle: 'glassmorphic', // glassmorphic, ticker, b2b-saas, honey-bee
    mediaRecorder: null,
    audioChunks: [],
    recordingStartTime: null,
    maxDuration: 60000,
    timerInterval: null,
    currentBlob: null,
    recentQuotes: [],
    isHidden: false,
    excludedPaths: [],
    
    init: function() {
      console.log('🐝 Feedback widget initializing...');
      
      // Check if widget was manually hidden by user
      var hiddenPref = localStorage.getItem('tb_widget_hidden');
      if (hiddenPref === 'true') {
        console.log('🐝 Widget was hidden by user preference');
        feedbackWidget.isHidden = true;
      }
      
      var feedbackUrl = apiEndpoint.replace('/track', '/feedback/enabled?clientId=' + clientId);
      console.log('🐝 Checking feedback status:', feedbackUrl);
      
      // Check if enabled for this client and get style + recent quotes + excluded paths
      fetch(feedbackUrl)
        .then(function(res) { 
          console.log('🐝 Feedback API response status:', res.status);
          return res.json(); 
        })
        .then(function(data) {
          console.log('🐝 Feedback API data:', data);
          
          if (data.enabled) {
            feedbackWidget.widgetStyle = data.style || 'glassmorphic';
            feedbackWidget.recentQuotes = data.recentQuotes || [];
            feedbackWidget.excludedPaths = data.excludedPaths || [];
            
            console.log('🐝 Feedback enabled! Style:', feedbackWidget.widgetStyle);
            console.log('🐝 Excluded paths:', feedbackWidget.excludedPaths);
            
            // Check if current URL should be excluded
            if (feedbackWidget.shouldExcludeCurrentPage()) {
              console.log('🐝 Feedback widget excluded on this page:', window.location.href);
              return;
            }
            
            console.log('🐝 Creating widget...');
            feedbackWidget.createWidget();
          } else {
            console.log('🐝 Feedback not enabled for this client');
          }
        })
        .catch(function(err) { 
          console.error('🐝 Feedback widget check failed:', err); 
        });
    },
    
    shouldExcludeCurrentPage: function() {
      var currentPath = window.location.pathname;
      var currentUrl = window.location.href;
      
      for (var i = 0; i < this.excludedPaths.length; i++) {
        var pattern = this.excludedPaths[i];
        
        // Exact match
        if (pattern === currentPath) return true;
        
        // Wildcard match (simple)
        if (pattern.indexOf('*') > -1) {
          var regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          if (regex.test(currentPath)) return true;
        }
        
        // Contains match
        if (currentUrl.indexOf(pattern) > -1) return true;
      }
      
      return false;
    },
    
    toggleVisibility: function() {
      this.isHidden = !this.isHidden;
      localStorage.setItem('tb_widget_hidden', this.isHidden ? 'true' : 'false');
      
      if (this.isHidden) {
        this.showMinimizedButton();
      } else {
        this.createWidget();
      }
    },
    
    showMinimizedButton: function() {
      var widget = document.getElementById('tb-feedback-widget');
      if (widget) widget.remove();
      
      var minBtn = document.createElement('div');
      minBtn.id = 'tb-feedback-widget-minimized';
      minBtn.innerHTML = '<div style="position:fixed;bottom:10px;right:10px;width:36px;height:36px;background:rgba(0,0,0,0.6);border-radius:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);backdrop-filter:blur(10px);transition:all 0.2s;" onmouseover="this.style.transform=\'scale(1.1)\'" onmouseout="this.style.transform=\'scale(1)\'" data-action="show-widget"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg></div>';
      document.body.appendChild(minBtn);
      
      minBtn.onclick = function() {
        feedbackWidget.toggleVisibility();
      };
    },
    
    createWidget: function() {
      // Remove any existing widgets/minimized buttons
      var existingWidget = document.getElementById('tb-feedback-widget');
      if (existingWidget) existingWidget.remove();
      var existingMin = document.getElementById('tb-feedback-widget-minimized');
      if (existingMin) existingMin.remove();
      
      // If hidden, show minimized button instead
      if (this.isHidden) {
        this.showMinimizedButton();
        return;
      }
      
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
      var hideBtn = widget.querySelector('[data-action="hide-widget"]');
      
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
      if (hideBtn) {
        hideBtn.onclick = function(e) { 
          e.stopPropagation();
          feedbackWidget.toggleVisibility(); 
        };
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
      if (this.widgetStyle === 'honey-bee') {
        return this.getHoneyBeeHTML(state);
      }
      if (this.widgetStyle === 'glass-bar') {
        return this.getGlassBarHTML(state);
      }
      // Default: glassmorphic button style
      return this.getGlassmorphicHTML(state);
    },
    
    // Branding footer for all widgets
    getBranding: function(theme) {
      var styles = {
        light: 'margin-top:12px;padding-top:12px;border-top:1px solid rgba(0,0,0,0.1);text-align:center;',
        dark: 'margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;',
        gold: 'margin-top:12px;padding-top:12px;border-top:2px solid rgba(212,175,55,0.3);text-align:center;'
      };
      
      var textColors = {
        light: 'color:#999;',
        dark: 'color:rgba(255,255,255,0.6);',
        gold: 'color:rgba(212,175,55,0.8);'
      };
      
      var style = styles[theme] || styles.light;
      var textColor = textColors[theme] || textColors.light;
      
      return '<div style="' + style + '"><a href="https://web-analytics-flax.vercel.app/signup" target="_blank" rel="noopener" style="' + textColor + 'text-decoration:none;font-size:10px;font-weight:600;transition:opacity 0.2s;display:inline-flex;align-items:center;gap:4px;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0.7\'"><span style="opacity:0.7;">Powered by</span> <span style="font-weight:700;">Trackerbeez 🐝🐝🐝</span></a></div>';
    },
    
    getGlassmorphicHTML: function(state) {
      var styles = {
        base: 'position:fixed;bottom:20px;right:20px;z-index:9999;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
        collapsed: 'width:60px;height:60px;border-radius:30px;background:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.12),0 0 0 0 rgba(255,255,255,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;animation:pulseGlow 3s ease-in-out infinite;',
        expanded: 'width:320px;min-height:200px;border-radius:16px;background:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.12);padding:20px;'
      };
      
      if (state === 'collapsed') {
        return '<div style="' + styles.base + styles.collapsed + '"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;" data-action="expand"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div><div data-action="hide-widget" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:rgba(0,0,0,0.7);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0.7;transition:opacity 0.2s;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0.7\'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div></div><style>@keyframes pulseGlow { 0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 0 rgba(255,255,255,0.5); } 50% { box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 20px 5px rgba(255,255,255,0.8); }}@media (max-width: 768px) { #tb-feedback-widget { bottom:16px !important; right:16px !important; width:52px !important; height:52px !important; } #tb-feedback-widget.expanded { width:calc(100vw - 32px) !important; max-width:320px !important; }}</style>';
      }
      
      if (state === 'expanded') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;"><div style="font-size:20px;margin-bottom:10px;">🎙️</div><h3 style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#111;">Voice Feedback</h3><p style="margin:0 0 20px 0;font-size:13px;color:#666;">Share your thoughts (max 60s)</p><button data-action="start-recording" style="width:100%;padding:12px;background:linear-gradient(135deg,#EF4444,#DC2626);color:white;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 2px 8px rgba(239,68,68,0.3);">Start Recording</button><button data-action="collapse" style="width:100%;margin-top:10px;padding:8px;background:transparent;color:#666;border:none;font-size:12px;cursor:pointer;">Cancel</button>' + this.getBranding('light') + '</div></div>';
      }
      
      if (state === 'recording') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;"><div style="width:60px;height:60px;margin:0 auto 15px;background:#EF4444;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:recordPulse 1.5s ease-in-out infinite;"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4"/></svg></div><div id="tb-timer" style="font-size:24px;font-weight:600;color:#111;margin-bottom:20px;">00:00</div><button data-action="stop-recording" style="width:100%;padding:12px;background:#111;color:white;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;">Stop Recording</button></div><style>@keyframes recordPulse { 0%, 100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.1); opacity:0.8; }}</style></div>';
      }
      
      if (state === 'review') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;"><div style="font-size:20px;margin-bottom:10px;">🎧</div><h3 style="margin:0 0 15px 0;font-size:16px;font-weight:600;color:#111;">Review Recording</h3><audio id="tb-review-audio" controls style="width:100%;margin-bottom:20px;"></audio><button data-action="submit" style="width:100%;padding:12px;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;margin-bottom:10px;">Submit Feedback</button><button data-action="redo" style="width:100%;padding:8px;background:transparent;color:#666;border:none;font-size:12px;cursor:pointer;">Record Again</button>' + this.getBranding('light') + '</div></div>';
      }
      
      if (state === 'submitting') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;padding:20px 0;"><div style="width:40px;height:40px;margin:0 auto 15px;border:3px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin:0;font-size:14px;color:#666;">Submitting...</p>' + this.getBranding('light') + '</div><style>@keyframes spin { to { transform:rotate(360deg); }}</style></div>';
      }
      
      if (state === 'thankyou') {
        return '<div style="' + styles.base + styles.expanded + '"><div style="text-align:center;padding:20px 0;"><div style="font-size:48px;margin-bottom:10px;animation:scaleIn 0.3s ease-out;">✅</div><h3 style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#111;">Thank You!</h3><p style="margin:0;font-size:13px;color:#666;">Your feedback has been received</p>' + this.getBranding('light') + '</div><style>@keyframes scaleIn { from { transform:scale(0); } to { transform:scale(1); }}</style></div>';
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
          quotesHTML = '<div style="overflow:hidden;flex:1;position:relative;"><div id="tb-ticker-scroll" style="display:flex;animation:tickerScroll 20s linear infinite;">' + quotes + quotes + '</div></div>';
        } else {
          quotesHTML = '<div style="flex:1;padding:0 20px;font-size:14px;color:#333;">💭 Share your feedback with us</div>';
        }
        
        return '<div style="position:fixed;bottom:0;left:0;right:0;z-index:9998;background:linear-gradient(90deg,#FEF3C7,#FDE68A,#FCD34D);border-top:2px solid #F59E0B;box-shadow:0 -4px 12px rgba(0,0,0,0.1);display:flex;align-items:center;height:50px;font-family:system-ui,-apple-system,sans-serif;">' + quotesHTML + '<div style="padding:0 20px;border-left:2px solid #F59E0B;cursor:pointer;display:flex;align-items:center;gap:8px;" data-action="expand"><span style="font-size:24px;">🎤</span><span style="font-size:14px;font-weight:600;color:#92400E;">Submit Feedback →</span></div><div data-action="hide-widget" style="padding:0 12px;cursor:pointer;display:flex;align-items:center;opacity:0.6;transition:opacity 0.2s;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0.6\'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div></div><style>@keyframes tickerScroll { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); }}</style>';
      }
      
      // Modal for recording/states (overlays ticker)
      var modalBase = 'position:fixed;bottom:60px;right:20px;width:320px;background:white;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:9999;padding:24px;';
      
      if (state === 'expanded') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:12px;">🎙️</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Voice Feedback</h3><p style="margin:0 0 20px 0;font-size:14px;color:#666;">Share your thoughts (max 60s)</p><button data-action="start-recording" style="width:100%;padding:14px;background:linear-gradient(135deg,#EF4444,#DC2626);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(239,68,68,0.3);">Start Recording</button><button data-action="collapse" style="width:100%;margin-top:12px;padding:10px;background:transparent;color:#666;border:none;font-size:13px;cursor:pointer;">Cancel</button>' + this.getBranding('light') + '</div></div>';
      }
      
      if (state === 'recording') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="width:70px;height:70px;margin:0 auto 20px;background:#EF4444;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:recordPulse 1.5s ease-in-out infinite;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4"/></svg></div><div id="tb-timer" style="font-size:28px;font-weight:700;color:#111;margin-bottom:24px;">00:00</div><button data-action="stop-recording" style="width:100%;padding:14px;background:#111;color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">Stop Recording</button>' + this.getBranding('light') + '</div><style>@keyframes recordPulse { 0%, 100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.1); opacity:0.8; }}</style></div>';
      }
      
      if (state === 'review') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:12px;">🎧</div><h3 style="margin:0 0 20px 0;font-size:18px;font-weight:600;color:#111;">Review Recording</h3><audio id="tb-review-audio" controls style="width:100%;margin-bottom:20px;"></audio><button data-action="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:12px;">Submit Feedback</button><button data-action="redo" style="width:100%;padding:10px;background:transparent;color:#666;border:none;font-size:13px;cursor:pointer;">Record Again</button>' + this.getBranding('light') + '</div></div>';
      }
      
      if (state === 'submitting') {
        return '<div style="' + modalBase + '"><div style="text-align:center;padding:20px 0;"><div style="width:50px;height:50px;margin:0 auto 20px;border:4px solid #e5e7eb;border-top-color:#F59E0B;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin:0;font-size:15px;color:#666;">Submitting...</p>' + this.getBranding('light') + '</div><style>@keyframes spin { to { transform:rotate(360deg); }}</style></div>';
      }
      
      if (state === 'thankyou') {
        return '<div style="' + modalBase + '"><div style="text-align:center;padding:20px 0;"><div style="font-size:60px;margin-bottom:16px;animation:scaleIn 0.3s ease-out;">✅</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Thank You!</h3><p style="margin:0;font-size:14px;color:#666;">Your feedback has been received</p>' + this.getBranding('light') + '</div><style>@keyframes scaleIn { from { transform:scale(0); } to { transform:scale(1); }}</style></div>';
      }
      
      return '';
    },
    
    getB2BSaasHTML: function(state) {
      // B2B SaaS ticker - faster scroll, product-focused, neutral slate theme
      if (state === 'collapsed') {
        var quotesHTML = '';
        if (this.recentQuotes.length > 0) {
          // Create fast-scrolling product feedback quotes
          var quotes = this.recentQuotes.map(function(q) {
            return '<span style="display:inline-block;padding:0 50px;white-space:nowrap;font-size:13px;">💬 ' + q.substring(0, 70) + (q.length > 70 ? '...' : '') + '</span>';
          }).join('');
          quotesHTML = '<div style="overflow:hidden;flex:1;position:relative;"><div id="tb-ticker-scroll" style="display:flex;animation:tickerScrollFast 8s linear infinite;">' + quotes + quotes + '</div></div>';
        } else {
          quotesHTML = '<div style="flex:1;padding:0 20px;font-size:13px;color:#E2E8F0;font-weight:500;">💡 Share your product feedback</div>';
        }
        
        return '<div style="position:fixed;bottom:0;left:0;right:0;z-index:9998;background:linear-gradient(90deg,#1E293B,#334155,#475569);border-top:2px solid #64748B;box-shadow:0 -4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;height:48px;font-family:system-ui,-apple-system,sans-serif;">' + quotesHTML + '<div style="padding:0 20px;border-left:2px solid #64748B;cursor:pointer;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);transition:background 0.2s;" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.08)\'" data-action="expand"><span style="font-size:20px;">🎤</span><span style="font-size:13px;font-weight:700;color:#FFF;text-transform:uppercase;letter-spacing:0.5px;">Voice Feedback</span></div><div data-action="hide-widget" style="padding:0 12px;cursor:pointer;display:flex;align-items:center;opacity:0.7;transition:opacity 0.2s;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0.7\'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div></div><style>@keyframes tickerScrollFast { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); }}</style>';
      }
      
      // Modal for recording/states (same as ticker but slate theme)
      var modalBase = 'position:fixed;bottom:58px;right:20px;width:320px;background:white;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:9999;padding:24px;border:2px solid #64748B;';
      
      if (state === 'expanded') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:12px;">🎤</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Voice Product Feedback</h3><p style="margin:0 0 20px 0;font-size:14px;color:#666;">Help us build what you need (max 60s)</p><button data-action="start-recording" style="width:100%;padding:14px;background:linear-gradient(135deg,#8B5CF6,#A855F7);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(139,92,246,0.3);">Start Recording</button><button data-action="collapse" style="width:100%;margin-top:12px;padding:10px;background:transparent;color:#666;border:none;font-size:13px;cursor:pointer;">Cancel</button>' + this.getBranding('light') + '</div></div>';
      }
      
      if (state === 'recording') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="width:70px;height:70px;margin:0 auto 20px;background:#8B5CF6;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:recordPulse 1.5s ease-in-out infinite;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4"/></svg></div><div id="tb-timer" style="font-size:28px;font-weight:700;color:#111;margin-bottom:24px;">00:00</div><button data-action="stop-recording" style="width:100%;padding:14px;background:#111;color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">Stop Recording</button>' + this.getBranding('light') + '</div><style>@keyframes recordPulse { 0%, 100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.1); opacity:0.8; }}</style></div>';
      }
      
      if (state === 'review') {
        return '<div style="' + modalBase + '"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:12px;">🎧</div><h3 style="margin:0 0 20px 0;font-size:18px;font-weight:600;color:#111;">Review Recording</h3><audio id="tb-review-audio" controls style="width:100%;margin-bottom:20px;"></audio><button data-action="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:12px;">Submit Feedback</button><button data-action="redo" style="width:100%;padding:10px;background:transparent;color:#666;border:none;font-size:13px;cursor:pointer;">Record Again</button>' + this.getBranding('light') + '</div></div>';
      }
      
      if (state === 'submitting') {
        return '<div style="' + modalBase + '"><div style="text-align:center;padding:20px 0;"><div style="width:50px;height:50px;margin:0 auto 20px;border:4px solid #e5e7eb;border-top-color:#8B5CF6;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin:0;font-size:15px;color:#666;">Submitting...</p>' + this.getBranding('light') + '</div><style>@keyframes spin { to { transform:rotate(360deg); }}</style></div>';
      }
      
      if (state === 'thankyou') {
        return '<div style="' + modalBase + '"><div style="text-align:center;padding:20px 0;"><div style="font-size:60px;margin-bottom:16px;animation:scaleIn 0.3s ease-out;">✅</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Thank You!</h3><p style="margin:0;font-size:14px;color:#666;">Your feedback will help shape our roadmap</p>' + this.getBranding('light') + '</div><style>@keyframes scaleIn { from { transform:scale(0); } to { transform:scale(1); }}</style></div>';
      }
      
      return '';
    },
    
    getHoneyBeeHTML: function(state) {
      // Honey-Bee - Gamified, engaging widget with bee animations
      if (state === 'collapsed') {
        return '<div style="position:fixed;bottom:20px;right:20px;z-index:9999;transition:all 0.3s ease;"><div style="position:relative;width:80px;height:80px;background:linear-gradient(135deg,#FCD34D 0%,#F59E0B 100%);border-radius:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(245,158,11,0.4);animation:honeyBounce 2s ease-in-out infinite;border:3px solid #D97706;" data-action="expand"><div style="font-size:36px;animation:beeWiggle 1s ease-in-out infinite;">🐝</div><div style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);background:#FEF3C7;color:#92400E;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:2px solid #FDE68A;">Share Buzz!</div></div><div data-action="hide-widget" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;background:#DC2626;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.2);opacity:0.8;transition:all 0.2s;" onmouseover="this.style.opacity=\'1\';this.style.transform=\'scale(1.1)\'" onmouseout="this.style.opacity=\'0.8\';this.style.transform=\'scale(1)\'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div></div><style>@keyframes honeyBounce { 0%, 100% { transform:translateY(0px); } 50% { transform:translateY(-8px); }} @keyframes beeWiggle { 0%, 100% { transform:rotate(-5deg); } 50% { transform:rotate(5deg); }} @media (max-width: 768px) { #tb-feedback-widget > div { width:65px !important; height:65px !important; } #tb-feedback-widget svg { font-size:28px !important; }}</style>';
      }
      
      if (state === 'expanded') {
        return '<div style="position:fixed;bottom:20px;right:20px;width:340px;background:linear-gradient(135deg,#FEF3C7 0%,#FDE68A 50%,#FCD34D 100%);border-radius:20px;box-shadow:0 20px 60px rgba(245,158,11,0.3);z-index:9999;padding:24px;border:3px solid #F59E0B;"><div style="text-align:center;"><div style="font-size:48px;margin-bottom:12px;animation:beeFloat 3s ease-in-out infinite;">🐝</div><h3 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#92400E;text-shadow:0 2px 4px rgba(0,0,0,0.1);">Buzz with Us!</h3><p style="margin:0 0 20px 0;font-size:14px;color:#78350F;font-weight:600;">Share your sweet thoughts 🍯</p><div style="background:rgba(255,255,255,0.6);border-radius:12px;padding:12px;margin-bottom:16px;border:2px solid #FDE68A;"><p style="margin:0;font-size:12px;color:#92400E;font-weight:600;">🎁 Every voice note helps us improve!</p></div><button data-action="start-recording" style="width:100%;padding:16px;background:linear-gradient(135deg,#EF4444,#DC2626);color:white;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(239,68,68,0.4);transition:all 0.2s;text-transform:uppercase;letter-spacing:0.5px;" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 8px 25px rgba(239,68,68,0.5)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 6px 20px rgba(239,68,68,0.4)\'">🎤 Start Recording</button><button data-action="collapse" style="width:100%;margin-top:12px;padding:10px;background:rgba(0,0,0,0.1);color:#92400E;border:none;font-size:13px;cursor:pointer;border-radius:8px;font-weight:600;">Maybe Later</button>' + this.getBranding('gold') + '</div><style>@keyframes beeFloat { 0%, 100% { transform:translateY(0px) rotate(-5deg); } 50% { transform:translateY(-12px) rotate(5deg); }}</style></div>';
      }
      
      if (state === 'recording') {
        return '<div style="position:fixed;bottom:20px;right:20px;width:340px;background:linear-gradient(135deg,#FEF3C7 0%,#FDE68A 50%,#FCD34D 100%);border-radius:20px;box-shadow:0 20px 60px rgba(245,158,11,0.3);z-index:9999;padding:24px;border:3px solid #F59E0B;"><div style="text-align:center;"><div style="width:90px;height:90px;margin:0 auto 20px;background:linear-gradient(135deg,#EF4444,#DC2626);border-radius:50%;display:flex;align-items:center;justify-content:center;animation:recordPulseHoney 1.2s ease-in-out infinite;box-shadow:0 0 40px rgba(239,68,68,0.6),inset 0 0 20px rgba(255,255,255,0.3);border:4px solid #FEF3C7;"><div style="font-size:40px;animation:beeRecording 0.8s ease-in-out infinite;">🐝</div></div><div style="background:rgba(255,255,255,0.8);border-radius:16px;padding:12px;margin-bottom:20px;border:2px solid #FDE68A;"><div id="tb-timer" style="font-size:32px;font-weight:900;color:#DC2626;text-shadow:0 2px 4px rgba(0,0,0,0.1);">00:00</div><p style="margin:4px 0 0 0;font-size:12px;color:#92400E;font-weight:600;">Recording your buzz... 🎙️</p></div><button data-action="stop-recording" style="width:100%;padding:16px;background:#000;color:#FCD34D;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.3);text-transform:uppercase;letter-spacing:0.5px;">Stop Recording</button>' + this.getBranding('gold') + '</div><style>@keyframes recordPulseHoney { 0%, 100% { transform:scale(1); box-shadow:0 0 40px rgba(239,68,68,0.6),inset 0 0 20px rgba(255,255,255,0.3); } 50% { transform:scale(1.05); box-shadow:0 0 60px rgba(239,68,68,0.8),inset 0 0 30px rgba(255,255,255,0.5); }} @keyframes beeRecording { 0%, 100% { transform:scale(1) rotate(0deg); } 50% { transform:scale(1.1) rotate(10deg); }}</style></div>';
      }
      
      if (state === 'review') {
        return '<div style="position:fixed;bottom:20px;right:20px;width:340px;background:linear-gradient(135deg,#FEF3C7 0%,#FDE68A 50%,#FCD34D 100%);border-radius:20px;box-shadow:0 20px 60px rgba(245,158,11,0.3);z-index:9999;padding:24px;border:3px solid #F59E0B;"><div style="text-align:center;"><div style="font-size:48px;margin-bottom:12px;animation:beeApprove 2s ease-in-out infinite;">🐝👂</div><h3 style="margin:0 0 16px 0;font-size:20px;font-weight:800;color:#92400E;text-shadow:0 2px 4px rgba(0,0,0,0.1);">Listen to Your Buzz</h3><div style="background:rgba(255,255,255,0.7);border-radius:12px;padding:16px;margin-bottom:20px;border:2px solid #FDE68A;"><audio id="tb-review-audio" controls style="width:100%;"></audio></div><button data-action="submit" style="width:100%;padding:16px;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(16,185,129,0.4);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;transition:all 0.2s;" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 8px 25px rgba(16,185,129,0.5)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 6px 20px rgba(16,185,129,0.4)\'">🍯 Send Feedback</button><button data-action="redo" style="width:100%;padding:12px;background:rgba(0,0,0,0.1);color:#92400E;border:none;font-size:13px;cursor:pointer;border-radius:8px;font-weight:600;">🔄 Record Again</button>' + this.getBranding('gold') + '</div><style>@keyframes beeApprove { 0%, 100% { transform:rotate(-10deg); } 50% { transform:rotate(10deg); }}</style></div>';
      }
      
      if (state === 'submitting') {
        return '<div style="position:fixed;bottom:20px;right:20px;width:340px;background:linear-gradient(135deg,#FEF3C7 0%,#FDE68A 50%,#FCD34D 100%);border-radius:20px;box-shadow:0 20px 60px rgba(245,158,11,0.3);z-index:9999;padding:24px;border:3px solid #F59E0B;"><div style="text-align:center;padding:20px 0;"><div style="width:70px;height:70px;margin:0 auto 20px;border:5px solid #FDE68A;border-top-color:#F59E0B;border-radius:50%;animation:honeySpinner 1s linear infinite;"></div><div style="font-size:32px;margin-bottom:12px;animation:beeDeliver 1.5s ease-in-out infinite;">🐝📦</div><p style="margin:0;font-size:16px;color:#92400E;font-weight:700;">Delivering your buzz...</p>' + this.getBranding('gold') + '</div><style>@keyframes honeySpinner { to { transform:rotate(360deg); }} @keyframes beeDeliver { 0%, 100% { transform:translateX(-10px); } 50% { transform:translateX(10px); }}</style></div>';
      }
      
      if (state === 'thankyou') {
        return '<div style="position:fixed;bottom:20px;right:20px;width:340px;background:linear-gradient(135deg,#FEF3C7 0%,#FDE68A 50%,#FCD34D 100%);border-radius:20px;box-shadow:0 20px 60px rgba(245,158,11,0.3);z-index:9999;padding:32px;border:3px solid #F59E0B;"><div style="text-align:center;"><div style="font-size:80px;margin-bottom:16px;animation:beeCelebrate 0.6s ease-out;">🎉🐝</div><h3 style="margin:0 0 12px 0;font-size:24px;font-weight:900;color:#92400E;text-shadow:0 2px 4px rgba(0,0,0,0.1);">Bee-utiful!</h3><p style="margin:0 0 16px 0;font-size:15px;color:#78350F;font-weight:600;">Your buzz has been heard loud and clear! 🍯</p><div style="background:linear-gradient(135deg,#10B981,#059669);color:white;border-radius:12px;padding:12px;border:2px solid #ECFDF5;"><p style="margin:0;font-size:13px;font-weight:600;">🏆 Thanks for making us better!</p></div>' + this.getBranding('gold') + '</div><style>@keyframes beeCelebrate { from { transform:scale(0) rotate(-180deg); opacity:0; } to { transform:scale(1) rotate(0deg); opacity:1; }}</style></div>';
      }
      
      return '';
    },
    
    getGlassBarHTML: function(state) {
      // Glass Bar - Centered bottom bar with glassmorphism effect
      if (state === 'collapsed') {
        return '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:600px;transition:all 0.3s ease;"><div style="position:relative;background:rgba(255,255,255,0.15);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);border-radius:50px;padding:12px 20px;box-shadow:0 8px 32px rgba(0,0,0,0.1);display:flex;align-items:center;gap:12px;"><input type="text" placeholder="Type or via tekbt" style="flex:1;background:transparent;border:none;outline:none;color:#333;font-size:15px;font-weight:500;font-family:system-ui,-apple-system,sans-serif;padding:8px 12px;" readonly data-action="expand" /><div style="width:40px;height:40px;background:rgba(139,92,246,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(139,92,246,0.3)\'" onmouseout="this.style.background=\'rgba(139,92,246,0.2)\'" data-action="expand"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div><div style="width:32px;height:32px;background:rgba(0,0,0,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;margin-left:4px;" onmouseover="this.style.background=\'rgba(0,0,0,0.15)\'" onmouseout="this.style.background=\'rgba(0,0,0,0.1)\'" data-action="hide-widget"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div></div></div><style>@media (max-width: 768px) { #tb-feedback-widget > div { width:calc(100% - 32px) !important; }}</style>';
      }
      
      if (state === 'expanded') {
        return '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:600px;"><div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="text-align:center;"><div style="font-size:32px;margin-bottom:12px;">🎙️</div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#111;">Voice Feedback</h3><p style="margin:0 0 20px 0;font-size:14px;color:#666;">Share your thoughts (max 60s)</p><button data-action="start-recording" style="width:100%;padding:14px;background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:white;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(139,92,246,0.3);transition:all 0.2s;" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 16px rgba(139,92,246,0.4)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 4px 12px rgba(139,92,246,0.3)\'">Start Recording</button><button data-action="collapse" style="width:100%;margin-top:12px;padding:10px;background:transparent;color:#999;border:none;font-size:13px;cursor:pointer;font-weight:500;">Cancel</button>' + this.getBranding('light') + '</div></div></div>';
      }
      
      if (state === 'recording') {
        return '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:600px;"><div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="text-align:center;"><div style="width:70px;height:70px;margin:0 auto 18px;background:linear-gradient(135deg,#EF4444,#DC2626);border-radius:50%;display:flex;align-items:center;justify-content:center;animation:recordPulse 1.5s ease-in-out infinite;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="5"/></svg></div><div id="tb-timer" style="font-size:32px;font-weight:700;color:#111;margin-bottom:20px;">00:00</div><button data-action="stop-recording" style="width:100%;padding:14px;background:#111;color:white;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">Stop Recording</button></div><style>@keyframes recordPulse { 0%, 100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.08); opacity:0.9; }}</style></div></div>';
      }
      
      if (state === 'review') {
        return '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:600px;"><div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="text-align:center;"><div style="font-size:32px;margin-bottom:12px;">🎧</div><h3 style="margin:0 0 18px 0;font-size:18px;font-weight:700;color:#111;">Review Recording</h3><audio id="tb-review-audio" controls style="width:100%;margin-bottom:20px;"></audio><button data-action="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:12px;transition:all 0.2s;" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 16px rgba(16,185,129,0.4)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 4px 12px rgba(16,185,129,0.3)\'">Submit Feedback</button><button data-action="redo" style="width:100%;padding:10px;background:transparent;color:#999;border:none;font-size:13px;cursor:pointer;font-weight:500;">Record Again</button>' + this.getBranding('light') + '</div></div></div>';
      }
      
      if (state === 'submitting') {
        return '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:600px;"><div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="text-align:center;padding:20px 0;"><div style="width:50px;height:50px;margin:0 auto 18px;border:4px solid #e5e7eb;border-top-color:#8B5CF6;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin:0;font-size:15px;color:#666;font-weight:500;">Submitting...</p>' + this.getBranding('light') + '</div><style>@keyframes spin { to { transform:rotate(360deg); }}</style></div></div>';
      }
      
      if (state === 'thankyou') {
        return '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:600px;"><div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="text-align:center;padding:10px 0;"><div style="font-size:56px;margin-bottom:12px;animation:scaleIn 0.4s ease-out;">✅</div><h3 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#111;">Thank You!</h3><p style="margin:0;font-size:14px;color:#666;">Your feedback has been received</p>' + this.getBranding('light') + '</div><style>@keyframes scaleIn { from { transform:scale(0); } to { transform:scale(1); }}</style></div></div>';
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

  // ========================
  // SESSION RECORDING (rrweb)
  // ========================
  var sessionRecorder = {
    stopFn: null,
    events: [],
    recordingSessionId: null,
    recordingStarted: null,
    batchTimer: null,
    isRecording: false,
    
    init: function() {
      console.log('🎬 Session recorder init called');
      
      // Check if session recording is enabled for this client
      fetch(apiEndpoint.replace('/track', '/sessions/enabled?clientId=' + clientId))
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (!data.enabled) {
            console.log('🎬 Session recording is disabled for this site');
            return;
          }
          
          console.log('🎬 Session recording is enabled - loading rrweb');
          
          // Load rrweb from CDN
          var script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js';
          console.log('🎬 Loading rrweb from CDN:', script.src);
          script.onload = function() {
            console.log('🎬 rrweb loaded successfully');
            sessionRecorder.startRecording();
          };
          script.onerror = function(err) {
            console.error('🎬 Session recording unavailable - rrweb failed to load:', err);
          };
          document.head.appendChild(script);
        })
        .catch(function(err) {
          console.log('🎬 Session recording check failed:', err);
        });
    },
    
    startRecording: function() {
      if (!window.rrweb || this.isRecording) return;
      
      // Use the same session ID for continuity across page loads
      this.recordingSessionId = sessionId;
      this.recordingStarted = Date.now();
      this.events = [];
      this.isRecording = true;
      
      // Start recording with privacy controls
      this.stopFn = window.rrweb.record({
        emit: function(event) {
          sessionRecorder.events.push(event);
          
          // Send batch every 30 events (reduced from 50 to prevent large batches)
          if (sessionRecorder.events.length >= 30) {
            sessionRecorder.sendBatch();
          }
        },
        
        // Privacy settings - auto-mask sensitive data
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
          email: true,
          tel: true,
          text: false,
        },
        maskTextSelector: '[data-sensitive], .sensitive',
        blockClass: 'rr-block',
        blockSelector: '[data-recording-ignore]',
        ignoreClass: 'rr-ignore',
        
        // Capture settings
        checkoutEveryNms: 5 * 60 * 1000, // Full snapshot every 5 mins
        checkoutEveryNth: 200,
        
        // Sampling
        mousemoveWait: 50,
        
        // Privacy: don't record on sensitive pages
        recordCanvas: false,
        collectFonts: false,
      });
      
      // Send batch every 10 seconds (reduced frequency to prevent timeouts)
      this.batchTimer = setInterval(function() {
        if (sessionRecorder.events.length > 0) {
          sessionRecorder.sendBatch();
        }
      }, 10000);
      
      console.log('Session recording started');
    },
    
    sendBatch: function() {
      if (this.events.length === 0) return;
      
      var batch = this.events.splice(0, this.events.length);
      var duration = Date.now() - this.recordingStarted;
      
      fetch(apiEndpoint.replace('/track', '/sessions/record'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId,
          sessionId: this.recordingSessionId,
          visitorId: sessionId,
          url: window.location.href,
          pageTitle: document.title,
          events: batch,
          durationMs: duration,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        }),
        mode: 'cors',
        credentials: 'omit'
      }).then(function(res) {
        if (!res.ok) {
          console.log('Session recording batch failed:', res.status);
        }
      }).catch(function(err) {
        console.log('Session recording error:', err);
      });
    },
    
    stop: function() {
      if (this.stopFn) {
        this.stopFn();
        this.stopFn = null;
      }
      if (this.batchTimer) {
        clearInterval(this.batchTimer);
      }
      // Send final batch
      this.sendBatch();
      this.isRecording = false;
    },
    
    pause: function() {
      if (this.stopFn && this.isRecording) {
        this.stopFn();
        this.stopFn = null;
        this.isRecording = false;
        console.log('🎬 Recording paused');
      }
    },
    
    resume: function() {
      if (!this.isRecording && window.rrweb && !this.stopFn) {
        // Restart recording
        this.stopFn = window.rrweb.record({
          emit: function(event) {
            sessionRecorder.events.push(event);
            if (sessionRecorder.events.length >= 30) {
              sessionRecorder.sendBatch();
            }
          },
          maskAllInputs: true,
          maskInputOptions: { password: true, email: true, tel: true, text: false },
          maskTextSelector: '[data-sensitive], .sensitive',
          blockClass: 'rr-block',
          blockSelector: '[data-recording-ignore]',
          ignoreClass: 'rr-ignore',
          checkoutEveryNms: 5 * 60 * 1000,
          checkoutEveryNth: 200,
          mousemoveWait: 50,
          recordCanvas: false,
          collectFonts: false,
        });
        this.isRecording = true;
        console.log('🎬 Recording resumed');
      }
    }
  };
  
  // Expose pause/resume globally for drag and drop
  window.rrwebStop = function() { sessionRecorder.pause(); };
  window.rrwebResume = function() { sessionRecorder.resume(); };
  
  // Start recording on page load
  console.log('🎬 Initializing session recorder...');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { 
      console.log('🎬 DOMContentLoaded - starting recorder');
      sessionRecorder.init(); 
    });
  } else {
    console.log('🎬 Document ready - starting recorder immediately');
    sessionRecorder.init();
  }
  
  // Stop recording and send final batch on page exit
  window.addEventListener('beforeunload', function() {
    sessionRecorder.stop();
  });
  
})();

