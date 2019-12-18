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

import {
  BIND_PREFIX,
  BLACKLISTED_TAGS,
  EMAIL_WHITELISTED_AMP_TAGS,
  TRIPLE_MUSTACHE_WHITELISTED_TAGS,
  WHITELISTED_ATTRS,
  WHITELISTED_ATTRS_BY_TAGS,
  WHITELISTED_TARGETS,
  isValidAttr,
  markElementForDiffing,
} from './sanitation';
import {dev, user} from './log';
import {isAmp4Email} from './format';
import {removeElement} from './dom';
import {rewriteAttributeValue} from './url-rewrite';
import {startsWith} from './string';
import purify from 'dompurify/dist/purify.es';

/**
 * @typedef {{addHook: !Function, removeAllHooks: !Function, sanitize: !Function}}
 */
export let DomPurifyDef;

// TODO(choumx): Convert this into a class to avoid import side effects.
/** @private @const {!DomPurifyDef} */
const DomPurify = purify(self);

/** @private @const {string} */
const TAG = 'purifier';

/**
 * Tags that are only whitelisted for specific values of given attributes.
 * @private @const {!Object<string, {attribute: string, values: !Array<string>}>}
 */
const WHITELISTED_TAGS_BY_ATTRS = {
  'script': {
    'attribute': 'type',
    'values': ['application/json', 'application/ld+json'],
  },
};

const PURIFY_PROFILES = /** @type {!DomPurifyConfig} */ ({
  USE_PROFILES: {
    html: true,
    svg: true,
    svgFilters: true,
  },
});

/**
 * Monotonically increasing counter used for keying nodes.
 * @private {number}
 */
let KEY_COUNTER = 1;

/**
 * Returns a <body> element containing the sanitized `dirty` markup.
 * Uses the standard DOMPurify config.
 * @param {string} dirty
 * @param {!Document} doc
 * @return {!Node}
 */
export function purifyHtml(dirty, doc) {
  const config = standardPurifyConfig();
  addPurifyHooks(DomPurify, doc);
  const body = DomPurify.sanitize(dirty, config);
  DomPurify.removeAllHooks();
  return body;
}

/**
 * Creates a new DOMPurify instance with a custom DOMPurify configuration.
 * @param {!Document} doc
 * @param {!JsonObject=} opt_config
 * @return {!DomPurifyDef}
 */
export function createPurifier(doc, opt_config) {
  const domPurify = purify(self);
  const config = Object.assign(opt_config || {}, standardPurifyConfig());
  domPurify.setConfig(config);
  addPurifyHooks(domPurify, doc);
  return domPurify;
}

/**
 * Returns standard DOMPurify config for escaped templates.
 * Do not use for unescaped templates.
 *
 * NOTE: See that we use DomPurifyConfig found in
 * build-system/dompurify.extern.js as the exact type. This is to prevent
 * closure compiler from optimizing these fields here in this file and in the
 * 3rd party library file. See #19624 for further information.
 *
 * @return {!DomPurifyConfig}
 */
function standardPurifyConfig() {
  const config = {
    ...PURIFY_PROFILES,
    ADD_ATTR: WHITELISTED_ATTRS,
    ADD_TAGS: ['use'],
    FORBID_TAGS: Object.keys(BLACKLISTED_TAGS),
    FORCE_BODY: true,
    RETURN_DOM: true,
    ALLOW_UNKNOWN_PROTOCOLS: true,
  };
  return /** @type {!DomPurifyConfig} */ (config);
}

/**
 * Gets a copy of the map of allowed tag names (standard DOMPurify config).
 * @return {!Object<string, boolean>}
 */
export function getAllowedTags() {
  const allowedTags = {};
  // Use this hook to extract purifier's allowed tags.
  DomPurify.addHook('uponSanitizeElement', function(node, data) {
    Object.assign(allowedTags, data.allowedTags);
  });
  // Sanitize dummy markup so that the hook is invoked.
  DomPurify.sanitize('<p></p>');
  Object.keys(BLACKLISTED_TAGS).forEach(tag => {
    allowedTags[tag] = false;
  });
  // Pops the last hook added.
  DomPurify.removeHook('uponSanitizeElement');
  return allowedTags;
}

/**
 * Adds AMP hooks to given DOMPurify object.
 * @param {!DomPurifyDef} purifier
 * @param {!Document} doc
 */
