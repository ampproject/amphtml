

var disabled = false;

var defaultBaseUrl = 'http://localhost:8000/';

var baseUrl = defaultBaseUrl;

// Rewrite cdn.ampproject.org
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (disabled) {
      return {
        redirectUrl: details.url
      }
    }
    // Massage to local path patterns.
    var path = details.url.substr('https://cdn.ampproject.org/'.length);
    if (/^v\d+\.js$/.test(path)) {
      path = 'dist/amp.js';
    } else {
      path = 'dist/' + path;
      path = path.replace(/\.js$/, '.max.js');
    }
    return {
      redirectUrl: baseUrl + path
    };
  },
  {
    urls: ['https://cdn.ampproject.org/*']
  },
  ['blocking']);


// Rewrite 3p.ampproject.net
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (disabled) {
      return {
        redirectUrl: details.url
      }
    }
    // Massage to local path patterns.
    var path = details.url.substr('https://3p.ampproject.net/'.length);
    path = path.replace(/^\d+/, 'dist.3p/current');
    path = path.replace(/\/frame\.html/, '/frame.max.html');
    if (/\/f\.js$/.test(path)) {
      path = path.replace(/\/f\.js$/, '/integration.js');
    }
    return {
      redirectUrl: baseUrl + path
    };
  },
  {
    urls: ['https://3p.ampproject.net/*']
  },
  ['blocking']);

  function updateBadge() {
    if (disabled) {
      chrome.browserAction.setBadgeText({
        text: "OFF"
      });
      chrome.browserAction.setBadgeBackgroundColor({
        color: "#7e2013"
      });
    } else {
      chrome.browserAction.setBadgeText({
        text: "ON"
      });
      chrome.browserAction.setBadgeBackgroundColor({
        color: "#15a341"
      });
    }
  }

  updateBadge();
