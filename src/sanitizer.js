/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  checkCorsUrl,
  getSourceUrl,
  isProxyOrigin,
  parseUrl,
  resolveRelativeUrl,
} from './url';
import {dict, map} from './utils/object';
import {htmlSanitizer} from '../third_party/caja/html-sanitizer';
import {isExperimentOn} from './experiments';
import {parseSrcset} from './srcset';
import {startsWith} from './string';
import {urls} from './config';
import {user} from './log';

/** @private @const {string} */
const TAG = 'sanitizer';

/** @private @const {string} */
const ORIGINAL_TARGET_VALUE = '__AMP_ORIGINAL_TARGET_VALUE_';

/**
 * @const {!Object<string, boolean>}
 * See https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md
 */
const BLACKLISTED_TAGS = dict({
  'applet': true,
  'audio': true,
  'base': true,
  'embed': true,
  'frame': true,
  'frameset': true,
  'iframe': true,
  'img': true,
  'link': true,
  'meta': true,
  'object': true,
  'script': true,
  'style': true,
  // TODO(dvoytenko, #1156): SVG is blacklisted temporarily. There's no
  // intention to keep this block for any longer than we have to.
  'svg': true,
  'video': true,
});

/** @const {!Object<string, boolean>} */
const SELF_CLOSING_TAGS = dict({
  'br': true,
  'col': true,
  'hr': true,
  'img': true,
  'input': true,
  'source': true,
  'track': true,
  'wbr': true,
  'area': true,
  'base': true,
  'command': true,
  'embed': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
});

/** @const {!Array<string>} */
const WHITELISTED_FORMAT_TAGS = [
  'b',
  'br',
  'code',
  'del',
  'em',
  'i',
  'ins',
  'mark',
  'q',
  's',
  'small',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
];

/** @const {!Array<string>} */
const WHITELISTED_ATTRS = [
  /* AMP-only attributes that don't exist in HTML. */
  'fallback',
  'on',
  'option',
  'placeholder',
  'submit-success',
  'submit-error',
  /* HTML attributes that are scrubbed by Caja but we handle specially. */
  'href',
  'style',
  /* Attributes for amp-bind that exist in "[foo]" form. */
  'text',
  /* Attributes for amp-subscriptions. */
  'subscriptions-action',
  'subscriptions-actions',
  'subscriptions-section',
  'subscriptions-display',
];

/** @const {!Object<string, !Array<string>>} */
const WHITELISTED_ATTRS_BY_TAGS = dict({
  'a': [
    'rel',
  ],
  'div': [
    'template',
  ],
  'form': [
    'action-xhr',
    'custom-validation-reporting',
    'target',
  ],
  'template': [
    'type',
  ],
});

/** @const {!RegExp} */
const WHITELISTED_ATTR_PREFIX_REGEX = /^(data-|aria-)|^role$/i;

/** @const {!Array<string>} */
const WHITELISTED_TARGETS = ['_top', '_blank'];

/** @const {!Array<string>} */
const BLACKLISTED_ATTR_VALUES = [
  /*eslint no-script-url: 0*/ 'javascript:',
  /*eslint no-script-url: 0*/ 'vbscript:',
  /*eslint no-script-url: 0*/ 'data:',
  /*eslint no-script-url: 0*/ '<script',
  /*eslint no-script-url: 0*/ '</script',
];

/** @const {!Object<string, !Object<string, !RegExp>>} */
const BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES = dict({
  'input': {
    'type': /(?:image|file|password|button)/i,
  },
});

/** @const {!Array<string>} */
const BLACKLISTED_FIELDS_ATTR = [
  'form',
  'formaction',
  'formmethod',
  'formtarget',
  'formnovalidate',
  'formenctype',
];

/** @const {!Object<string, !Array<string>>} */
const BLACKLISTED_TAG_SPECIFIC_ATTRS = dict({
  'input': BLACKLISTED_FIELDS_ATTR,
  'textarea': BLACKLISTED_FIELDS_ATTR,
  'select': BLACKLISTED_FIELDS_ATTR,
});

/**
 * Test for invalid `style` attribute values. `!important` is a general AMP
 * rule, while `position:fixed|sticky` is a current runtime limitation since
 * FixedLayer only scans the amp-custom stylesheet for potential fixed/sticky
 * elements.
 * @const {!RegExp}
 */
