/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import * as DOMPurify from 'dompurify/dist/purify.cjs';
import {
  checkCorsUrl,
  getSourceUrl,
  isProxyOrigin,
  parseUrlDeprecated,
  resolveRelativeUrl,
} from './url';
import {dict} from './utils/object';
import {filterSplice} from './utils/array';
import {parseSrcset} from './srcset';
import {startsWith} from './string';
import {urls} from './config';
import {user} from './log';

/** @private @const {string} */
const TAG = 'purifier';

/** @private @const {string} */
const ORIGINAL_TARGET_VALUE = '__AMP_ORIGINAL_TARGET_VALUE_';

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
  'template': [
    'type',
  ],
};

/**
 * Tags that are only whitelisted for specific values of given attributes.
 * @private @const {!Object<string, {attribute: string, values: !Array<string>}>}
 */
const WHITELISTED_TAGS_BY_ATTRS = {
  'script': {
    'attribute': 'type',
    'values': [
      'application/json',
      'application/ld+json',
    ],
  },
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

/** @const {!Object} */
const PURIFY_CONFIG = {
  'USE_PROFILES': {
    'html': true,
    'svg': true,
    'svgFilters': true,
  },
};

/**
 * Monotonically increasing counter used for keying nodes.
 * @private {number}
 */
let KEY_COUNTER = 0;

/**
 * Returns a <body> element containing the sanitized, serialized `dirty`.
 * @param {string} dirty
 * @param {boolean=} diffing
 * @return {!Node}
 */
export function purifyHtml(dirty, diffing = false) {
  const config = Object.assign({}, PURIFY_CONFIG, {
    'ADD_ATTR': WHITELISTED_ATTRS,
    'FORBID_TAGS': Object.keys(BLACKLISTED_TAGS),
    // Avoid reparenting of some elements to document head e.g. <script>.
    'FORCE_BODY': true,
    // Avoid need for serializing to/from string by returning Node directly.
    'RETURN_DOM': true,
  });

  // Reference to DOMPurify's `allowedTags` whitelist.
  let allowedTags;
  const allowedTagsChanges = [];

  // Reference to DOMPurify's `allowedAttributes` whitelist.
  let allowedAttributes;
  const allowedAttributesChanges = [];

  // Disables DOM diffing for a given node and allows it to be replaced.
  const disableDiffingFor = node => {
    const key = 'i-amphtml-key';
    if (diffing && !node.hasAttribute(key)) {
      // set-dom uses node attribute keys for opting out of diffing.
      node.setAttribute(key, KEY_COUNTER++);
    }
  };

  /**
   * @param {!Node} node
   * @param {{tagName: string, allowedTags: !Object<string, boolean>}} data
   */
  const uponSanitizeElement = function(node, data) {
    const {tagName} = data;
    allowedTags = data.allowedTags;

    // Allow all AMP elements (constrained by AMP Validator since tag
    // calculation is not possible).
    if (startsWith(tagName, 'amp-')) {
      allowedTags[tagName] = true;
      // AMP elements don't support arbitrary mutation, so don't DOM diff them.
      disableDiffingFor(node);
    }
    // Set `target` attribute for <a> tags if necessary.
    if (tagName === 'a') {
      if (node.hasAttribute('href') && !node.hasAttribute('target')) {
        node.setAttribute('target', '_top');
      }
    }
    // Allow certain tags if they have an attribute with a whitelisted value.
    const whitelist = WHITELISTED_TAGS_BY_ATTRS[tagName];
    if (whitelist) {
      const {attribute, values} = whitelist;
      if (node.hasAttribute(attribute)
          && values.includes(node.getAttribute(attribute))) {
        allowedTags[tagName] = true;
        allowedTagsChanges.push(tagName);
      }
    }
  };

  /**
   * @param {!Node} unusedNode
   */
  const afterSanitizeElements = function(unusedNode) {
    // DOMPurify doesn't have a attribute-specific tag whitelist API and
    // `allowedTags` has a per-invocation scope, so we need to undo
    // changes after sanitizing elements.
    allowedTagsChanges.forEach(tag => {
      delete allowedTags[tag];
    });
    allowedTagsChanges.length = 0;
  };

  /**
   * @param {!Node} node
   * @param {{attrName: string, attrValue: string, allowedAttributes: !Object<string, boolean>}} data
   */
  const uponSanitizeAttribute = function(node, data) {
    // Beware of DOM Clobbering when using properties or functions on `node`.
    // DOMPurify checks a few of these for its internal usage (e.g. `nodeName`),
    // but not others that may be used in custom hooks.
    // See https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model#security-goals
    // and https://github.com/cure53/DOMPurify/blob/master/src/purify.js#L527.

    const tagName = node.nodeName.toLowerCase();
    const {attrName} = data;
    let {attrValue} = data;
    allowedAttributes = data.allowedAttributes;

    const allowAttribute = () => {
      // Only add new attributes to `allowedAttributesChanges` to avoid removing
      // default-supported attributes later erroneously.
      if (!allowedAttributes[attrName]) {
        allowedAttributes[attrName] = true;
        allowedAttributesChanges.push(attrName);
      }
    };

    // Allow all attributes for AMP elements. This avoids the need to whitelist
    // nonstandard attributes for every component e.g. amp-lightbox[scrollable].
    const isAmpElement = startsWith(tagName, 'amp-');
    if (isAmpElement) {
      allowAttribute();
    } else {
      // `<A>` has special target rules:
      // - Default target is "_top";
      // - Allowed targets are "_blank", "_top";
      // - All other targets are rewritted to "_top".
      if (tagName == 'a' && attrName == 'target') {
        const lowercaseValue = attrValue.toLowerCase();
        if (!WHITELISTED_TARGETS.includes(lowercaseValue)) {
          attrValue = '_top';
        } else {
          // Always use lowercase values for `target` attr.
          attrValue = lowercaseValue;
        }
      }

      // For non-AMP elements, allow attributes in tag-specific whitelist.
      const attrsByTags = WHITELISTED_ATTRS_BY_TAGS[tagName];
      if (attrsByTags && attrsByTags.includes(attrName)) {
        allowAttribute();
      }
    }

    // Rewrite amp-bind attributes e.g. [foo]="bar" -> data-amp-bind-foo="bar".
    // This is because DOMPurify eagerly removes attributes and re-adds them
    // after sanitization, which fails because `[]` are not valid attr chars.
    const isBinding = attrName[0] == '['
        && attrName[attrName.length - 1] == ']';
    if (isBinding) {
      const property = attrName.substring(1, attrName.length - 1);
      node.setAttribute(`data-amp-bind-${property}`, attrValue);
      // Set a custom attribute to mark this element as containing a binding.
      // This is an optimization that obviates the need for DOM scan later.
      node.setAttribute('i-amphtml-binding', '');
      // Don't DOM diff nodes with bindings because amp-bind scans newly
      // rendered elements and discards _all_ old elements _before_ diffing, so
      // preserving some old elements would cause loss of functionality.
      disableDiffingFor(node);
    }

    if (isValidAttr(tagName, attrName, attrValue, /* opt_purify */ true)) {
      if (attrValue && !startsWith(attrName, 'data-amp-bind-')) {
        attrValue = rewriteAttributeValue(tagName, attrName, attrValue);
      }
    } else {
      user().error(TAG, `Removing "${attrName}" attribute with invalid `
          + `value in <${tagName} ${attrName}="${attrValue}">.`);
      data.keepAttr = false;
    }

    // Update attribute value.
    data.attrValue = attrValue;
  };

  /**
   * @param {!Node} node
   * @this {{removed: !Array}} Contains list of removed elements/attrs so far.
   */
  const afterSanitizeAttributes = function(node) {
    // DOMPurify doesn't have a tag-specific attribute whitelist API and
    // `allowedAttributes` has a per-invocation scope, so we need to undo
    // changes after sanitizing attributes.
    allowedAttributesChanges.forEach(attr => {
      delete allowedAttributes[attr];
    });
    allowedAttributesChanges.length = 0;

    // Restore the `on` attribute which DOMPurify incorrectly flags as an
    // unknown protocol due to presence of the `:` character.
    filterSplice(this.removed, r => {
      if (r.from === node && r.attribute) {
        const {name, value} = r.attribute;
        if (name.toLowerCase() === 'on') {
          node.setAttribute('on', value);
          return false; // Delete from `removed` array once processed.
        }
      }
      return true;
    });
  };

  DOMPurify.addHook('uponSanitizeElement', uponSanitizeElement);
  DOMPurify.addHook('afterSanitizeElements', afterSanitizeElements);
  DOMPurify.addHook('uponSanitizeAttribute', uponSanitizeAttribute);
  DOMPurify.addHook('afterSanitizeAttributes', afterSanitizeAttributes);
  const body = DOMPurify.sanitize(dirty, config);
  DOMPurify.removeAllHooks();
  return body;
}

/**
 * Uses DOMPurify to sanitize HTML with stricter policy for unescaped templates
 * e.g. triple mustache.
 *
 * @param {string} html
 * @param {!Document=} doc
 * @return {string}
 */
export function purifyTagsForTripleMustache(html, doc = self.document) {
  // Reference to DOMPurify's `allowedTags` whitelist.
  let allowedTags;

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    const {tagName} = data;
    allowedTags = data.allowedTags;
    if (tagName === 'template') {
      const type = node.getAttribute('type');
      if (type && type.toLowerCase() === 'amp-mustache') {
        allowedTags['template'] = true;
      }
    }
  });
  DOMPurify.addHook('afterSanitizeElements', unusedNode => {
    // DOMPurify doesn't have an required-attribute tag whitelist API and
    // `allowedTags` has a per-invocation scope, so we need to remove
    // required-attribute tags after sanitizing each element.
    allowedTags['template'] = false;
  });
  // <template> elements are parsed by the browser as document fragments and
  // reparented to the head. So to support nested templates, we need
  // RETURN_DOM_FRAGMENT to keep the <template> and FORCE_BODY to prevent
  // reparenting. See https://github.com/cure53/DOMPurify/issues/285#issuecomment-397810671
  const fragment = DOMPurify.sanitize(html, {
    'ALLOWED_TAGS': TRIPLE_MUSTACHE_WHITELISTED_TAGS,
    'FORCE_BODY': true,
    'RETURN_DOM_FRAGMENT': true,
  });
  DOMPurify.removeAllHooks();
  // Serialize DocumentFragment to HTML. XMLSerializer would also work, but adds
  // namespaces for all elements and attributes.
  const div = doc.createElement('div');
  div.appendChild(fragment);
  return div./*OK*/innerHTML;
}

/**
 * Whether the attribute/value is valid.
 * @param {string} tagName
 * @param {string} attrName
 * @param {string} attrValue
 * @param {boolean} opt_purify Is true, skips some attribute sanitizations
 *     that are already covered by DOMPurify.
 * @return {boolean}
 */
export function isValidAttr(tagName, attrName, attrValue, opt_purify = false) {
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

  // Inline styles are not allowed.
  if (attrName == 'style') {
    return !INVALID_INLINE_STYLE_REGEX.test(attrValue);
  }

  // Don't allow CSS class names with internal AMP prefix.
  // See https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii
  if (attrName == 'class' && attrValue && /(^|\W)i-amphtml-/i.test(attrValue)) {
    return false;
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
 * @param {boolean=} opt_updateProperty
 * @return {string}
 */
export function rewriteAttributesForElement(
  element, attrName, attrValue, opt_location, opt_updateProperty)
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
  if (opt_updateProperty) {
    // Must be done first for <input> elements to correctly update the UI for
    // the first change on Safari and Chrome.
    element[attr] = rewrittenValue;
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
  const baseUrl = parseUrlDeprecated(getSourceUrl(windowLocation));

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
  const src = parseUrlDeprecated(resolveRelativeUrl(attrValue, baseUrl));

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
