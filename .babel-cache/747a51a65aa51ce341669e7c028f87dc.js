import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise"; /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import { Services } from "../../../src/service";
import { createElementWithAttributes } from "../../../src/core/dom";
import { dev } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { includes } from "../../../src/core/types/string";

/**
 * Renders the page description, and videos title/alt attributes in the page.
 * @param {!./amp-story-page.AmpStoryPage} page
 * @param {!Array<?Element>} videos
 */
export function renderPageDescription(page, videos) {
  var descriptionElId = "i-amphtml-story-".concat(page.element.id, "-description");
  var descriptionEl = createElementWithAttributes(
  page.win.document,
  'div',
  dict({
    'class': 'i-amphtml-story-page-description',
    'id': descriptionElId }));


  var append = function append(el) {
    page.mutateElement(function () {
      descriptionEl.appendChild(el);
      // Add descriptionEl to actual page if that hasn't happened yet.
      if (descriptionEl.parentNode) {
        return;
      }
      page.element.parentElement.insertBefore(
      descriptionEl,
      page.element.nextElementSibling);

      if (!page.element.getAttribute('aria-labelledby')) {
        page.element.setAttribute('aria-labelledby', descriptionElId);
      }
    });
  };

  var addTagToDescriptionEl = function addTagToDescriptionEl(tagName, text) {
    if (!text) {
      return;
    }
    var el = page.win.document.createElement(tagName);
    el. /* OK */textContent = text;
    append(el);
  };

  addTagToDescriptionEl('h2', page.element.getAttribute('title'));

  videos.forEach(function (videoEl) {
    addTagToDescriptionEl('p', videoEl.getAttribute('alt'));
    addTagToDescriptionEl('p', videoEl.getAttribute('title'));
    addTagToDescriptionEl('p', videoEl.getAttribute('aria-label'));
    fetchCaptions(page, videoEl).then(function (text) {
      addTagToDescriptionEl('p', text);
    });
  });
}

/**
 * Fetches captions for a video if available and returns them as plain
 * text.
 * @param {!./amp-story-page.AmpStoryPage} page
 * @param {!Element} videoEl
 * @return {!Promise<string|undefined>}
 */
function fetchCaptions(page, videoEl) {
  // Prefer the default track, otherwise pick the first.
  // Could be extended to prefer the language of the doc.
  var track =
  videoEl.querySelector('track[default]') || videoEl.querySelector('track');
  if (!track || !track.src) {
    return _resolvedPromise();
  }
  return Services.xhrFor(page.win).
  fetchText(track.src, {
    mode: 'cors' }).

  then(function (response) {
    if (!response.ok) {
      return;
    }
    return response.text().then(extractTextContent);
  });
}

/**
 * Extract the text content from a captions file.
 * @param {string} text
 * @return {string}
 * @visibleForTesting
 */
export function extractTextContent(text) {
  text = text.trim();
  if (text.startsWith('WEBVTT')) {
    return extractTextContentWebVtt(text);
  }
  if (includes(text, 'http://www.w3.org/ns/ttml')) {
    return extractTextContentTtml(text);
  }

  return '';
}

/**
 * Extract the text content from a TTML file.
 * https://www.w3.org/TR/2018/REC-ttml2-20181108/
 * @param {string} text
 * @return {string}
 */
function extractTextContentTtml(text) {
  try {
    var doc = new DOMParser().parseFromString(text, 'text/xml');
    return doc.
    querySelector('body').
    textContent.replace(/[\s\n\r]+/g, ' ').
    trim();
  } catch (e) {
    dev().error('TTML', e.message);
  }
  return '';
}

/**
 * Extract the text content from a WebVTT file.
 * https://www.w3.org/TR/webvtt1/
 * @param {string} text
 * @return {string}
 */
function extractTextContentWebVtt(text) {
  var queue = /^\d\d\:\d\d/;
  var seenQueue = false;
  text = text.
  split(/[\n\r]+/).
  filter(function (line) {
    var isQueue = queue.test(line);
    seenQueue = seenQueue || isQueue;
    // Filter queues and everything before.
    if (!seenQueue || isQueue) {
      return false;
    }
    // Filter comments.
    return !/^NOTE\s+/.test(line);
  }).
  map(function (line) {
    return (
    line
    // Strip multiline indicators.
    .replace(/^- /, ''));

  }).
  join(' ');
  // Super loose HTML parsing to get HTML entity parsing and removal
  // of WebVTT elements.
  var div = document.createElement('div');
  div. /* element is never added to DOM */innerHTML = text;
  return div.textContent;
}
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/semantic-render.js