const INVALID_INLINE_STYLE_REGEX =
    /!important|position\s*:\s*fixed|position\s*:\s*sticky/i;

/**
 * Sanitizes the provided HTML.
 *
 * This function expects the HTML to be already pre-sanitized and thus it does
 * not validate all of the AMP rules - only the most dangerous security-related
 * cases, such as <SCRIPT>, <STYLE>, <IFRAME>.
 *
 * @param {string} html
 * @return {string}
 */
export function sanitizeHtml(html) {
  const tagPolicy = htmlSanitizer.makeTagPolicy();
  const output = [];
  let ignore = 0;

  function emit(content) {
    if (ignore == 0) {
      output.push(content);
    }
  }

  const parser = htmlSanitizer.makeSaxParser({
    'startTag': function(tagName, attribs) {
      if (ignore > 0) {
        if (!SELF_CLOSING_TAGS[tagName]) {
          ignore++;
        }
        return;
      }
      const isBinding = map();
      // Preprocess "binding" attributes, e.g. [attr], by stripping enclosing
      // brackets before custom validation and restoring them afterwards.
      for (let i = 0; i < attribs.length; i += 2) {
        const attr = attribs[i];
        if (attr && attr[0] == '[' && attr[attr.length - 1] == ']') {
          isBinding[i] = true;
          attribs[i] = attr.slice(1, -1);
        }
      }
      if (BLACKLISTED_TAGS[tagName]) {
        ignore++;
      } else if (!startsWith(tagName, 'amp-')) {
        // Ask Caja to validate the element as well.
        // Use the resulting properties.
        const savedAttribs = attribs.slice(0);
        const scrubbed = tagPolicy(tagName, attribs);
        if (!scrubbed) {
          ignore++;
        } else {
          attribs = scrubbed.attribs;
          // Restore some of the attributes that AMP is directly responsible
          // for, such as "on".
          for (let i = 0; i < attribs.length; i += 2) {
            const attrib = attribs[i];
            if (WHITELISTED_ATTRS.includes(attrib)) {
              attribs[i + 1] = savedAttribs[i + 1];
            } else if (attrib.search(WHITELISTED_ATTR_PREFIX_REGEX) == 0) {
              attribs[i + 1] = savedAttribs[i + 1];
            } else if (WHITELISTED_ATTRS_BY_TAGS[tagName] &&
                       WHITELISTED_ATTRS_BY_TAGS[tagName].includes(attrib)) {
              attribs[i + 1] = savedAttribs[i + 1];
            }
          }
        }
        // `<A>` has special target rules:
        // - Default target is "_top";
        // - Allowed targets are "_blank", "_top";
        // - All other targets are rewritted to "_top".
        if (tagName == 'a') {
          let index = -1;
          let hasHref = false;
          for (let i = 0; i < savedAttribs.length; i += 2) {
            if (savedAttribs[i] == 'target') {
              index = i + 1;
            } else if (savedAttribs[i] == 'href') {
              // Only allow valid `href` values.
              hasHref = attribs[i + 1] != null;
            }
          }
          let origTarget = index != -1 ? savedAttribs[index] : null;
          if (origTarget != null) {
            origTarget = origTarget.toLowerCase();
            if (WHITELISTED_TARGETS.indexOf(origTarget) != -1) {
              attribs[index] = origTarget;
            } else {
              attribs[index] = '_top';
            }
          } else if (hasHref) {
            attribs.push('target');
            attribs.push('_top');
          }
        }
      }
      if (ignore > 0) {
        if (SELF_CLOSING_TAGS[tagName]) {
          ignore--;
        }
        return;
      }
      emit('<');
      emit(tagName);
      for (let i = 0; i < attribs.length; i += 2) {
        const attrName = attribs[i];
        const attrValue = attribs[i + 1];
        if (!isValidAttr(tagName, attrName, attrValue)) {
          user().error(TAG, `Removing "${attrName}" attribute with invalid `
              + `value in <${tagName} ${attrName}="${attrValue}">.`);
          continue;
        }
        emit(' ');
        if (isBinding[i]) {
          emit('[' + attrName + ']');
        } else {
          emit(attrName);
        }
        emit('="');
        if (attrValue) {
          // Rewrite attribute values unless this attribute is a binding.
          // Bindings contain expressions not scalars and shouldn't be modified.
          const rewrite = (isBinding[i])
            ? attrValue
            : rewriteAttributeValue(tagName, attrName, attrValue);
          emit(htmlSanitizer.escapeAttrib(rewrite));
        }
        emit('"');
      }
      emit('>');
    },
    'endTag': function(tagName) {
      if (ignore > 0) {
        ignore--;
        return;
      }
      emit('</');
      emit(tagName);
      emit('>');
    },
    'pcdata': emit,
    'rcdata': emit,
    'cdata': emit,
  });
  parser(html);
  return output.join('');
}

