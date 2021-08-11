function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import purify from 'dompurify';

import { devAssertElement } from "../core/assert";
import { removeElement } from "../core/dom";

import {
ALLOWLISTED_ATTRS,
ALLOWLISTED_ATTRS_BY_TAGS,
ALLOWLISTED_TARGETS,
BIND_PREFIX,
DENYLISTED_TAGS,
EMAIL_ALLOWLISTED_AMP_TAGS,
TRIPLE_MUSTACHE_ALLOWLISTED_TAGS,
isValidAttr,
markElementForDiffing } from "./sanitation";


import { isAmp4Email } from "../format";
import { user } from "../log";

/** @private @const {string} */
var TAG = 'purifier';

/**
 * Tags that are only allowlisted for specific values of given attributes.
 * @private @const {!Object<string, {attribute: string, values: !Array<string>}>}
 */
var ALLOWLISTED_TAGS_BY_ATTRS = {
  'script': {
    'attribute': 'type',
    'values': ['application/json', 'application/ld+json'] } };



var PURIFY_PROFILES = /** @type {!DomPurifyConfig} */({
  USE_PROFILES: {
    html: true,
    svg: true,
    svgFilters: true } });



/**
 * @typedef {{addHook: !Function, removeAllHooks: !Function, sanitize: !Function}}
 */
var DomPurifyDef;

/**
 * @typedef {function(string, string, string): string}
 */
export var AttributeRewriterDef;

