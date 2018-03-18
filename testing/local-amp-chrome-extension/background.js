/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var disabled = false;

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
      redirectUrl: 'http://localhost:8000/' + path
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
      redirectUrl: 'http://localhost:8000/' + path
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
