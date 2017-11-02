
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
 * Extracts meta tags from the document.
 * @return {Array} array of keywords
 */
function extractMetaTags(doc) {
  const selectors = ['meta[name=keywords]', 'meta[name=news_keywords]',
    'meta[property=\'article:tag\']'];
  return selectors.reduce((tagArray, selector) => {
    const keywordsElement = doc.querySelector(selector);
    if (keywordsElement && keywordsElement.content) {
      return tagArray.concat(keywordsElement.content.split(',')
      .map(t => t.trim()));
    }
    return tagArray;
  }, []);
}

/**
 * Extracts tags from a given element and document.
 * @param element
 * @param doc
 */
export function extractTags(element, doc) {
  const metaTags = extractMetaTags(doc);
  const extractags = extractElementTags(element);
  const proccessedTags = metaTags.concat(extractags);
  const loweredCase = proccessedTags.map(tag => tag.toLowerCase().trim());
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
    if (event.data.type === eventName && fromApesterMedia) {
      callback(event.data);
    }
  });
  unlisteners.push(unlisten);
}