export var Purifier = /*#__PURE__*/function () {
  /**
   * @param {!Document} doc
   * @param {!JsonObject=} opt_config
   * @param {!AttributeRewriterDef=} opt_attrRewrite
   */
  function Purifier(doc, opt_config, opt_attrRewrite) {_classCallCheck(this, Purifier);
    /** @private {!Document} */
    this.doc_ = doc;

    /**
     * Monotonically increasing counter used for keying nodes.
     * @private {number}
     */
    this.keyCounter_ = 1;

    /** @private {!DomPurifyDef} */
    this.domPurify_ = purify(self);

    /** @private {!DomPurifyDef} */
    this.domPurifyTriple_ = purify(self);

    var config = Object.assign(opt_config || {}, standardPurifyConfig());
    this.domPurify_.setConfig(config);
    this.addPurifyHooks_(this.domPurify_, opt_attrRewrite);

    this.addPurifyHooksTripleMustache_(this.domPurifyTriple_);
  }

  /**
   * Returns a <body> element containing the sanitized `dirty` markup.
   * Uses the standard DOMPurify config.
   * @param {string} dirty
   * @return {!Node}
   */_createClass(Purifier, [{ key: "purifyHtml", value:
    function purifyHtml(dirty) {
      var body = this.domPurify_.sanitize(dirty);
      return body;
    }

    /**
     * Uses DOMPurify to sanitize HTML with stricter policy for unescaped templates
     * e.g. triple mustache.
     *
     * @param {string} dirty
     * @return {string}
     */ }, { key: "purifyTagsForTripleMustache", value:
    function purifyTagsForTripleMustache(dirty) {
      // <template> elements are parsed by the browser as document fragments and
      // reparented to the head. So to support nested templates, we need
      // RETURN_DOM_FRAGMENT to keep the <template> and FORCE_BODY to prevent
      // reparenting. See https://github.com/cure53/DOMPurify/issues/285#issuecomment-397810671
      var fragment = this.domPurifyTriple_.sanitize(dirty, {
        'ALLOWED_TAGS': TRIPLE_MUSTACHE_ALLOWLISTED_TAGS,
        'FORCE_BODY': true,
        'RETURN_DOM_FRAGMENT': true });

      // Serialize DocumentFragment to HTML. XMLSerializer would also work, but adds
      // namespaces for all elements and attributes.
      var div = this.doc_.createElement('div');
      div.appendChild(fragment);
      return div. /*OK*/innerHTML;
    }

    /**
     * Gets a copy of the map of allowed tag names (standard DOMPurify config).
     * @return {!Object<string, boolean>}
     */ }, { key: "getAllowedTags", value:
    function getAllowedTags() {
      var allowedTags = {};
      // Use this hook to extract purifier's allowed tags.
      this.domPurify_.addHook('uponSanitizeElement', function (node, data) {
        Object.assign(allowedTags, data.allowedTags);
      });
      // Sanitize dummy markup so that the hook is invoked.
      var p = this.doc_.createElement('p');
      this.domPurify_.sanitize(p);
      Object.keys(DENYLISTED_TAGS).forEach(function (tag) {
        allowedTags[tag] = false;
      });
      // Pops the last hook added.
      this.domPurify_.removeHook('uponSanitizeElement');
      return allowedTags;
    }

    /**
     * Returns whether an attribute addition/modification/removal is valid.
     *
     * This function's behavior should match that of addPurifyHooks(), except
     * that it operates on attribute changes instead of rendering new HTML.
     *
     * @param {!Node} node
     * @param {string} attr Lower-case attribute name.
     * @param {?string} value
     * @return {boolean}
     */ }, { key: "validateAttributeChange", value:
    function validateAttributeChange(node, attr, value) {
      var tag = node.nodeName.toLowerCase();
      // Disallow change of attributes that are required for certain tags,
      // e.g. script[type].
      var allowlist = ALLOWLISTED_TAGS_BY_ATTRS[tag];
      if (allowlist) {
        var attribute = allowlist.attribute,values = allowlist.values;
        if (attribute === attr) {
          if (value == null || !values.includes(value)) {
            return false;
          }
        }
      }
      // a[target] is required and only certain values are allowed.
      if (tag === 'a' && attr === 'target') {
        if (value == null || !ALLOWLISTED_TARGETS.includes(value)) {
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
      var pure = this.domPurify_.isValidAttribute(tag, attr, value);
      if (!pure) {
        // DOMPurify.isValidAttribute() by default rejects certain attributes that
        // we should allow: (1) AMP element attributes, (2) tag-specific attributes.
        // Reject if _not_ one of the above.
        //
        // TODO(choumx): This opts out of DOMPurify's attribute _value_ sanitization
        // for the above, which assumes that the attributes don't have security
        // implications beyond URLs etc. that are covered by isValidAttr().
        // This is OK but we ought to contribute new hooks and remove this.
        var attrsByTags = ALLOWLISTED_ATTRS_BY_TAGS[tag];
        var allowlistedForTag = attrsByTags && attrsByTags.includes(attr);
        if (!allowlistedForTag && !tag.startsWith('amp-')) {
          return false;
        }
      }
      var doc = node.ownerDocument ?
      node.ownerDocument :
      /** @type {!Document} */(node);
      // Perform AMP-specific attribute validation e.g. __amp_source_origin.
      if (value && !isValidAttr(tag, attr, value, doc, /* opt_purify */true)) {
        return false;
      }
      return true;
    }

    /**
     * Adds AMP hooks to given DOMPurify object.
     * @param {!DomPurifyDef} purifier
     * @param {!AttributeRewriterDef|undefined} attrRewrite
     * @private
     */ }, { key: "addPurifyHooks_", value:
    function addPurifyHooks_(purifier, attrRewrite) {var _this = this;
      var isEmail = isAmp4Email(this.doc_);

      // Reference to DOMPurify's `allowedTags` allowlist.
      var allowedTags;
      var allowedTagsChanges = [];

      // Reference to DOMPurify's `allowedAttributes` allowlist.
      var allowedAttributes;
      var allowedAttributesChanges = [];

      /**
       * @param {!Node} node
       * @param {{tagName: string, allowedTags: !Object<string, boolean>}} data
       */
      var uponSanitizeElement = function uponSanitizeElement(node, data) {
        var tagName = data.tagName;
        allowedTags = data.allowedTags;

        // Allow all AMP elements.
        if (tagName.startsWith('amp-')) {
          // Enforce AMP4EMAIL tag allowlist at runtime.
          allowedTags[tagName] = !isEmail || EMAIL_ALLOWLISTED_AMP_TAGS[tagName];
        }
        // Set `target` attribute for <a> tags if necessary.
        if (tagName === 'a') {
          var element = devAssertElement(node);
          if (element.hasAttribute('href') && !element.hasAttribute('target')) {
            element.setAttribute('target', '_top');
          }
        }
        // Allow certain tags if they have an attribute with a allowlisted value.
        var allowlist = ALLOWLISTED_TAGS_BY_ATTRS[tagName];
        if (allowlist) {
          var attribute = allowlist.attribute,values = allowlist.values;
          var _element = devAssertElement(node);
          if (
          _element.hasAttribute(attribute) &&
          values.includes(_element.getAttribute(attribute)))
          {
            allowedTags[tagName] = true;
            allowedTagsChanges.push(tagName);
          }
        }
      };

      /**
       * @param {!Node} unusedNode
       */
      var afterSanitizeElements = function afterSanitizeElements(unusedNode) {
        // DOMPurify doesn't have a attribute-specific tag allowlist API and
        // `allowedTags` has a per-invocation scope, so we need to undo
        // changes after sanitizing elements.
        allowedTagsChanges.forEach(function (tag) {
          delete allowedTags[tag];
        });
        allowedTagsChanges.length = 0;
      };

      /**
       * @param {!Element} element
       * @param {{attrName: string, attrValue: string, allowedAttributes: !Object<string, boolean>}} data
       */
      var uponSanitizeAttribute = function uponSanitizeAttribute(element, data) {
        // Beware of DOM Clobbering when using properties or functions on `element`.
        // DOMPurify checks a few of these for its internal usage (e.g. `nodeName`),
        // but not others that may be used in custom hooks.
        // See https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model#security-goals
        // and https://github.com/cure53/DOMPurify/blob/master/src/purify.js#L527.

        var tagName = element.nodeName.toLowerCase();
        var attrName = data.attrName;
        var attrValue = data.attrValue;
        allowedAttributes = data.allowedAttributes;

        var allowAttribute = function allowAttribute() {
          // Only add new attributes to `allowedAttributesChanges` to avoid removing
          // default-supported attributes later erroneously.
          if (!allowedAttributes[attrName]) {
            allowedAttributes[attrName] = true;
            allowedAttributesChanges.push(attrName);
          }
        };

        // Allow all attributes for AMP elements. This avoids the need to allowlist
        // nonstandard attributes for every component e.g. amp-lightbox[scrollable].
        var isAmpElement = tagName.startsWith('amp-');
        if (isAmpElement) {
          allowAttribute();
        } else {
          // `<A>` has special target rules:
          // - Default target is "_top";
          // - Allowed targets are "_blank", "_top";
          // - All other targets are rewritted to "_top".
          if (tagName == 'a' && attrName == 'target') {
            var lowercaseValue = attrValue.toLowerCase();
            if (!ALLOWLISTED_TARGETS.includes(lowercaseValue)) {
              attrValue = '_top';
            } else {
              // Always use lowercase values for `target` attr.
              attrValue = lowercaseValue;
            }
          }

          // For non-AMP elements, allow attributes in tag-specific allowlist.
          var attrsByTags = ALLOWLISTED_ATTRS_BY_TAGS[tagName];
          if (attrsByTags && attrsByTags.includes(attrName)) {
            allowAttribute();
          }
        }

        var bindingType = bindingTypeForAttr(attrName);
        // Rewrite classic bindings e.g. [foo]="bar" -> data-amp-bind-foo="bar".
        // This is because DOMPurify eagerly removes attributes and re-adds them
        // after sanitization, which fails because `[]` are not valid attr chars.
        if (bindingType === BindingType.CLASSIC) {
          var property = attrName.substring(1, attrName.length - 1);
          element.setAttribute("".concat(BIND_PREFIX).concat(property), attrValue);
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
        /* doc */_this.doc_,
        /* opt_purify */true))

        {
          if (attrRewrite && attrValue && !attrName.startsWith(BIND_PREFIX)) {
            attrValue = attrRewrite(tagName, attrName, attrValue);
          }
        } else {
          data.keepAttr = false;
          user().error(
          TAG,
          'Removed invalid attribute %s[%s="%s"].',
          tagName,
          attrName,
          attrValue);

        }

        // Update attribute value.
        data.attrValue = attrValue;
      };

      /**
       * @param {!Element} element
       * @this {{removed: !Array}} Contains list of removed elements/attrs so far.
       */
      var afterSanitizeAttributes = function afterSanitizeAttributes(element) {
        markElementForDiffing(element, function () {return String(_this.keyCounter_++);});

        // DOMPurify doesn't have a tag-specific attribute allowlist API and
        // `allowedAttributes` has a per-invocation scope, so we need to undo
        // changes after sanitizing attributes.
        allowedAttributesChanges.forEach(function (attr) {
          delete allowedAttributes[attr];
        });
        allowedAttributesChanges.length = 0;

        // Only allow relative references in <use>.
        var tagName = element.nodeName.toLowerCase();
        if (tagName === 'use') {
          ['href', 'xlink:href'].forEach(function (attr) {
            if (
            element.hasAttribute(attr) &&
            !element.getAttribute(attr).startsWith('#'))
            {
              removeElement(element);
              user().error(
              TAG,
              'Removed invalid <use>. use[href] must start with "#".');

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
     * Adds triple-mustache specific AMP hooks to given DOMPurify object.
     * @param {!DomPurifyDef} purifier
     * @private
     */ }, { key: "addPurifyHooksTripleMustache_", value:
    function addPurifyHooksTripleMustache_(purifier) {
      // Reference to DOMPurify's `allowedTags` allowlist.
      var allowedTags;

      var uponSanitizeElement = function uponSanitizeElement(node, data) {
        var tagName = data.tagName;
        allowedTags = data.allowedTags;
        if (tagName === 'template') {
          var type = node.getAttribute('type');
          if (type && type.toLowerCase() === 'amp-mustache') {
            allowedTags['template'] = true;
          }
        }
      };

      var afterSanitizeElements = function afterSanitizeElements(unusedNode) {
        // DOMPurify doesn't have an required-attribute tag allowlist API and
        // `allowedTags` has a per-invocation scope, so we need to remove
        // required-attribute tags after sanitizing each element.
        allowedTags['template'] = false;
      };

      purifier.addHook('uponSanitizeElement', uponSanitizeElement);
      purifier.addHook('afterSanitizeElements', afterSanitizeElements);
    } }]);return Purifier;}();


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
  var config = _objectSpread(_objectSpread({},
  PURIFY_PROFILES), {}, {
    ADD_ATTR: ALLOWLISTED_ATTRS,
    ADD_TAGS: ['use'],
    FORBID_TAGS: Object.keys(DENYLISTED_TAGS),
    FORCE_BODY: true,
    RETURN_DOM: true,
    ALLOW_UNKNOWN_PROTOCOLS: true });

  return (/** @type {!DomPurifyConfig} */(config));
}

/**
 * @enum {number}
 */
var BindingType = {
  NONE: 0,
  CLASSIC: 1,
  ALTERNATIVE: 2 };


/**
 * @param {string} attrName
 * @return {BindingType}
 */
function bindingTypeForAttr(attrName) {
  if (attrName[0] == '[' && attrName[attrName.length - 1] == ']') {
    return BindingType.CLASSIC;
  }
  if (attrName.startsWith(BIND_PREFIX)) {
    return BindingType.ALTERNATIVE;
  }
  return BindingType.NONE;
}
// /Users/mszylkowski/src/amphtml/src/purifier/index.js