function addPurifyHooks(purifier, doc) {
  const isEmail = isAmp4Email(doc);

  // Reference to DOMPurify's `allowedTags` whitelist.
  let allowedTags;
  const allowedTagsChanges = [];

  // Reference to DOMPurify's `allowedAttributes` whitelist.
  let allowedAttributes;
  const allowedAttributesChanges = [];

  /**
   * @param {!Node} node
   * @param {{tagName: string, allowedTags: !Object<string, boolean>}} data
   */
  const uponSanitizeElement = function(node, data) {
    const {tagName} = data;
    allowedTags = data.allowedTags;

    // Allow all AMP elements.
    if (startsWith(tagName, 'amp-')) {
      // Enforce AMP4EMAIL tag whitelist at runtime.
      allowedTags[tagName] = !isEmail || EMAIL_WHITELISTED_AMP_TAGS[tagName];
    }
    // Set `target` attribute for <a> tags if necessary.
    if (tagName === 'a') {
      const element = dev().assertElement(node);
      if (element.hasAttribute('href') && !element.hasAttribute('target')) {
        element.setAttribute('target', '_top');
      }
    }
    // Allow certain tags if they have an attribute with a whitelisted value.
    const whitelist = WHITELISTED_TAGS_BY_ATTRS[tagName];
    if (whitelist) {
      const {attribute, values} = whitelist;
      const element = dev().assertElement(node);
      if (
        element.hasAttribute(attribute) &&
        values.includes(element.getAttribute(attribute))
      ) {
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
   * @param {!Element} element
   * @param {{attrName: string, attrValue: string, allowedAttributes: !Object<string, boolean>}} data
   */
  const uponSanitizeAttribute = function(element, data) {
    // Beware of DOM Clobbering when using properties or functions on `element`.
    // DOMPurify checks a few of these for its internal usage (e.g. `nodeName`),
    // but not others that may be used in custom hooks.
    // See https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model#security-goals
    // and https://github.com/cure53/DOMPurify/blob/master/src/purify.js#L527.

    const tagName = element.nodeName.toLowerCase();
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

    const bindingType = bindingTypeForAttr(attrName);
    // Rewrite classic bindings e.g. [foo]="bar" -> data-amp-bind-foo="bar".
    // This is because DOMPurify eagerly removes attributes and re-adds them
    // after sanitization, which fails because `[]` are not valid attr chars.
    if (bindingType === BindingType.CLASSIC) {
      const property = attrName.substring(1, attrName.length - 1);
      element.setAttribute(`${BIND_PREFIX}${property}`, attrValue);
    }
    if (bindingType !== BindingType.NONE) {
      // Set a custom attribute to mark this element as containing a binding.
      // This is an optimization that obviates the need for DOM scan later.
      element.setAttribute('i-amphtml-binding', '');
    }

    if (
      isValidAttr(
        tagName,
        attrName,
        attrValue,
        /* doc */ doc,
        /* opt_purify */ true
      )
    ) {
      if (attrValue && !startsWith(attrName, 'data-amp-bind-')) {
        attrValue = rewriteAttributeValue(tagName, attrName, attrValue);
      }
    } else {
      data.keepAttr = false;
      user().error(
        TAG,
        'Removed invalid attribute %s[%s="%s"].',
        tagName,
        attrName,
        attrValue
      );
    }

    // Update attribute value.
    data.attrValue = attrValue;
  };

  /**
   * @param {!Element} element
   * @this {{removed: !Array}} Contains list of removed elements/attrs so far.
   */
  const afterSanitizeAttributes = function(element) {
    markElementForDiffing(element, () => String(KEY_COUNTER++));

    // DOMPurify doesn't have a tag-specific attribute whitelist API and
    // `allowedAttributes` has a per-invocation scope, so we need to undo
    // changes after sanitizing attributes.
    allowedAttributesChanges.forEach(attr => {
      delete allowedAttributes[attr];
    });
    allowedAttributesChanges.length = 0;

    // Only allow relative references in <use>.
    const tagName = element.nodeName.toLowerCase();
    if (tagName === 'use') {
      ['href', 'xlink:href'].forEach(attr => {
        if (
          element.hasAttribute(attr) &&
          !startsWith(element.getAttribute(attr), '#')
        ) {
          removeElement(element);
          user().error(
            TAG,
            'Removed invalid <use>. use[href] must start with "#".'
          );
        }
      });
    }
  };

  purifier.addHook('uponSanitizeElement', uponSanitizeElement);
  purifier.addHook('afterSanitizeElements', afterSanitizeElements);
  purifier.addHook('uponSanitizeAttribute', uponSanitizeAttribute);
  purifier.addHook('afterSanitizeAttributes', afterSanitizeAttributes);
}

/**
 * @enum {number}
 */
const BindingType = {
  NONE: 0,
  CLASSIC: 1,
  ALTERNATIVE: 2,
};

/**
 * @param {string} attrName
 * @return {BindingType}
 */
function bindingTypeForAttr(attrName) {
  if (attrName[0] == '[' && attrName[attrName.length - 1] == ']') {
    return BindingType.CLASSIC;
  }
  if (startsWith(attrName, BIND_PREFIX)) {
    return BindingType.ALTERNATIVE;
  }
  return BindingType.NONE;
}

/**
 * Returns whether an attribute addition/modification/removal is valid.
 *
 * This function's behavior should match that of addPurifyHooks(), except
 * that it operates on attribute changes instead of rendering new HTML.
 *
 * @param {!DomPurifyDef} purifier
 * @param {!Node} node
 * @param {string} attr Lower-case attribute name.
 * @param {string|null} value
 * @return {boolean}
 */
export function validateAttributeChange(purifier, node, attr, value) {
  const tag = node.nodeName.toLowerCase();
  // Disallow change of attributes that are required for certain tags,
  // e.g. script[type].
  const whitelist = WHITELISTED_TAGS_BY_ATTRS[tag];
  if (whitelist) {
    const {attribute, values} = whitelist;
    if (attribute === attr) {
      if (value == null || !values.includes(value)) {
        return false;
      }
    }
  }
  // a[target] is required and only certain values are allowed.
  if (tag === 'a' && attr === 'target') {
    if (value == null || !WHITELISTED_TARGETS.includes(value)) {
      return false;
    }
  }
  // By now, the attribute is safe to remove.  DOMPurify.isValidAttribute()
  // expects non-null values.
  if (value == null) {
    return true;
  }
  // Don't allow binding attributes for now.
  if (bindingTypeForAttr(attr) !== BindingType.NONE) {
    return false;
  }
  const pure = purifier.isValidAttribute(tag, attr, value);
  if (!pure) {
    // DOMPurify.isValidAttribute() by default rejects certain attributes that
    // we should allow: (1) AMP element attributes, (2) tag-specific attributes.
    // Reject if _not_ one of the above.
    //
    // TODO(choumx): This opts out of DOMPurify's attribute _value_ sanitization
    // for the above, which assumes that the attributes don't have security
    // implications beyond URLs etc. that are covered by isValidAttr().
    // This is OK but we ought to contribute new hooks and remove this.
    const attrsByTags = WHITELISTED_ATTRS_BY_TAGS[tag];
    const whitelistedForTag = attrsByTags && attrsByTags.includes(attr);
    if (!whitelistedForTag && !startsWith(tag, 'amp-')) {
      return false;
    }
  }
  const doc = node.ownerDocument
    ? node.ownerDocument
    : /** @type {!Document} */ (node);
  // Perform AMP-specific attribute validation e.g. __amp_source_origin.
  if (value && !isValidAttr(tag, attr, value, doc, /* opt_purify */ true)) {
    return false;
  }
  return true;
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
  DomPurify.addHook('uponSanitizeElement', (node, data) => {
    const {tagName} = data;
    allowedTags = data.allowedTags;
    if (tagName === 'template') {
      const type = node.getAttribute('type');
      if (type && type.toLowerCase() === 'amp-mustache') {
        allowedTags['template'] = true;
      }
    }
  });
  DomPurify.addHook('afterSanitizeElements', unusedNode => {
    // DOMPurify doesn't have an required-attribute tag whitelist API and
    // `allowedTags` has a per-invocation scope, so we need to remove
    // required-attribute tags after sanitizing each element.
    allowedTags['template'] = false;
  });
  // <template> elements are parsed by the browser as document fragments and
  // reparented to the head. So to support nested templates, we need
  // RETURN_DOM_FRAGMENT to keep the <template> and FORCE_BODY to prevent
  // reparenting. See https://github.com/cure53/DOMPurify/issues/285#issuecomment-397810671
  const fragment = DomPurify.sanitize(html, {
    'ALLOWED_TAGS': TRIPLE_MUSTACHE_WHITELISTED_TAGS,
    'FORCE_BODY': true,
    'RETURN_DOM_FRAGMENT': true,
  });
  DomPurify.removeAllHooks();
  // Serialize DocumentFragment to HTML. XMLSerializer would also work, but adds
  // namespaces for all elements and attributes.
  const div = doc.createElement('div');
  div.appendChild(fragment);
  return div./*OK*/ innerHTML;
}
