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

  // Track pageview on load
  track('pageview', window.location.href);

  // Track pageview on history changes (SPA support)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
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

  // Track clicks on elements with data-track attribute
  document.addEventListener('click', function(e) {
    const target = e.target;
    const trackAttr = target.getAttribute('data-track') || target.closest('[data-track]')?.getAttribute('data-track');
    
    if (trackAttr) {
      track('click', window.location.href, {
        element: trackAttr,
        text: target.textContent?.trim().substring(0, 100) || ''
      });
    }
  });

  // Track form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    const formName = form.getAttribute('data-track') || form.id || form.name || 'unnamed-form';
    
    track('form_submit', window.location.href, {
      form: formName
    });
  });

  // Track form field focus (form starts)
  let trackedForms = new Set();
  document.addEventListener('focus', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      const form = e.target.closest('form');
      if (form) {
        const formName = form.getAttribute('data-track') || form.id || form.name || 'unnamed-form';
        const formKey = formName + '-' + window.location.href;
        
        if (!trackedForms.has(formKey)) {
          trackedForms.add(formKey);
          track('form_start', window.location.href, {
            form: formName,
            field: e.target.name || e.target.id || e.target.type
          });
        }
      }
    }
  }, true);

  // Expose global tracking function for custom events
  window.webAnalytics = {
    track: track,
    // Helper for tracking conversions
    conversion: function(value) {
      track('conversion', window.location.href, { value: value || 1 });
    }
  };
})();

