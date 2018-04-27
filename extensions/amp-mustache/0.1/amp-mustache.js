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

import {dict, map} from '../../../src/utils/object';
import {htmlSanitizer} from '../../../third_party/caja/html-sanitizer';
import {isExperimentOn} from '../../../src/experiments';
import {iterateCursor, templateContentClone} from '../../../src/dom';
import {parse as mustacheParse, render as mustacheRender,
  setUnescapedSanitizier} from '../../../third_party/mustache/mustache';
import {rewriteAttributeValue} from '../../../src/url';
import {startsWith} from '../../../src/string';
import {user} from '../../../src/log';

// Configure sanitizer for output of "triple-mustache";a set of allowed tags
// to be unescaped.
setUnescapedSanitizier(sanitizeTagsForTripleMustache);

/** @private @const {string} */
const TAG = 'amp-mustache';

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
const WHITELISTED_TAGS = [
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
  'mark',
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
    'type': /(?:image|file|button)/i,
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
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @private Visible for testing.
 * @extends {BaseTemplate$$module$src$service$template_impl}
 */
export class AmpMustache extends AMP.BaseTemplate {

  /** @override */
  compileCallback() {
    /** @private @const {!JsonObject} */
    this.nestedTemplates_ = dict();
    let index = 0;
    const content = templateContentClone(this.element);
    iterateCursor(content.querySelectorAll('template'), nestedTemplate => {
      const nestedTemplateKey = `__AMP_NESTED_TEMPLATE_${index}`;
      this.nestedTemplates_[nestedTemplateKey] = nestedTemplate./*OK*/outerHTML;

      const nestedTemplateAsVariable = this.element.ownerDocument
          .createTextNode(`{{{${nestedTemplateKey}}}}`);
      nestedTemplate.parentNode.replaceChild(nestedTemplateAsVariable,
          nestedTemplate);
      index++;
    });
    const container = this.element.ownerDocument.createElement('div');
    container.appendChild(content);
    /** @private @const {string} */
    this.template_ = container./*OK*/innerHTML;
    mustacheParse(this.template_);
  }

  /** @override */
  render(data) {
    let mustacheData = data;
    if (typeof data === 'object') {
      mustacheData = Object.assign({}, data, this.nestedTemplates_);
    }
    const html = mustacheRender(this.template_, mustacheData);
    const sanitized = sanitizeHtml(html);
    const root = this.win.document.createElement('div');
    root./*OK*/innerHTML = sanitized;
    return this.unwrap(root);
  }


}

/**
 * Whether the attribute/value is valid.
 * @param {string} tagName
 * @param {string} attrName
 * @param {string} attrValue
 * @return {boolean}
 */
function isValidAttr(tagName, attrName, attrValue) {
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
 * Sanitizes user provided HTML to mustache templates, used in amp-mustache.
 * WARNING: This method should not be used elsewhere as we do not strip out
 * the style attribute in this method for the inline-style experiment.
 * We do so in sanitizeHtml which occurs after this initial sanitizing.
 *
 * @private
 * @param {string} html
 * @return {string}
 */
function sanitizeTagsForTripleMustache(html) {
  return htmlSanitizer.sanitizeWithPolicy(html, tripleMustacheTagPolicy);
}

/**
 * Tag policy for handling what is valid html in templates.
 * @type {!Function}
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
  const isWhitelistedTag = WHITELISTED_TAGS.includes(tagName);
  if (!isWhitelistedTag) {
    return null;
  }
  return {
    tagName,
    attribs,
  };
}

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
function sanitizeHtml(html) {
  const tagPolicy = htmlSanitizer.makeTagPolicy(parsed =>
    parsed.getScheme() === 'https' ? parsed : null);
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
            : rewriteAttributeValue(TAG, tagName, attrName, attrValue);
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

AMP.registerTemplate('amp-mustache', AmpMustache);
