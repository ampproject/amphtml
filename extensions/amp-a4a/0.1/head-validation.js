import {removeElement, rootNodeFor} from '#core/dom';
import {map} from '#core/types/object';
import {includes} from '#core/types/string';

import {Services} from '#service';
import {parseExtensionUrl} from '#service/extension-script';

import * as urls from '../../../src/config/urls';
import {preloadFriendlyIframeEmbedExtensions} from '../../../src/friendly-iframe-embed';
import {getMode} from '../../../src/mode';

/**
 * @typedef {{
 *    extensions: !Array<{extensionId: (string|undefined), extensionVersion: (string|undefined)}>,
 *    head: !Element
 * }}
 */
export let ValidatedHeadDef;

// From validator/validator-main.protoascii
const ALLOWED_FONT_REGEX = new RegExp(
  'https://cdn\\.materialdesignicons\\.com/' +
    '([0-9]+\\.?)+/css/materialdesignicons\\.min\\.css|' +
    'https://cloud\\.typography\\.com/' +
    '[0-9]*/[0-9]*/css/fonts\\.css|' +
    'https://fast\\.fonts\\.net/.*|' +
    'https://fonts\\.googleapis\\.com/css2?\\?.*|' +
    'https://fonts\\.googleapis\\.com/icon\\?.*|' +
    'https://fonts\\.googleapis\\.com/earlyaccess/.*\\.css|' +
    'https://maxcdn\\.bootstrapcdn\\.com/font-awesome/' +
    '([0-9]+\\.?)+/css/font-awesome\\.min\\.css(\\?.*)?|' +
    'https://(use|pro)\\.fontawesome\\.com/releases/v([0-9]+\\.?)+' +
    '/css/[0-9a-zA-Z-]+\\.css|' +
    'https://(use|pro)\\.fontawesome\\.com/[0-9a-zA-Z-]+\\.css|' +
    'https://use\\.typekit\\.net/[\\w\\p{L}\\p{N}_]+\\.css'
);

// If editing please also change:
// extensions/amp-a4a/amp-a4a-format.md#allowed-amp-extensions-and-builtins
const EXTENSION_ALLOWLIST = map({
  'amp-accordion': true,
  'amp-ad-exit': true,
  'amp-analytics': true,
  'amp-anim': true,
  'amp-animation': true,
  'amp-audio': true,
  'amp-bind': true,
  'amp-carousel': true,
  'amp-fit-text': true,
  'amp-font': true,
  'amp-form': true,
  'amp-gwd-animation': true,
  'amp-img': true,
  'amp-layout': true,
  'amp-lightbox': true,
  'amp-mraid': true,
  'amp-mustache': true,
  'amp-pixel': true,
  'amp-position-observer': true,
  'amp-selector': true,
  'amp-social-share': true,
  'amp-video': true,
});

/**
 * Escape any regex chars from given string.
 * https://developer.cdn.mozilla.net/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 * @param {string} string
 * @return {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const EXTENSION_URL_PREFIX = new RegExp(
  '^' + escapeRegExp(urls.cdn) + '/(rtv/\\d+/)?v0/'
);

/**
 * Sanitizes AMPHTML Ad head element and extracts extensions to be installed.
 * @param {!Window} win
 * @param {!Element} adElement
 * @param {?Element} head
 * @return {?ValidatedHeadDef}
 */
export function processHead(win, adElement, head) {
  if (!head || !head.firstChild) {
    return null;
  }

  const root = rootNodeFor(head);
  const htmlTag = root.documentElement;
  if (
    !htmlTag ||
    (!htmlTag.hasAttribute('amp4ads') &&
      !htmlTag.hasAttribute('⚡️4ads') &&
      !htmlTag.hasAttribute('⚡4ads')) // Unicode weirdness.
  ) {
    return null;
  }

  const urlService = Services.urlForDoc(adElement);
  /** @type {!Array<{extensionId: string, extensionVersion: string}>} */
  const extensions = [];
  const fonts = [];
  const images = [];

  let element = head.firstElementChild;
  while (element) {
    // Store next element here as the following code will remove
    // certain elements from the detached DOM.
    const nextElement = element.nextElementSibling;
    switch (element.tagName.toUpperCase()) {
      case 'SCRIPT':
        handleScript(extensions, element);
        break;
      case 'STYLE':
        handleStyle(element);
        break;
      case 'LINK':
        handleLink(fonts, images, element);
        break;
      // Allow these without validation.
      case 'META':
      case 'TITLE':
        break;
      default:
        removeElement(element);
        break;
    }

    element = nextElement;
  }

  // Load any extensions; do not wait on their promises as this
  // is just to prefetch.
  preloadFriendlyIframeEmbedExtensions(win, extensions);

  // Preload any fonts.
  fonts.forEach((fontUrl) =>
    Services.preconnectFor(win).preload(adElement.getAmpDoc(), fontUrl)
  );

  // Preload any AMP images.
  images.forEach(
    (imageUrl) =>
      urlService.isSecure(imageUrl) &&
      Services.preconnectFor(win).preload(adElement.getAmpDoc(), imageUrl)
  );

  return {
    extensions,
    head,
  };
}

/**
 * Allows json scripts and allowlisted amp elements while removing others.
 * @param {!Array<{extensionId: string, extensionVersion: string}>} extensions
 * @param {!Element} script
 */
function handleScript(extensions, script) {
  if (script.type === 'application/json') {
    return;
  }

  const {src} = script;
  const isTesting = getMode().test || getMode().localDev;
  if (
    EXTENSION_URL_PREFIX.test(src) ||
    // Integration tests point to local files.
    (isTesting && includes(src, '/dist/'))
  ) {
    const extensionInfo = parseExtensionUrl(src);
    if (extensionInfo && EXTENSION_ALLOWLIST[extensionInfo.extensionId]) {
      extensions.push(extensionInfo);
    }
  }

  removeElement(script);
}

/**
 * Collect links that are from allowed font providers or used for image
 * preloading. Remove other <link> elements.
 * @param {!Array<string>} fonts
 * @param {!Array<string>} images
 * @param {!Element} link
 */
function handleLink(fonts, images, link) {
  const {as, href, rel} = link;
  if (rel === 'preload' && as === 'image') {
    images.push(href);
    return;
  }

  if (rel === 'stylesheet' && ALLOWED_FONT_REGEX.test(href)) {
    fonts.push(href);
    return;
  }

  removeElement(link);
}

/**
 * Remove any non `amp-custom` or `amp-keyframe` styles.
 * @param {!Element} style
 */
function handleStyle(style) {
  if (
    style.hasAttribute('amp-custom') ||
    style.hasAttribute('amp-keyframes') ||
    style.hasAttribute('amp4ads-boilerplate')
  ) {
    return;
  }
  removeElement(style);
}
