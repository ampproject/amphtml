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
  TRIPLE_MUSTACHE_WHITELISTED_TAGS,
  WHITELISTED_ATTRS,
  WHITELISTED_ATTRS_BY_TAGS,
  WHITELISTED_TARGETS,
  isValidAttr,
} from './sanitation';
import {remove} from './utils/array';
import {rewriteAttributeValue} from './url-rewrite';
import {startsWith} from './string';
import {user} from './log';
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
    'values': [
      'application/json',
      'application/ld+json',
    ],
  },
};

const PURIFY_CONFIG = /** @type {!DomPurifyConfig} */ ({
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
let KEY_COUNTER = 0;

/**
 * Returns a <body> element containing the sanitized, serialized `dirty`.
 * @param {string} dirty
 * @param {boolean=} diffing
 * @return {!Node}
 */
export function purifyHtml(dirty, diffing = false) {
  const config = purifyConfig();
  addPurifyHooks(DomPurify, diffing);
  const body = DomPurify.sanitize(dirty, config);
  DomPurify.removeAllHooks();
  return body;
}

/**
 * @param {!JsonObject=} opt_config
 * @return {!DomPurifyDef}
 */
export function createPurifier(opt_config) {
  const domPurify = purify(self);
  const config = Object.assign(opt_config || {}, purifyConfig());
  domPurify.setConfig(config);
  addPurifyHooks(domPurify, /* diffing */ false);
  return domPurify;
}

/**
 * Returns DOMPurify config for normal, escaped templates.
 * Do not use for unescaped templates.
 *
 * NOTE: See that we use DomPurifyConfig found in
 * build-system/dompurify.extern.js as the exact type. This is to prevent
 * closure compiler from optimizing these fields here in this file and in the
 * 3rd party library file. See #19624 for further information.
 *
 * @return {!DomPurifyConfig}
 */
function purifyConfig() {
  const config = Object.assign({}, PURIFY_CONFIG, /** @type {!DomPurifyConfig} */ ({
    ADD_ATTR: WHITELISTED_ATTRS,
    FORBID_TAGS: Object.keys(BLACKLISTED_TAGS),
    // Avoid reparenting of some elements to document head e.g. <script>.
    FORCE_BODY: true,
    // Avoid need for serializing to/from string by returning Node directly.
    RETURN_DOM: true,
    // BLACKLISTED_ATTR_VALUES are enough. Other unknown protocols are safe.
    // This allows native app deeplinks.
    ALLOW_UNKNOWN_PROTOCOLS: true,
  }));
  return /** @type {!DomPurifyConfig} */ (config);
}

/**
 * Adds AMP hooks to given DOMPurify object.
 * @param {!DomPurifyDef} purifier
 * @param {boolean} diffing
 */
function addPurifyHooks(purifier, diffing) {
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

    // Allow all AMP elements.
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

    const bindingType = bindingTypeForAttr(attrName);
    // Rewrite classic bindings e.g. [foo]="bar" -> data-amp-bind-foo="bar".
    // This is because DOMPurify eagerly removes attributes and re-adds them
    // after sanitization, which fails because `[]` are not valid attr chars.
    if (bindingType === BindingType.CLASSIC) {
      const property = attrName.substring(1, attrName.length - 1);
      node.setAttribute(`${BIND_PREFIX}${property}`, attrValue);
    }
    if (bindingType !== BindingType.NONE) {
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
    remove(this.removed, r => {
      if (r.from === node && r.attribute) {
        const {name, value} = r.attribute;
        if (name.toLowerCase() === 'on') {
          node.setAttribute('on', value);
          return true; // Delete from `removed` array once processed.
        }
      }
      return false;
    });
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
 * @param {string} tag Lower-case tag name.
 * @param {string} attr Lower-case attribute name.
 * @param {string|null} value
 * @return {boolean}
 */
export function validateAttributeChange(purifier, tag, attr, value) {
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
  // Don't allow binding attributes for now.
  if (bindingTypeForAttr(attr) !== BindingType.NONE) {
    return false;
  }
  const pure = purifier.isValidAttribute(tag, attr, value);
  if (!pure) {
    // DOMPurify.isValidAttribute() by default rejects certain attributes that
    // we should allow: (1) AMP element attributes, (2) tag-specific attributes,
    // (3) the 'on' attribute. Reject if _not_ one of the above.
    //
    // TODO(choumx): This opts out of DOMPurify's attribute _value_ sanitization
    // for the above, which assumes that the attributes don't have security
    // implications beyond URLs etc. that are covered by isValidAttr().
    // This is OK for now, but we should instead somehow modify ALLOWED_ATTR
    // to preserve value sanitization.
    const attrsByTags = WHITELISTED_ATTRS_BY_TAGS[tag];
    const whitelistedForTag = attrsByTags && attrsByTags.includes(attr);
    if (!whitelistedForTag && !startsWith(tag, 'amp-') && attr !== 'on') {
      return false;
    }
  }
  // Perform AMP-specific attribute validation e.g. __amp_source_origin.
  if (value && !isValidAttr(tag, attr, value, /* opt_purify */ true)) {
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
  return div./*OK*/innerHTML;
}
