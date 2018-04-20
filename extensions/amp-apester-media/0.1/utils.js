/**
 * Copyright 2017 The AMP HTML Authors.
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

import * as events from '../../../src/event-helper';

const rules = [
  // if it says it's a webview, let's go with that
  'WebView',
  // iOS webview will be the same as safari but missing "Safari"
  '(iPhone|iPod|iPad)(?!.*Safari)',
  // Android Lollipop and Above: webview will be the same as native but it will contain "wv"
  // Android KitKat to lollipop webview will put {version}.0.0.0
  'Android.*(wv|\.0\.0\.0)',
  // old chrome android webview agent
  'Linux; U; Android',
];
const webviewRegExp = new RegExp('(' + rules.join('|') + ')', 'ig');

function isWebview(ua) {
  return !!ua.match(webviewRegExp);
}

/**
 * Gets the user platform.
 * @returns {string}
 */
export function getPlatform() {
  const webview = isWebview(navigator.userAgent);
  return `mobile${webview ? '-webview' : ''}`.toLowerCase();
}

/**
 * Extracts tags from a given element .
 * @param element
 */
function extractElementTags(element) {
  const tagsAttribute = element.getAttribute('data-apester-tags');
  if (tagsAttribute) {
    return tagsAttribute.split(',').map(tag => tag.trim()) || [];
  }
  return [];
}

/**
 * Extracts tags from a given element and document.
 * @param element
 * @return {Array<string>}
 */
export function extractTags(element) {
  const extractags = extractElementTags(element);
  const loweredCase = extractags.map(tag => tag.toLowerCase().trim());
  const noDuplication = loweredCase.filter((item, pos, self) =>
    self.indexOf(item) === pos);
  return noDuplication;
}

/**
 * Adds fullscreen class to an element
 * @param element
 */
export function setFullscreenOn(element) {
  element.classList.add('amp-apester-fullscreen');
}

/**
 * removes fullscreen class from an element
 * @param element
 */
export function setFullscreenOff(element) {
  element.classList.remove('amp-apester-fullscreen');
}

/**
 * Registers to an event
 * @param eventName
 * @param callback
 * @param unlisteners
 */
export function registerEvent(eventName, callback, win, iframe, unlisteners) {
  const unlisten = events.listen(win, 'message', event => {
    const fromApesterMedia = iframe.contentWindow === event.source;
    if (events.getData(event)['type'] === eventName && fromApesterMedia) {
      callback(events.getData(event));
    }
  });
  unlisteners.push(unlisten);
}

