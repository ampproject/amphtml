/**
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
import { getMode } from "../../../src/mode";
import { includes } from "../../../src/core/types/string";
import { map } from "../../../src/core/types/object";
import { parseExtensionUrl } from "../../../src/service/extension-script";
import { preloadFriendlyIframeEmbedExtensions } from "../../../src/friendly-iframe-embed";
import { removeElement, rootNodeFor } from "../../../src/core/dom";
import { urls } from "../../../src/config";

/**
 * @typedef {{
 *    extensions: !Array<{extensionId: (string|undefined), extensionVersion: (string|undefined)}>,
 *    head: !Element
 * }}
 */
export var ValidatedHeadDef;
// From validator/validator-main.protoascii
var ALLOWED_FONT_REGEX = new RegExp('https://cdn\\.materialdesignicons\\.com/' + '([0-9]+\\.?)+/css/materialdesignicons\\.min\\.css|' + 'https://cloud\\.typography\\.com/' + '[0-9]*/[0-9]*/css/fonts\\.css|' + 'https://fast\\.fonts\\.net/.*|' + 'https://fonts\\.googleapis\\.com/css2?\\?.*|' + 'https://fonts\\.googleapis\\.com/icon\\?.*|' + 'https://fonts\\.googleapis\\.com/earlyaccess/.*\\.css|' + 'https://maxcdn\\.bootstrapcdn\\.com/font-awesome/' + '([0-9]+\\.?)+/css/font-awesome\\.min\\.css(\\?.*)?|' + 'https://(use|pro)\\.fontawesome\\.com/releases/v([0-9]+\\.?)+' + '/css/[0-9a-zA-Z-]+\\.css|' + 'https://(use|pro)\\.fontawesome\\.com/[0-9a-zA-Z-]+\\.css|' + 'https://use\\.typekit\\.net/[\\w\\p{L}\\p{N}_]+\\.css');
// If editing please also change:
// extensions/amp-a4a/amp-a4a-format.md#allowed-amp-extensions-and-builtins
var EXTENSION_ALLOWLIST = map({
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
  'amp-video': true
});

