(function() {
  'use strict';
  
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
      user_agent: navigator.userAgent
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
})();

