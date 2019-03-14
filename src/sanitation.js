/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {dict} from './utils/object';
import {isUrlAttribute} from './url-rewrite';
import {startsWith} from './string';

/** @private @const {string} */
export const BIND_PREFIX = 'data-amp-bind-';

/**
 * @const {!Object<string, boolean>}
 * See https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md
 */
export const BLACKLISTED_TAGS = {
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
  'style': true,
  'video': true,
};

/**
 * Whitelist of tags allowed in triple mustache e.g. {{{name}}}.
 * Very restrictive by design since the triple mustache renders unescaped HTML
 * which, unlike double mustache, won't be processed by the AMP Validator.
 * @const {!Array<string>}
 */
export const TRIPLE_MUSTACHE_WHITELISTED_TAGS = [
  'a',
  'b',
  'br',
  'caption',
  'colgroup',
  'code',
  'del',
  'div',
  'em',
  'i',
  'ins',
  'li',
  'mark',
  'ol',
  'p',
  'q',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'time',
  'td',
  'th',
  'thead',
  'tfoot',
  'tr',
  'u',
  'ul',
];

/**
 * Tag-agnostic attribute whitelisted used by both Caja and DOMPurify.
 * @const {!Array<string>}
 */
export const WHITELISTED_ATTRS = [
  // AMP-only attributes that don't exist in HTML.
  'amp-fx',
  'fallback',
  'heights',
  'layout',
  'min-font-size',
  'max-font-size',
  'on',
  'option',
  'placeholder',
  // Attributes related to amp-form.
  'submitting',
  'submit-success',
  'submit-error',
  'validation-for',
  'verify-error',
  'visible-when-invalid',
  // HTML attributes that are scrubbed by Caja but we handle specially.
  'href',
  'style',
  // Attributes for amp-bind that exist in "[foo]" form.
  'text',
  // Attributes for amp-subscriptions.
  'subscriptions-action',
  'subscriptions-actions',
  'subscriptions-decorate',
  'subscriptions-dialog',
  'subscriptions-display',
  'subscriptions-section',
  'subscriptions-service',
];

/**
 * Attributes that are only whitelisted for specific, non-AMP elements.
 * @const {!Object<string, !Array<string>>}
 */
export const WHITELISTED_ATTRS_BY_TAGS = {
  'a': [
    'rel',
    'target',
  ],
  'div': [
    'template',
  ],
  'form': [
    'action-xhr',
    'verify-xhr',
    'custom-validation-reporting',
    'target',
  ],
  'input': [
    'mask-output',
  ],
  'template': [
    'type',
  ],
  'textarea': [
    'autoexpand',
  ],
};

/** @const {!Array<string>} */
export const WHITELISTED_TARGETS = ['_top', '_blank'];

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
    'type': /(?:image|button)/i,
  },
});

/** @const {!Object<string, !Object<string, !RegExp>>} */
const STRICT_BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES = dict({
  'input': {
    'type': /(?:button|file|image|password)/i,
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
 * Test for invalid `style` attribute values.
 *
 * !important avoids overriding AMP styles, while `position:fixed|sticky` is a
 * FixedLayer limitation (it only scans the style[amp-custom] stylesheet
 * for potential fixed/sticky elements). Note that the latter can be
 * circumvented with CSS comments -- not a big deal.
 *
 * @const {!RegExp}
 */
const INVALID_INLINE_STYLE_REGEX =
    /!important|position\s*:\s*fixed|position\s*:\s*sticky/i;

/**
 * Whether the attribute/value is valid.
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {string} attrValue
 * @param {boolean} opt_purify Is true, skips some attribute sanitizations
 *     that are already covered by DOMPurify.
 * @param {Document=} opt_doc
 * @return {boolean}
 */
export function isValidAttr(
  tagName, attrName, attrValue, opt_purify = false, opt_doc) {
  if (!opt_purify) {
    // "on*" attributes are not allowed.
    if (startsWith(attrName, 'on') && attrName != 'on') {
      return false;
    }

    // No attributes with "javascript" or other blacklisted substrings in them.
    if (attrValue) {
      const normalized = attrValue.toLowerCase().replace(/[\s,\u0000]+/g, '');
      for (let i = 0; i < BLACKLISTED_ATTR_VALUES.length; i++) {
        if (normalized.indexOf(BLACKLISTED_ATTR_VALUES[i]) >= 0) {
          return false;
        }
      }
    }
  }

  // Don't allow certain inline style values.
  if (attrName == 'style') {
    return !INVALID_INLINE_STYLE_REGEX.test(attrValue);
  }

  // Don't allow CSS class names with internal AMP prefix.
  if (attrName == 'class' && attrValue && /(^|\W)i-amphtml-/i.test(attrValue)) {
    return false;
  }

  // Don't allow '__amp_source_origin' in URLs.
  if (isUrlAttribute(attrName) && /__amp_source_origin/.test(attrValue)) {
    return false;
  }

  // Remove blacklisted attributes from specific tags e.g. input[formaction].
  const attrNameBlacklist = BLACKLISTED_TAG_SPECIFIC_ATTRS[tagName];
  if (attrNameBlacklist && attrNameBlacklist.indexOf(attrName) != -1) {
    return false;
  }

  // Remove blacklisted values for specific attributes for specific tags
  // e.g. input[type=image].
  let attrBlacklist;
  if (isAmp4Email_(opt_doc)) {
    attrBlacklist = STRICT_BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES[tagName];
  } else {
    attrBlacklist = BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES[tagName];
  }
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
 * Checks that the document is of an AMP format type.
 * @param {!Array<string>} formats
 * @param {?Document|undefined} doc
 * @return {boolean}
 */
function isAmpFormatType(formats, doc) {
  if (!doc) {
    return false;
  }
  const html = doc.documentElement;
  const isFormatType =
      formats.some(format => html.hasAttribute(format));
  return isFormatType;
}

/**
 * @param {?Document|undefined} doc
 * @return {boolean}
 * @private
 */
function isAmp4Email_(doc) {
  return isAmpFormatType(['⚡4email', 'amp4email'], doc);
}

/**
 * @param {?Document|undefined} doc
 * @return {boolean}
 * @private
 */
function isAmp_(doc) {
  return isAmpFormatType(['⚡', 'amp'], doc);
}