/**
 * Sanitizes the provided formatting HTML. Only the most basic inline tags are
 * allowed, such as <b>, <i>, etc.
 *
 * @param {string} html
 * @return {string}
 */
export function sanitizeFormattingHtml(html) {
  return htmlSanitizer.sanitizeWithPolicy(html,
      function(tagName, attribs) {
        if (tagName == 'template') {
          for (let i = 0; i < attribs.length; i += 2) {
            if (attribs[i] == 'type' && attribs[i + 1] == 'amp-mustache') {
              return {
                tagName,
                attribs: ['type', 'amp-mustache'],
              };
            }
          }
        }
        if (!WHITELISTED_FORMAT_TAGS.includes(tagName)) {
          return null;
        }
        return {
          tagName,
          attribs: [],
        };
      }
  );
}

/**
 * Whether the attribute/value are valid.
 * @param {string} tagName
 * @param {string} attrName
 * @param {string} attrValue
 * @return {boolean}
 */
export function isValidAttr(tagName, attrName, attrValue) {
  // "on*" attributes are not allowed.
  if (startsWith(attrName, 'on') && attrName != 'on') {
    return false;
  }

  // Inline styles are not allowed.
  if (attrName == 'style') {
    if (isExperimentOn(self, 'inline-styles')) {
      return !INVALID_INLINE_STYLE_REGEX.test(attrValue);
    }
    return false;
  }

  // See validator-main.protoascii
  // https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii
  if (attrName == 'class' &&
      attrValue &&
      /(^|\W)i-amphtml-/i.test(attrValue)) {
    return false;
  }

  // No attributes with "javascript" or other blacklisted substrings in them.
  if (attrValue) {
    const attrValueNorm = attrValue.toLowerCase().replace(/[\s,\u0000]+/g, '');
    for (let i = 0; i < BLACKLISTED_ATTR_VALUES.length; i++) {
      if (attrValueNorm.indexOf(BLACKLISTED_ATTR_VALUES[i]) != -1) {
        return false;
      }
    }
  }

  // Remove blacklisted attributes from specific tags e.g. input[formaction].
  const attrNameBlacklist = BLACKLISTED_TAG_SPECIFIC_ATTRS[tagName];
  if (attrNameBlacklist && attrNameBlacklist.indexOf(attrName) != -1) {
    return false;
  }

  // Remove blacklisted values for specific attributes for specific tags
  // e.g. input[type=image].
  const attrBlacklist = BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES[tagName];
  if (attrBlacklist) {
    const blacklistedValuesRegex = attrBlacklist[attrName];
    if (blacklistedValuesRegex &&
        attrValue.search(blacklistedValuesRegex) != -1) {
      return false;
    }
  }

  return true;
}

/**
 * The same as rewriteAttributeValue() but actually updates the element and
 * modifies other related attribute(s) for special cases, i.e. `target` for <a>.
 * @param {!Element} element
 * @param {string} attrName
 * @param {string} attrValue
 * @param {!Location=} opt_location
 * @return {string}
 */