/**
 * Escape any regex chars from given string.
 * https://developer.cdn.mozilla.net/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 * @param {string} string
 * @return {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

var EXTENSION_URL_PREFIX = new RegExp('^' + escapeRegExp(urls.cdn) + '/(rtv/\\d+/)?v0/');

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

  var root = rootNodeFor(head);
  var htmlTag = root.documentElement;

  if (!htmlTag || !htmlTag.hasAttribute('amp4ads') && !htmlTag.hasAttribute('⚡️4ads') && !htmlTag.hasAttribute('⚡4ads') // Unicode weirdness.
  ) {
      return null;
    }

  var urlService = Services.urlForDoc(adElement);

  /** @type {!Array<{extensionId: string, extensionVersion: string}>} */
  var extensions = [];
  var fonts = [];
  var images = [];
  var element = head.firstElementChild;

  while (element) {
    // Store next element here as the following code will remove
    // certain elements from the detached DOM.
    var nextElement = element.nextElementSibling;

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
  fonts.forEach(function (fontUrl) {
    return Services.preconnectFor(win).preload(adElement.getAmpDoc(), fontUrl);
  });
  // Preload any AMP images.
  images.forEach(function (imageUrl) {
    return urlService.isSecure(imageUrl) && Services.preconnectFor(win).preload(adElement.getAmpDoc(), imageUrl);
  });
  return {
    extensions: extensions,
    head: head
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

  var src = script.src;
  var isTesting = getMode().test || getMode().localDev;

  if (EXTENSION_URL_PREFIX.test(src) || // Integration tests point to local files.
  isTesting && includes(src, '/dist/')) {
    var extensionInfo = parseExtensionUrl(src);

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
  var as = link.as,
      href = link.href,
      rel = link.rel;

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
  if (style.hasAttribute('amp-custom') || style.hasAttribute('amp-keyframes') || style.hasAttribute('amp4ads-boilerplate')) {
    return;
  }

  removeElement(style);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlYWQtdmFsaWRhdGlvbi5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsImdldE1vZGUiLCJpbmNsdWRlcyIsIm1hcCIsInBhcnNlRXh0ZW5zaW9uVXJsIiwicHJlbG9hZEZyaWVuZGx5SWZyYW1lRW1iZWRFeHRlbnNpb25zIiwicmVtb3ZlRWxlbWVudCIsInJvb3ROb2RlRm9yIiwidXJscyIsIlZhbGlkYXRlZEhlYWREZWYiLCJBTExPV0VEX0ZPTlRfUkVHRVgiLCJSZWdFeHAiLCJFWFRFTlNJT05fQUxMT1dMSVNUIiwiZXNjYXBlUmVnRXhwIiwic3RyaW5nIiwicmVwbGFjZSIsIkVYVEVOU0lPTl9VUkxfUFJFRklYIiwiY2RuIiwicHJvY2Vzc0hlYWQiLCJ3aW4iLCJhZEVsZW1lbnQiLCJoZWFkIiwiZmlyc3RDaGlsZCIsInJvb3QiLCJodG1sVGFnIiwiZG9jdW1lbnRFbGVtZW50IiwiaGFzQXR0cmlidXRlIiwidXJsU2VydmljZSIsInVybEZvckRvYyIsImV4dGVuc2lvbnMiLCJmb250cyIsImltYWdlcyIsImVsZW1lbnQiLCJmaXJzdEVsZW1lbnRDaGlsZCIsIm5leHRFbGVtZW50IiwibmV4dEVsZW1lbnRTaWJsaW5nIiwidGFnTmFtZSIsInRvVXBwZXJDYXNlIiwiaGFuZGxlU2NyaXB0IiwiaGFuZGxlU3R5bGUiLCJoYW5kbGVMaW5rIiwiZm9yRWFjaCIsImZvbnRVcmwiLCJwcmVjb25uZWN0Rm9yIiwicHJlbG9hZCIsImdldEFtcERvYyIsImltYWdlVXJsIiwiaXNTZWN1cmUiLCJzY3JpcHQiLCJ0eXBlIiwic3JjIiwiaXNUZXN0aW5nIiwidGVzdCIsImxvY2FsRGV2IiwiZXh0ZW5zaW9uSW5mbyIsImV4dGVuc2lvbklkIiwicHVzaCIsImxpbmsiLCJhcyIsImhyZWYiLCJyZWwiLCJzdHlsZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QyxJQUFuQixDQUF3Qk8sSUFBeEIsQ0FBNUIsRUFBMkQ7QUFDekQ3QixJQUFBQSxLQUFLLENBQUMwQixJQUFOLENBQVdHLElBQVg7QUFDQTtBQUNEOztBQUVEckQsRUFBQUEsYUFBYSxDQUFDbUQsSUFBRCxDQUFiO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTbEIsV0FBVCxDQUFxQnNCLEtBQXJCLEVBQTRCO0FBQzFCLE1BQ0VBLEtBQUssQ0FBQ25DLFlBQU4sQ0FBbUIsWUFBbkIsS0FDQW1DLEtBQUssQ0FBQ25DLFlBQU4sQ0FBbUIsZUFBbkIsQ0FEQSxJQUVBbUMsS0FBSyxDQUFDbkMsWUFBTixDQUFtQixxQkFBbkIsQ0FIRixFQUlFO0FBQ0E7QUFDRDs7QUFDRHBCLEVBQUFBLGFBQWEsQ0FBQ3VELEtBQUQsQ0FBYjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtpbmNsdWRlc30gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nJztcbmltcG9ydCB7bWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtwYXJzZUV4dGVuc2lvblVybH0gZnJvbSAnI3NlcnZpY2UvZXh0ZW5zaW9uLXNjcmlwdCc7XG5pbXBvcnQge3ByZWxvYWRGcmllbmRseUlmcmFtZUVtYmVkRXh0ZW5zaW9uc30gZnJvbSAnLi4vLi4vLi4vc3JjL2ZyaWVuZGx5LWlmcmFtZS1lbWJlZCc7XG5pbXBvcnQge3JlbW92ZUVsZW1lbnQsIHJvb3ROb2RlRm9yfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHt1cmxzfSBmcm9tICcuLi8uLi8uLi9zcmMvY29uZmlnJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICAgZXh0ZW5zaW9uczogIUFycmF5PHtleHRlbnNpb25JZDogKHN0cmluZ3x1bmRlZmluZWQpLCBleHRlbnNpb25WZXJzaW9uOiAoc3RyaW5nfHVuZGVmaW5lZCl9PixcbiAqICAgIGhlYWQ6ICFFbGVtZW50XG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFZhbGlkYXRlZEhlYWREZWY7XG5cbi8vIEZyb20gdmFsaWRhdG9yL3ZhbGlkYXRvci1tYWluLnByb3RvYXNjaWlcbmNvbnN0IEFMTE9XRURfRk9OVF9SRUdFWCA9IG5ldyBSZWdFeHAoXG4gICdodHRwczovL2NkblxcXFwubWF0ZXJpYWxkZXNpZ25pY29uc1xcXFwuY29tLycgK1xuICAgICcoWzAtOV0rXFxcXC4/KSsvY3NzL21hdGVyaWFsZGVzaWduaWNvbnNcXFxcLm1pblxcXFwuY3NzfCcgK1xuICAgICdodHRwczovL2Nsb3VkXFxcXC50eXBvZ3JhcGh5XFxcXC5jb20vJyArXG4gICAgJ1swLTldKi9bMC05XSovY3NzL2ZvbnRzXFxcXC5jc3N8JyArXG4gICAgJ2h0dHBzOi8vZmFzdFxcXFwuZm9udHNcXFxcLm5ldC8uKnwnICtcbiAgICAnaHR0cHM6Ly9mb250c1xcXFwuZ29vZ2xlYXBpc1xcXFwuY29tL2NzczI/XFxcXD8uKnwnICtcbiAgICAnaHR0cHM6Ly9mb250c1xcXFwuZ29vZ2xlYXBpc1xcXFwuY29tL2ljb25cXFxcPy4qfCcgK1xuICAgICdodHRwczovL2ZvbnRzXFxcXC5nb29nbGVhcGlzXFxcXC5jb20vZWFybHlhY2Nlc3MvLipcXFxcLmNzc3wnICtcbiAgICAnaHR0cHM6Ly9tYXhjZG5cXFxcLmJvb3RzdHJhcGNkblxcXFwuY29tL2ZvbnQtYXdlc29tZS8nICtcbiAgICAnKFswLTldK1xcXFwuPykrL2Nzcy9mb250LWF3ZXNvbWVcXFxcLm1pblxcXFwuY3NzKFxcXFw/LiopP3wnICtcbiAgICAnaHR0cHM6Ly8odXNlfHBybylcXFxcLmZvbnRhd2Vzb21lXFxcXC5jb20vcmVsZWFzZXMvdihbMC05XStcXFxcLj8pKycgK1xuICAgICcvY3NzL1swLTlhLXpBLVotXStcXFxcLmNzc3wnICtcbiAgICAnaHR0cHM6Ly8odXNlfHBybylcXFxcLmZvbnRhd2Vzb21lXFxcXC5jb20vWzAtOWEtekEtWi1dK1xcXFwuY3NzfCcgK1xuICAgICdodHRwczovL3VzZVxcXFwudHlwZWtpdFxcXFwubmV0L1tcXFxcd1xcXFxwe0x9XFxcXHB7Tn1fXStcXFxcLmNzcydcbik7XG5cbi8vIElmIGVkaXRpbmcgcGxlYXNlIGFsc28gY2hhbmdlOlxuLy8gZXh0ZW5zaW9ucy9hbXAtYTRhL2FtcC1hNGEtZm9ybWF0Lm1kI2FsbG93ZWQtYW1wLWV4dGVuc2lvbnMtYW5kLWJ1aWx0aW5zXG5jb25zdCBFWFRFTlNJT05fQUxMT1dMSVNUID0gbWFwKHtcbiAgJ2FtcC1hY2NvcmRpb24nOiB0cnVlLFxuICAnYW1wLWFkLWV4aXQnOiB0cnVlLFxuICAnYW1wLWFuYWx5dGljcyc6IHRydWUsXG4gICdhbXAtYW5pbSc6IHRydWUsXG4gICdhbXAtYW5pbWF0aW9uJzogdHJ1ZSxcbiAgJ2FtcC1hdWRpbyc6IHRydWUsXG4gICdhbXAtYmluZCc6IHRydWUsXG4gICdhbXAtY2Fyb3VzZWwnOiB0cnVlLFxuICAnYW1wLWZpdC10ZXh0JzogdHJ1ZSxcbiAgJ2FtcC1mb250JzogdHJ1ZSxcbiAgJ2FtcC1mb3JtJzogdHJ1ZSxcbiAgJ2FtcC1nd2QtYW5pbWF0aW9uJzogdHJ1ZSxcbiAgJ2FtcC1pbWcnOiB0cnVlLFxuICAnYW1wLWxheW91dCc6IHRydWUsXG4gICdhbXAtbGlnaHRib3gnOiB0cnVlLFxuICAnYW1wLW1yYWlkJzogdHJ1ZSxcbiAgJ2FtcC1tdXN0YWNoZSc6IHRydWUsXG4gICdhbXAtcGl4ZWwnOiB0cnVlLFxuICAnYW1wLXBvc2l0aW9uLW9ic2VydmVyJzogdHJ1ZSxcbiAgJ2FtcC1zZWxlY3Rvcic6IHRydWUsXG4gICdhbXAtc29jaWFsLXNoYXJlJzogdHJ1ZSxcbiAgJ2FtcC12aWRlbyc6IHRydWUsXG59KTtcblxuLyoqXG4gKiBFc2NhcGUgYW55IHJlZ2V4IGNoYXJzIGZyb20gZ2l2ZW4gc3RyaW5nLlxuICogaHR0cHM6Ly9kZXZlbG9wZXIuY2RuLm1vemlsbGEubmV0L2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvUmVndWxhcl9FeHByZXNzaW9ucyNlc2NhcGluZ1xuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTsgLy8gJCYgbWVhbnMgdGhlIHdob2xlIG1hdGNoZWQgc3RyaW5nXG59XG5cbmNvbnN0IEVYVEVOU0lPTl9VUkxfUFJFRklYID0gbmV3IFJlZ0V4cChcbiAgJ14nICsgZXNjYXBlUmVnRXhwKHVybHMuY2RuKSArICcvKHJ0di9cXFxcZCsvKT92MC8nXG4pO1xuXG4vKipcbiAqIFNhbml0aXplcyBBTVBIVE1MIEFkIGhlYWQgZWxlbWVudCBhbmQgZXh0cmFjdHMgZXh0ZW5zaW9ucyB0byBiZSBpbnN0YWxsZWQuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshRWxlbWVudH0gYWRFbGVtZW50XG4gKiBAcGFyYW0gez9FbGVtZW50fSBoZWFkXG4gKiBAcmV0dXJuIHs/VmFsaWRhdGVkSGVhZERlZn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NIZWFkKHdpbiwgYWRFbGVtZW50LCBoZWFkKSB7XG4gIGlmICghaGVhZCB8fCAhaGVhZC5maXJzdENoaWxkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCByb290ID0gcm9vdE5vZGVGb3IoaGVhZCk7XG4gIGNvbnN0IGh0bWxUYWcgPSByb290LmRvY3VtZW50RWxlbWVudDtcbiAgaWYgKFxuICAgICFodG1sVGFnIHx8XG4gICAgKCFodG1sVGFnLmhhc0F0dHJpYnV0ZSgnYW1wNGFkcycpICYmXG4gICAgICAhaHRtbFRhZy5oYXNBdHRyaWJ1dGUoJ+Kaoe+4jzRhZHMnKSAmJlxuICAgICAgIWh0bWxUYWcuaGFzQXR0cmlidXRlKCfimqE0YWRzJykpIC8vIFVuaWNvZGUgd2VpcmRuZXNzLlxuICApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHVybFNlcnZpY2UgPSBTZXJ2aWNlcy51cmxGb3JEb2MoYWRFbGVtZW50KTtcbiAgLyoqIEB0eXBlIHshQXJyYXk8e2V4dGVuc2lvbklkOiBzdHJpbmcsIGV4dGVuc2lvblZlcnNpb246IHN0cmluZ30+fSAqL1xuICBjb25zdCBleHRlbnNpb25zID0gW107XG4gIGNvbnN0IGZvbnRzID0gW107XG4gIGNvbnN0IGltYWdlcyA9IFtdO1xuXG4gIGxldCBlbGVtZW50ID0gaGVhZC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAvLyBTdG9yZSBuZXh0IGVsZW1lbnQgaGVyZSBhcyB0aGUgZm9sbG93aW5nIGNvZGUgd2lsbCByZW1vdmVcbiAgICAvLyBjZXJ0YWluIGVsZW1lbnRzIGZyb20gdGhlIGRldGFjaGVkIERPTS5cbiAgICBjb25zdCBuZXh0RWxlbWVudCA9IGVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIHN3aXRjaCAoZWxlbWVudC50YWdOYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ1NDUklQVCc6XG4gICAgICAgIGhhbmRsZVNjcmlwdChleHRlbnNpb25zLCBlbGVtZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdTVFlMRSc6XG4gICAgICAgIGhhbmRsZVN0eWxlKGVsZW1lbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0xJTksnOlxuICAgICAgICBoYW5kbGVMaW5rKGZvbnRzLCBpbWFnZXMsIGVsZW1lbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIEFsbG93IHRoZXNlIHdpdGhvdXQgdmFsaWRhdGlvbi5cbiAgICAgIGNhc2UgJ01FVEEnOlxuICAgICAgY2FzZSAnVElUTEUnOlxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJlbW92ZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGVsZW1lbnQgPSBuZXh0RWxlbWVudDtcbiAgfVxuXG4gIC8vIExvYWQgYW55IGV4dGVuc2lvbnM7IGRvIG5vdCB3YWl0IG9uIHRoZWlyIHByb21pc2VzIGFzIHRoaXNcbiAgLy8gaXMganVzdCB0byBwcmVmZXRjaC5cbiAgcHJlbG9hZEZyaWVuZGx5SWZyYW1lRW1iZWRFeHRlbnNpb25zKHdpbiwgZXh0ZW5zaW9ucyk7XG5cbiAgLy8gUHJlbG9hZCBhbnkgZm9udHMuXG4gIGZvbnRzLmZvckVhY2goKGZvbnRVcmwpID0+XG4gICAgU2VydmljZXMucHJlY29ubmVjdEZvcih3aW4pLnByZWxvYWQoYWRFbGVtZW50LmdldEFtcERvYygpLCBmb250VXJsKVxuICApO1xuXG4gIC8vIFByZWxvYWQgYW55IEFNUCBpbWFnZXMuXG4gIGltYWdlcy5mb3JFYWNoKFxuICAgIChpbWFnZVVybCkgPT5cbiAgICAgIHVybFNlcnZpY2UuaXNTZWN1cmUoaW1hZ2VVcmwpICYmXG4gICAgICBTZXJ2aWNlcy5wcmVjb25uZWN0Rm9yKHdpbikucHJlbG9hZChhZEVsZW1lbnQuZ2V0QW1wRG9jKCksIGltYWdlVXJsKVxuICApO1xuXG4gIHJldHVybiB7XG4gICAgZXh0ZW5zaW9ucyxcbiAgICBoZWFkLFxuICB9O1xufVxuXG4vKipcbiAqIEFsbG93cyBqc29uIHNjcmlwdHMgYW5kIGFsbG93bGlzdGVkIGFtcCBlbGVtZW50cyB3aGlsZSByZW1vdmluZyBvdGhlcnMuXG4gKiBAcGFyYW0geyFBcnJheTx7ZXh0ZW5zaW9uSWQ6IHN0cmluZywgZXh0ZW5zaW9uVmVyc2lvbjogc3RyaW5nfT59IGV4dGVuc2lvbnNcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IHNjcmlwdFxuICovXG5mdW5jdGlvbiBoYW5kbGVTY3JpcHQoZXh0ZW5zaW9ucywgc2NyaXB0KSB7XG4gIGlmIChzY3JpcHQudHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qge3NyY30gPSBzY3JpcHQ7XG4gIGNvbnN0IGlzVGVzdGluZyA9IGdldE1vZGUoKS50ZXN0IHx8IGdldE1vZGUoKS5sb2NhbERldjtcbiAgaWYgKFxuICAgIEVYVEVOU0lPTl9VUkxfUFJFRklYLnRlc3Qoc3JjKSB8fFxuICAgIC8vIEludGVncmF0aW9uIHRlc3RzIHBvaW50IHRvIGxvY2FsIGZpbGVzLlxuICAgIChpc1Rlc3RpbmcgJiYgaW5jbHVkZXMoc3JjLCAnL2Rpc3QvJykpXG4gICkge1xuICAgIGNvbnN0IGV4dGVuc2lvbkluZm8gPSBwYXJzZUV4dGVuc2lvblVybChzcmMpO1xuICAgIGlmIChleHRlbnNpb25JbmZvICYmIEVYVEVOU0lPTl9BTExPV0xJU1RbZXh0ZW5zaW9uSW5mby5leHRlbnNpb25JZF0pIHtcbiAgICAgIGV4dGVuc2lvbnMucHVzaChleHRlbnNpb25JbmZvKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVFbGVtZW50KHNjcmlwdCk7XG59XG5cbi8qKlxuICogQ29sbGVjdCBsaW5rcyB0aGF0IGFyZSBmcm9tIGFsbG93ZWQgZm9udCBwcm92aWRlcnMgb3IgdXNlZCBmb3IgaW1hZ2VcbiAqIHByZWxvYWRpbmcuIFJlbW92ZSBvdGhlciA8bGluaz4gZWxlbWVudHMuXG4gKiBAcGFyYW0geyFBcnJheTxzdHJpbmc+fSBmb250c1xuICogQHBhcmFtIHshQXJyYXk8c3RyaW5nPn0gaW1hZ2VzXG4gKiBAcGFyYW0geyFFbGVtZW50fSBsaW5rXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUxpbmsoZm9udHMsIGltYWdlcywgbGluaykge1xuICBjb25zdCB7YXMsIGhyZWYsIHJlbH0gPSBsaW5rO1xuICBpZiAocmVsID09PSAncHJlbG9hZCcgJiYgYXMgPT09ICdpbWFnZScpIHtcbiAgICBpbWFnZXMucHVzaChocmVmKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAocmVsID09PSAnc3R5bGVzaGVldCcgJiYgQUxMT1dFRF9GT05UX1JFR0VYLnRlc3QoaHJlZikpIHtcbiAgICBmb250cy5wdXNoKGhyZWYpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJlbW92ZUVsZW1lbnQobGluayk7XG59XG5cbi8qKlxuICogUmVtb3ZlIGFueSBub24gYGFtcC1jdXN0b21gIG9yIGBhbXAta2V5ZnJhbWVgIHN0eWxlcy5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IHN0eWxlXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZVN0eWxlKHN0eWxlKSB7XG4gIGlmIChcbiAgICBzdHlsZS5oYXNBdHRyaWJ1dGUoJ2FtcC1jdXN0b20nKSB8fFxuICAgIHN0eWxlLmhhc0F0dHJpYnV0ZSgnYW1wLWtleWZyYW1lcycpIHx8XG4gICAgc3R5bGUuaGFzQXR0cmlidXRlKCdhbXA0YWRzLWJvaWxlcnBsYXRlJylcbiAgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJlbW92ZUVsZW1lbnQoc3R5bGUpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-a4a/0.1/head-validation.js