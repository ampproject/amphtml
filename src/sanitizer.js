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
  BIND_PREFIX,
  BLACKLISTED_TAGS,
  TRIPLE_MUSTACHE_WHITELISTED_TAGS,
  WHITELISTED_ATTRS,
  WHITELISTED_ATTRS_BY_TAGS,
  WHITELISTED_TARGETS,
  isValidAttr,
} from './sanitation';
import {dict} from './utils/object';
import {htmlSanitizer} from '../third_party/caja/html-sanitizer';
import {rewriteAttributeValue} from './url-rewrite';
import {startsWith} from './string';
import {user} from './log';

/** @private @const {string} */
const TAG = 'sanitizer';

/**
 * Whitelist of supported self-closing tags for Caja. These are used for
 * correct parsing on Caja and are not necessary for DOMPurify which uses
 * the browser's HTML parser.
 * @const {!Object<string, boolean>}
 */
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

/**
 * Regex to allow data-*, aria-* and role attributes.
 * Only needed in Caja. Internally supported by DOMPurify.
 * @const {!RegExp}
 */
const WHITELISTED_ATTR_PREFIX_REGEX = /^(data-|aria-)|^role$/i;

/**
 * Monotonically increasing counter used for keying nodes.
 * @private {number}
 */
let KEY_COUNTER = 0;

/**
 * Sanitizes the provided HTML.
 *
 * This function expects the HTML to be already pre-sanitized and thus it does
 * not validate all of the AMP rules - only the most dangerous security-related
 * cases, such as <SCRIPT>, <STYLE>, <IFRAME>.
 *
 * @param {string} html
 * @param {boolean=} diffing
 * @param {Document=} opt_doc
 * @return {string}
 */
export function sanitizeHtml(html, diffing, opt_doc) {
  const tagPolicy = htmlSanitizer.makeTagPolicy(parsed =>
    parsed.getScheme() === 'https' ? parsed : null);
  const output = [];
  let ignore = 0;

  const emit = content => {
    if (ignore == 0) {
      output.push(content);
    }
  };

  // No Caja support for <script> or <svg>.
  const cajaBlacklistedTags = Object.assign(
      {'script': true, 'svg': true}, BLACKLISTED_TAGS);

  const parser = htmlSanitizer.makeSaxParser({
    'startTag': function(tagName, attribs) {
      if (ignore > 0) {
        if (!SELF_CLOSING_TAGS[tagName]) {
          ignore++;
        }
        return;
      }
      const isAmpElement = startsWith(tagName, 'amp-');
      // Preprocess "binding" attributes, e.g. [attr], by stripping enclosing
      // brackets before custom validation and restoring them afterwards.
      const bindingAttribs = [];
      for (let i = 0; i < attribs.length; i += 2) {
        const attr = attribs[i];
        if (!attr) {
          continue;
        }
        const classicBinding = attr[0] == '[' && attr[attr.length - 1] == ']';
        const alternativeBinding = startsWith(attr, BIND_PREFIX);
        if (classicBinding) {
          attribs[i] = attr.slice(1, -1);
        }
        if (classicBinding || alternativeBinding) {
          bindingAttribs.push(i);
        }
      }

      if (cajaBlacklistedTags[tagName]) {
        ignore++;
      } else if (!isAmpElement) {
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
            const attrName = attribs[i];
            if (WHITELISTED_ATTRS.includes(attrName)) {
              attribs[i + 1] = savedAttribs[i + 1];
            } else if (attrName.search(WHITELISTED_ATTR_PREFIX_REGEX) == 0) {
              attribs[i + 1] = savedAttribs[i + 1];
            } else if (WHITELISTED_ATTRS_BY_TAGS[tagName] &&
                       WHITELISTED_ATTRS_BY_TAGS[tagName].includes(attrName)) {
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
            attribs.push('target', '_top');
          }
        }
      }
      if (ignore > 0) {
        if (SELF_CLOSING_TAGS[tagName]) {
          ignore--;
        }
        return;
      }
      // Filter out bindings with empty attribute values.
      const hasBindings = bindingAttribs.some(i => !!attribs[i + 1]);
      if (hasBindings) {
        // Set a custom attribute to identify elements with bindings.
        // This is an optimization that avoids the need for a DOM scan later.
        attribs.push('i-amphtml-binding', '');
      }
      // Elements with bindings and AMP elements must opt-out of DOM diffing.
      // - Opt-out nodes with bindings because amp-bind scans newly
      //   rendered elements and discards _all_ old elements _before_ diffing,
      //   so preserving some old elements would cause loss of functionality.
      // - Opt-out AMP elements because they don't support arbitrary mutation.
      if (hasBindings || isAmpElement) {
        if (diffing) {
          attribs.push('i-amphtml-key', String(KEY_COUNTER++));
        }
      }
      emit('<');
      emit(tagName);
      for (let i = 0; i < attribs.length; i += 2) {
        const attrName = attribs[i];
        const attrValue = attribs[i + 1];
        if (!isValidAttr(tagName, attrName, attrValue, false, opt_doc)) {
          user().error(TAG, `Removing "${attrName}" attribute with invalid `
              + `value in <${tagName} ${attrName}="${attrValue}">.`);
          continue;
        }
        emit(' ');
        if (bindingAttribs.includes(i) && !startsWith(attrName, BIND_PREFIX)) {
          emit(`[${attrName}]`);
        } else {
          emit(attrName);
        }
        emit('="');
        if (attrValue) {
          // Rewrite attribute values unless this attribute is a binding.
          // Bindings contain expressions and shouldn't be rewritten.
          const rewrite = (bindingAttribs.includes(i))
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
 * Sanitizes user provided HTML to mustache templates, used in amp-mustache.
 *
 * WARNING: This method should not be used elsewhere as we do not strip out
 * the style attribute in this method for the inline-style experiment.
 * We do so in sanitizeHtml which occurs after this initial sanitizing.
 *
 * @param {string} html
 * @return {string}
 */
export function sanitizeTagsForTripleMustache(html) {
  return htmlSanitizer.sanitizeWithPolicy(html, tripleMustacheTagPolicy);
}

/**
 * Tag policy for handling what is valid html in templates.
 * @param {string} tagName
 * @param {!Array<string>} attribs
 */
function tripleMustacheTagPolicy(tagName, attribs) {
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
  if (!TRIPLE_MUSTACHE_WHITELISTED_TAGS.includes(tagName)) {
    return null;
  }
  return {
    tagName,
    attribs,
  };
}