export function rewriteAttributesForElement(
  element, attrName, attrValue, opt_location)
{
  const tag = element.tagName.toLowerCase();
  const attr = attrName.toLowerCase();
  const rewrittenValue = rewriteAttributeValue(tag, attr, attrValue);
  // When served from proxy (CDN), changing an <a> tag from a hash link to a
  // non-hash link requires updating `target` attribute per cache modification
  // rules. @see amp-cache-modifications.md#url-rewrites
  const isProxy = isProxyOrigin(opt_location || self.location);
  if (isProxy && tag === 'a' && attr === 'href') {
    const oldValue = element.getAttribute(attr);
    const newValueIsHash = rewrittenValue[0] === '#';
    const oldValueIsHash = oldValue && oldValue[0] === '#';

    if (newValueIsHash && !oldValueIsHash) {
      // Save the original value of `target` so it can be restored (if needed).
      if (!element[ORIGINAL_TARGET_VALUE]) {
        element[ORIGINAL_TARGET_VALUE] = element.getAttribute('target');
      }
      element.removeAttribute('target');
    } else if (oldValueIsHash && !newValueIsHash) {
      // Restore the original value of `target` or default to `_top`.
      element.setAttribute('target', element[ORIGINAL_TARGET_VALUE] || '_top');
    }
  }
  element.setAttribute(attr, rewrittenValue);
  return rewrittenValue;
}

/**
 * If (tagName, attrName) is a CDN-rewritable URL attribute, returns the
 * rewritten URL value. Otherwise, returns the unchanged `attrValue`.
 * @see resolveUrlAttr for rewriting rules.
 * @param {string} tagName
 * @param {string} attrName
 * @param {string} attrValue
 * @return {string}
 * @private Visible for testing.
 */
export function rewriteAttributeValue(tagName, attrName, attrValue) {
  const tag = tagName.toLowerCase();
  const attr = attrName.toLowerCase();
  if (attr == 'src' || attr == 'href' || attr == 'srcset') {
    return resolveUrlAttr(tag, attr, attrValue, self.location);
  }
  return attrValue;
}

/**
 * Rewrites the URL attribute values. URLs are rewritten as following:
 * - If URL is absolute, it is not rewritten
 * - If URL is relative, it's rewritten as absolute against the source origin
 * - If resulting URL is a `http:` URL and it's for image, the URL is rewritten
 *   again to be served with AMP Cache (cdn.ampproject.org).
 *
 * @param {string} tagName
 * @param {string} attrName
 * @param {string} attrValue
 * @param {!Location} windowLocation
 * @return {string}
 * @private Visible for testing.
 */
export function resolveUrlAttr(tagName, attrName, attrValue, windowLocation) {
  checkCorsUrl(attrValue);
  const isProxyHost = isProxyOrigin(windowLocation);
  const baseUrl = parseUrl(getSourceUrl(windowLocation));

  if (attrName == 'href' && !startsWith(attrValue, '#')) {
    return resolveRelativeUrl(attrValue, baseUrl);
  }

  if (attrName == 'src') {
    if (tagName == 'amp-img') {
      return resolveImageUrlAttr(attrValue, baseUrl, isProxyHost);
    }
    return resolveRelativeUrl(attrValue, baseUrl);
  }

  if (attrName == 'srcset') {
    let srcset;
    try {
      srcset = parseSrcset(attrValue);
    } catch (e) {
      // Do not fail the whole template just because one srcset is broken.
      // An AMP element will pick it up and report properly.
      user().error(TAG, 'Failed to parse srcset: ', e);
      return attrValue;
    }
    return srcset.stringify(url => resolveImageUrlAttr(url, baseUrl,
        isProxyHost));
  }

  return attrValue;
}

/**
 * Non-HTTPs image URLs are rewritten via proxy.
 * @param {string} attrValue
 * @param {!Location} baseUrl
 * @param {boolean} isProxyHost
 * @return {string}
 */
function resolveImageUrlAttr(attrValue, baseUrl, isProxyHost) {
  const src = parseUrl(resolveRelativeUrl(attrValue, baseUrl));

  // URLs such as `data:` or proxy URLs are returned as is. Unsafe protocols
  // do not arrive here - already stripped by the sanitizer.
  if (src.protocol == 'data:' || isProxyOrigin(src) || !isProxyHost) {
    return src.href;
  }

  // Rewrite as a proxy URL.
  return `${urls.cdn}/i/` +
      (src.protocol == 'https:' ? 's/' : '') +
      encodeURIComponent(src.host) +
      src.pathname + (src.search || '') + (src.hash || '');
}
