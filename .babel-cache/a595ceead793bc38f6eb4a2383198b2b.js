function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import purify from 'dompurify';
import { devAssertElement } from "../core/assert";
import { removeElement } from "../core/dom";
import { ALLOWLISTED_ATTRS, ALLOWLISTED_ATTRS_BY_TAGS, ALLOWLISTED_TARGETS, BIND_PREFIX, DENYLISTED_TAGS, EMAIL_ALLOWLISTED_AMP_TAGS, TRIPLE_MUSTACHE_ALLOWLISTED_TAGS, isValidAttr, markElementForDiffing } from "./sanitation";
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
    'values': ['application/json', 'application/ld+json']
  }
};
var PURIFY_PROFILES =
/** @type {!DomPurifyConfig} */
{
  USE_PROFILES: {
    html: true,
    svg: true,
    svgFilters: true
  }
};

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
  function Purifier(doc, opt_config, opt_attrRewrite) {
    _classCallCheck(this, Purifier);

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
   */
  _createClass(Purifier, [{
    key: "purifyHtml",
    value: function purifyHtml(dirty) {
      var body = this.domPurify_.sanitize(dirty);
      return body;
    }
    /**
     * Uses DOMPurify to sanitize HTML with stricter policy for unescaped templates
     * e.g. triple mustache.
     *
     * @param {string} dirty
     * @return {string}
     */

  }, {
    key: "purifyTagsForTripleMustache",
    value: function purifyTagsForTripleMustache(dirty) {
      // <template> elements are parsed by the browser as document fragments and
      // reparented to the head. So to support nested templates, we need
      // RETURN_DOM_FRAGMENT to keep the <template> and FORCE_BODY to prevent
      // reparenting. See https://github.com/cure53/DOMPurify/issues/285#issuecomment-397810671
      var fragment = this.domPurifyTriple_.sanitize(dirty, {
        'ALLOWED_TAGS': TRIPLE_MUSTACHE_ALLOWLISTED_TAGS,
        'FORCE_BODY': true,
        'RETURN_DOM_FRAGMENT': true
      });
      // Serialize DocumentFragment to HTML. XMLSerializer would also work, but adds
      // namespaces for all elements and attributes.
      var div = this.doc_.createElement('div');
      div.appendChild(fragment);
      return div.
      /*OK*/
      innerHTML;
    }
    /**
     * Gets a copy of the map of allowed tag names (standard DOMPurify config).
     * @return {!Object<string, boolean>}
     */

  }, {
    key: "getAllowedTags",
    value: function getAllowedTags() {
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
     */

  }, {
    key: "validateAttributeChange",
    value: function validateAttributeChange(node, attr, value) {
      var tag = node.nodeName.toLowerCase();
      // Disallow change of attributes that are required for certain tags,
      // e.g. script[type].
      var allowlist = ALLOWLISTED_TAGS_BY_ATTRS[tag];

      if (allowlist) {
        var attribute = allowlist.attribute,
            values = allowlist.values;

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

      var doc = node.ownerDocument ? node.ownerDocument :
      /** @type {!Document} */
      node;

      // Perform AMP-specific attribute validation e.g. __amp_source_origin.
      if (value && !isValidAttr(tag, attr, value, doc,
      /* opt_purify */
      true)) {
        return false;
      }

      return true;
    }
    /**
     * Adds AMP hooks to given DOMPurify object.
     * @param {!DomPurifyDef} purifier
     * @param {!AttributeRewriterDef|undefined} attrRewrite
     * @private
     */

  }, {
    key: "addPurifyHooks_",
    value: function addPurifyHooks_(purifier, attrRewrite) {
      var _this = this;

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
          var attribute = allowlist.attribute,
              values = allowlist.values;

          var _element = devAssertElement(node);

          if (_element.hasAttribute(attribute) && values.includes(_element.getAttribute(attribute))) {
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
          element.setAttribute("" + BIND_PREFIX + property, attrValue);
        }

        if (bindingType !== BindingType.NONE) {
          // Set a custom attribute to mark this element as containing a binding.
          // This is an optimization that obviates the need for DOM scan later.
          element.setAttribute('i-amphtml-binding', '');
        }

        if (isValidAttr(tagName, attrName, attrValue,
        /* doc */
        _this.doc_,
        /* opt_purify */
        true)) {
          if (attrRewrite && attrValue && !attrName.startsWith(BIND_PREFIX)) {
            attrValue = attrRewrite(tagName, attrName, attrValue);
          }
        } else {
          data.keepAttr = false;
          user().error(TAG, 'Removed invalid attribute %s[%s="%s"].', tagName, attrName, attrValue);
        }

        // Update attribute value.
        data.attrValue = attrValue;
      };

      /**
       * @param {!Element} element
       * @this {{removed: !Array}} Contains list of removed elements/attrs so far.
       */
      var afterSanitizeAttributes = function afterSanitizeAttributes(element) {
        markElementForDiffing(element, function () {
          return String(_this.keyCounter_++);
        });
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
            if (element.hasAttribute(attr) && !element.getAttribute(attr).startsWith('#')) {
              removeElement(element);
              user().error(TAG, 'Removed invalid <use>. use[href] must start with "#".');
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
     */

  }, {
    key: "addPurifyHooksTripleMustache_",
    value: function addPurifyHooksTripleMustache_(purifier) {
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
    }
  }]);

  return Purifier;
}();

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
  var config = _extends({}, PURIFY_PROFILES, {
    ADD_ATTR: ALLOWLISTED_ATTRS,
    ADD_TAGS: ['use'],
    FORBID_TAGS: Object.keys(DENYLISTED_TAGS),
    FORCE_BODY: true,
    RETURN_DOM: true,
    ALLOW_UNKNOWN_PROTOCOLS: true
  });

  return (
    /** @type {!DomPurifyConfig} */
    config
  );
}

/**
 * @enum {number}
 */
var BindingType = {
  NONE: 0,
  CLASSIC: 1,
  ALTERNATIVE: 2
};

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInB1cmlmeSIsImRldkFzc2VydEVsZW1lbnQiLCJyZW1vdmVFbGVtZW50IiwiQUxMT1dMSVNURURfQVRUUlMiLCJBTExPV0xJU1RFRF9BVFRSU19CWV9UQUdTIiwiQUxMT1dMSVNURURfVEFSR0VUUyIsIkJJTkRfUFJFRklYIiwiREVOWUxJU1RFRF9UQUdTIiwiRU1BSUxfQUxMT1dMSVNURURfQU1QX1RBR1MiLCJUUklQTEVfTVVTVEFDSEVfQUxMT1dMSVNURURfVEFHUyIsImlzVmFsaWRBdHRyIiwibWFya0VsZW1lbnRGb3JEaWZmaW5nIiwiaXNBbXA0RW1haWwiLCJ1c2VyIiwiVEFHIiwiQUxMT1dMSVNURURfVEFHU19CWV9BVFRSUyIsIlBVUklGWV9QUk9GSUxFUyIsIlVTRV9QUk9GSUxFUyIsImh0bWwiLCJzdmciLCJzdmdGaWx0ZXJzIiwiRG9tUHVyaWZ5RGVmIiwiQXR0cmlidXRlUmV3cml0ZXJEZWYiLCJQdXJpZmllciIsImRvYyIsIm9wdF9jb25maWciLCJvcHRfYXR0clJld3JpdGUiLCJkb2NfIiwia2V5Q291bnRlcl8iLCJkb21QdXJpZnlfIiwic2VsZiIsImRvbVB1cmlmeVRyaXBsZV8iLCJjb25maWciLCJPYmplY3QiLCJhc3NpZ24iLCJzdGFuZGFyZFB1cmlmeUNvbmZpZyIsInNldENvbmZpZyIsImFkZFB1cmlmeUhvb2tzXyIsImFkZFB1cmlmeUhvb2tzVHJpcGxlTXVzdGFjaGVfIiwiZGlydHkiLCJib2R5Iiwic2FuaXRpemUiLCJmcmFnbWVudCIsImRpdiIsImNyZWF0ZUVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsImlubmVySFRNTCIsImFsbG93ZWRUYWdzIiwiYWRkSG9vayIsIm5vZGUiLCJkYXRhIiwicCIsImtleXMiLCJmb3JFYWNoIiwidGFnIiwicmVtb3ZlSG9vayIsImF0dHIiLCJ2YWx1ZSIsIm5vZGVOYW1lIiwidG9Mb3dlckNhc2UiLCJhbGxvd2xpc3QiLCJhdHRyaWJ1dGUiLCJ2YWx1ZXMiLCJpbmNsdWRlcyIsImJpbmRpbmdUeXBlRm9yQXR0ciIsIkJpbmRpbmdUeXBlIiwiTk9ORSIsInB1cmUiLCJpc1ZhbGlkQXR0cmlidXRlIiwiYXR0cnNCeVRhZ3MiLCJhbGxvd2xpc3RlZEZvclRhZyIsInN0YXJ0c1dpdGgiLCJvd25lckRvY3VtZW50IiwicHVyaWZpZXIiLCJhdHRyUmV3cml0ZSIsImlzRW1haWwiLCJhbGxvd2VkVGFnc0NoYW5nZXMiLCJhbGxvd2VkQXR0cmlidXRlcyIsImFsbG93ZWRBdHRyaWJ1dGVzQ2hhbmdlcyIsInVwb25TYW5pdGl6ZUVsZW1lbnQiLCJ0YWdOYW1lIiwiZWxlbWVudCIsImhhc0F0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInB1c2giLCJhZnRlclNhbml0aXplRWxlbWVudHMiLCJ1bnVzZWROb2RlIiwibGVuZ3RoIiwidXBvblNhbml0aXplQXR0cmlidXRlIiwiYXR0ck5hbWUiLCJhdHRyVmFsdWUiLCJhbGxvd0F0dHJpYnV0ZSIsImlzQW1wRWxlbWVudCIsImxvd2VyY2FzZVZhbHVlIiwiYmluZGluZ1R5cGUiLCJDTEFTU0lDIiwicHJvcGVydHkiLCJzdWJzdHJpbmciLCJrZWVwQXR0ciIsImVycm9yIiwiYWZ0ZXJTYW5pdGl6ZUF0dHJpYnV0ZXMiLCJTdHJpbmciLCJ0eXBlIiwiQUREX0FUVFIiLCJBRERfVEFHUyIsIkZPUkJJRF9UQUdTIiwiRk9SQ0VfQk9EWSIsIlJFVFVSTl9ET00iLCJBTExPV19VTktOT1dOX1BST1RPQ09MUyIsIkFMVEVSTkFUSVZFIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE9BQU9BLE1BQVAsTUFBbUIsV0FBbkI7QUFFQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLGFBQVI7QUFFQSxTQUNFQyxpQkFERixFQUVFQyx5QkFGRixFQUdFQyxtQkFIRixFQUlFQyxXQUpGLEVBS0VDLGVBTEYsRUFNRUMsMEJBTkYsRUFPRUMsZ0NBUEYsRUFRRUMsV0FSRixFQVNFQyxxQkFURjtBQVlBLFNBQVFDLFdBQVI7QUFDQSxTQUFRQyxJQUFSOztBQUVBO0FBQ0EsSUFBTUMsR0FBRyxHQUFHLFVBQVo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyx5QkFBeUIsR0FBRztBQUNoQyxZQUFVO0FBQ1IsaUJBQWEsTUFETDtBQUVSLGNBQVUsQ0FBQyxrQkFBRCxFQUFxQixxQkFBckI7QUFGRjtBQURzQixDQUFsQztBQU9BLElBQU1DLGVBQWU7QUFBRztBQUFpQztBQUN2REMsRUFBQUEsWUFBWSxFQUFFO0FBQ1pDLElBQUFBLElBQUksRUFBRSxJQURNO0FBRVpDLElBQUFBLEdBQUcsRUFBRSxJQUZPO0FBR1pDLElBQUFBLFVBQVUsRUFBRTtBQUhBO0FBRHlDLENBQXpEOztBQVFBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLFlBQUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxvQkFBSjtBQUVQLFdBQWFDLFFBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0Usb0JBQVlDLEdBQVosRUFBaUJDLFVBQWpCLEVBQTZCQyxlQUE3QixFQUE4QztBQUFBOztBQUM1QztBQUNBLFNBQUtDLElBQUwsR0FBWUgsR0FBWjs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNJLFNBQUtJLFdBQUwsR0FBbUIsQ0FBbkI7O0FBRUE7QUFDQSxTQUFLQyxVQUFMLEdBQWtCN0IsTUFBTSxDQUFDOEIsSUFBRCxDQUF4Qjs7QUFFQTtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCL0IsTUFBTSxDQUFDOEIsSUFBRCxDQUE5QjtBQUVBLFFBQU1FLE1BQU0sR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWNULFVBQVUsSUFBSSxFQUE1QixFQUFnQ1Usb0JBQW9CLEVBQXBELENBQWY7QUFDQSxTQUFLTixVQUFMLENBQWdCTyxTQUFoQixDQUEwQkosTUFBMUI7QUFDQSxTQUFLSyxlQUFMLENBQXFCLEtBQUtSLFVBQTFCLEVBQXNDSCxlQUF0QztBQUVBLFNBQUtZLDZCQUFMLENBQW1DLEtBQUtQLGdCQUF4QztBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWxDQTtBQUFBO0FBQUEsV0FtQ0Usb0JBQVdRLEtBQVgsRUFBa0I7QUFDaEIsVUFBTUMsSUFBSSxHQUFHLEtBQUtYLFVBQUwsQ0FBZ0JZLFFBQWhCLENBQXlCRixLQUF6QixDQUFiO0FBQ0EsYUFBT0MsSUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBOUNBO0FBQUE7QUFBQSxXQStDRSxxQ0FBNEJELEtBQTVCLEVBQW1DO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBTUcsUUFBUSxHQUFHLEtBQUtYLGdCQUFMLENBQXNCVSxRQUF0QixDQUErQkYsS0FBL0IsRUFBc0M7QUFDckQsd0JBQWdCOUIsZ0NBRHFDO0FBRXJELHNCQUFjLElBRnVDO0FBR3JELCtCQUF1QjtBQUg4QixPQUF0QyxDQUFqQjtBQUtBO0FBQ0E7QUFDQSxVQUFNa0MsR0FBRyxHQUFHLEtBQUtoQixJQUFMLENBQVVpQixhQUFWLENBQXdCLEtBQXhCLENBQVo7QUFDQUQsTUFBQUEsR0FBRyxDQUFDRSxXQUFKLENBQWdCSCxRQUFoQjtBQUNBLGFBQU9DLEdBQUc7QUFBQztBQUFPRyxNQUFBQSxTQUFsQjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBbkVBO0FBQUE7QUFBQSxXQW9FRSwwQkFBaUI7QUFDZixVQUFNQyxXQUFXLEdBQUcsRUFBcEI7QUFDQTtBQUNBLFdBQUtsQixVQUFMLENBQWdCbUIsT0FBaEIsQ0FBd0IscUJBQXhCLEVBQStDLFVBQUNDLElBQUQsRUFBT0MsSUFBUCxFQUFnQjtBQUM3RGpCLFFBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjYSxXQUFkLEVBQTJCRyxJQUFJLENBQUNILFdBQWhDO0FBQ0QsT0FGRDtBQUdBO0FBQ0EsVUFBTUksQ0FBQyxHQUFHLEtBQUt4QixJQUFMLENBQVVpQixhQUFWLENBQXdCLEdBQXhCLENBQVY7QUFDQSxXQUFLZixVQUFMLENBQWdCWSxRQUFoQixDQUF5QlUsQ0FBekI7QUFDQWxCLE1BQUFBLE1BQU0sQ0FBQ21CLElBQVAsQ0FBWTdDLGVBQVosRUFBNkI4QyxPQUE3QixDQUFxQyxVQUFDQyxHQUFELEVBQVM7QUFDNUNQLFFBQUFBLFdBQVcsQ0FBQ08sR0FBRCxDQUFYLEdBQW1CLEtBQW5CO0FBQ0QsT0FGRDtBQUdBO0FBQ0EsV0FBS3pCLFVBQUwsQ0FBZ0IwQixVQUFoQixDQUEyQixxQkFBM0I7QUFDQSxhQUFPUixXQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQS9GQTtBQUFBO0FBQUEsV0FnR0UsaUNBQXdCRSxJQUF4QixFQUE4Qk8sSUFBOUIsRUFBb0NDLEtBQXBDLEVBQTJDO0FBQ3pDLFVBQU1ILEdBQUcsR0FBR0wsSUFBSSxDQUFDUyxRQUFMLENBQWNDLFdBQWQsRUFBWjtBQUNBO0FBQ0E7QUFDQSxVQUFNQyxTQUFTLEdBQUc3Qyx5QkFBeUIsQ0FBQ3VDLEdBQUQsQ0FBM0M7O0FBQ0EsVUFBSU0sU0FBSixFQUFlO0FBQ2IsWUFBT0MsU0FBUCxHQUE0QkQsU0FBNUIsQ0FBT0MsU0FBUDtBQUFBLFlBQWtCQyxNQUFsQixHQUE0QkYsU0FBNUIsQ0FBa0JFLE1BQWxCOztBQUNBLFlBQUlELFNBQVMsS0FBS0wsSUFBbEIsRUFBd0I7QUFDdEIsY0FBSUMsS0FBSyxJQUFJLElBQVQsSUFBaUIsQ0FBQ0ssTUFBTSxDQUFDQyxRQUFQLENBQWdCTixLQUFoQixDQUF0QixFQUE4QztBQUM1QyxtQkFBTyxLQUFQO0FBQ0Q7QUFDRjtBQUNGOztBQUNEO0FBQ0EsVUFBSUgsR0FBRyxLQUFLLEdBQVIsSUFBZUUsSUFBSSxLQUFLLFFBQTVCLEVBQXNDO0FBQ3BDLFlBQUlDLEtBQUssSUFBSSxJQUFULElBQWlCLENBQUNwRCxtQkFBbUIsQ0FBQzBELFFBQXBCLENBQTZCTixLQUE3QixDQUF0QixFQUEyRDtBQUN6RCxpQkFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFDRDtBQUNBO0FBQ0EsVUFBSUEsS0FBSyxJQUFJLElBQWIsRUFBbUI7QUFDakIsZUFBTyxJQUFQO0FBQ0Q7O0FBQ0Q7QUFDQSxVQUFJTyxrQkFBa0IsQ0FBQ1IsSUFBRCxDQUFsQixLQUE2QlMsV0FBVyxDQUFDQyxJQUE3QyxFQUFtRDtBQUNqRCxlQUFPLEtBQVA7QUFDRDs7QUFDRCxVQUFNQyxJQUFJLEdBQUcsS0FBS3RDLFVBQUwsQ0FBZ0J1QyxnQkFBaEIsQ0FBaUNkLEdBQWpDLEVBQXNDRSxJQUF0QyxFQUE0Q0MsS0FBNUMsQ0FBYjs7QUFDQSxVQUFJLENBQUNVLElBQUwsRUFBVztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFNRSxXQUFXLEdBQUdqRSx5QkFBeUIsQ0FBQ2tELEdBQUQsQ0FBN0M7QUFDQSxZQUFNZ0IsaUJBQWlCLEdBQUdELFdBQVcsSUFBSUEsV0FBVyxDQUFDTixRQUFaLENBQXFCUCxJQUFyQixDQUF6Qzs7QUFDQSxZQUFJLENBQUNjLGlCQUFELElBQXNCLENBQUNoQixHQUFHLENBQUNpQixVQUFKLENBQWUsTUFBZixDQUEzQixFQUFtRDtBQUNqRCxpQkFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFDRCxVQUFNL0MsR0FBRyxHQUFHeUIsSUFBSSxDQUFDdUIsYUFBTCxHQUNSdkIsSUFBSSxDQUFDdUIsYUFERztBQUVSO0FBQTBCdkIsTUFBQUEsSUFGOUI7O0FBR0E7QUFDQSxVQUFJUSxLQUFLLElBQUksQ0FBQy9DLFdBQVcsQ0FBQzRDLEdBQUQsRUFBTUUsSUFBTixFQUFZQyxLQUFaLEVBQW1CakMsR0FBbkI7QUFBd0I7QUFBaUIsVUFBekMsQ0FBekIsRUFBeUU7QUFDdkUsZUFBTyxLQUFQO0FBQ0Q7O0FBQ0QsYUFBTyxJQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBM0pBO0FBQUE7QUFBQSxXQTRKRSx5QkFBZ0JpRCxRQUFoQixFQUEwQkMsV0FBMUIsRUFBdUM7QUFBQTs7QUFDckMsVUFBTUMsT0FBTyxHQUFHL0QsV0FBVyxDQUFDLEtBQUtlLElBQU4sQ0FBM0I7QUFFQTtBQUNBLFVBQUlvQixXQUFKO0FBQ0EsVUFBTTZCLGtCQUFrQixHQUFHLEVBQTNCO0FBRUE7QUFDQSxVQUFJQyxpQkFBSjtBQUNBLFVBQU1DLHdCQUF3QixHQUFHLEVBQWpDOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0ksVUFBTUMsbUJBQW1CLEdBQUcsU0FBdEJBLG1CQUFzQixDQUFDOUIsSUFBRCxFQUFPQyxJQUFQLEVBQWdCO0FBQzFDLFlBQU84QixPQUFQLEdBQWtCOUIsSUFBbEIsQ0FBTzhCLE9BQVA7QUFDQWpDLFFBQUFBLFdBQVcsR0FBR0csSUFBSSxDQUFDSCxXQUFuQjs7QUFFQTtBQUNBLFlBQUlpQyxPQUFPLENBQUNULFVBQVIsQ0FBbUIsTUFBbkIsQ0FBSixFQUFnQztBQUM5QjtBQUNBeEIsVUFBQUEsV0FBVyxDQUFDaUMsT0FBRCxDQUFYLEdBQXVCLENBQUNMLE9BQUQsSUFBWW5FLDBCQUEwQixDQUFDd0UsT0FBRCxDQUE3RDtBQUNEOztBQUNEO0FBQ0EsWUFBSUEsT0FBTyxLQUFLLEdBQWhCLEVBQXFCO0FBQ25CLGNBQU1DLE9BQU8sR0FBR2hGLGdCQUFnQixDQUFDZ0QsSUFBRCxDQUFoQzs7QUFDQSxjQUFJZ0MsT0FBTyxDQUFDQyxZQUFSLENBQXFCLE1BQXJCLEtBQWdDLENBQUNELE9BQU8sQ0FBQ0MsWUFBUixDQUFxQixRQUFyQixDQUFyQyxFQUFxRTtBQUNuRUQsWUFBQUEsT0FBTyxDQUFDRSxZQUFSLENBQXFCLFFBQXJCLEVBQStCLE1BQS9CO0FBQ0Q7QUFDRjs7QUFDRDtBQUNBLFlBQU12QixTQUFTLEdBQUc3Qyx5QkFBeUIsQ0FBQ2lFLE9BQUQsQ0FBM0M7O0FBQ0EsWUFBSXBCLFNBQUosRUFBZTtBQUNiLGNBQU9DLFNBQVAsR0FBNEJELFNBQTVCLENBQU9DLFNBQVA7QUFBQSxjQUFrQkMsTUFBbEIsR0FBNEJGLFNBQTVCLENBQWtCRSxNQUFsQjs7QUFDQSxjQUFNbUIsUUFBTyxHQUFHaEYsZ0JBQWdCLENBQUNnRCxJQUFELENBQWhDOztBQUNBLGNBQ0VnQyxRQUFPLENBQUNDLFlBQVIsQ0FBcUJyQixTQUFyQixLQUNBQyxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JrQixRQUFPLENBQUNHLFlBQVIsQ0FBcUJ2QixTQUFyQixDQUFoQixDQUZGLEVBR0U7QUFDQWQsWUFBQUEsV0FBVyxDQUFDaUMsT0FBRCxDQUFYLEdBQXVCLElBQXZCO0FBQ0FKLFlBQUFBLGtCQUFrQixDQUFDUyxJQUFuQixDQUF3QkwsT0FBeEI7QUFDRDtBQUNGO0FBQ0YsT0E3QkQ7O0FBK0JBO0FBQ0o7QUFDQTtBQUNJLFVBQU1NLHFCQUFxQixHQUFHLFNBQXhCQSxxQkFBd0IsQ0FBQ0MsVUFBRCxFQUFnQjtBQUM1QztBQUNBO0FBQ0E7QUFDQVgsUUFBQUEsa0JBQWtCLENBQUN2QixPQUFuQixDQUEyQixVQUFDQyxHQUFELEVBQVM7QUFDbEMsaUJBQU9QLFdBQVcsQ0FBQ08sR0FBRCxDQUFsQjtBQUNELFNBRkQ7QUFHQXNCLFFBQUFBLGtCQUFrQixDQUFDWSxNQUFuQixHQUE0QixDQUE1QjtBQUNELE9BUkQ7O0FBVUE7QUFDSjtBQUNBO0FBQ0E7QUFDSSxVQUFNQyxxQkFBcUIsR0FBRyxTQUF4QkEscUJBQXdCLENBQUNSLE9BQUQsRUFBVS9CLElBQVYsRUFBbUI7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFlBQU04QixPQUFPLEdBQUdDLE9BQU8sQ0FBQ3ZCLFFBQVIsQ0FBaUJDLFdBQWpCLEVBQWhCO0FBQ0EsWUFBTytCLFFBQVAsR0FBbUJ4QyxJQUFuQixDQUFPd0MsUUFBUDtBQUNBLFlBQUtDLFNBQUwsR0FBa0J6QyxJQUFsQixDQUFLeUMsU0FBTDtBQUNBZCxRQUFBQSxpQkFBaUIsR0FBRzNCLElBQUksQ0FBQzJCLGlCQUF6Qjs7QUFFQSxZQUFNZSxjQUFjLEdBQUcsU0FBakJBLGNBQWlCLEdBQU07QUFDM0I7QUFDQTtBQUNBLGNBQUksQ0FBQ2YsaUJBQWlCLENBQUNhLFFBQUQsQ0FBdEIsRUFBa0M7QUFDaENiLFlBQUFBLGlCQUFpQixDQUFDYSxRQUFELENBQWpCLEdBQThCLElBQTlCO0FBQ0FaLFlBQUFBLHdCQUF3QixDQUFDTyxJQUF6QixDQUE4QkssUUFBOUI7QUFDRDtBQUNGLFNBUEQ7O0FBU0E7QUFDQTtBQUNBLFlBQU1HLFlBQVksR0FBR2IsT0FBTyxDQUFDVCxVQUFSLENBQW1CLE1BQW5CLENBQXJCOztBQUNBLFlBQUlzQixZQUFKLEVBQWtCO0FBQ2hCRCxVQUFBQSxjQUFjO0FBQ2YsU0FGRCxNQUVPO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFJWixPQUFPLElBQUksR0FBWCxJQUFrQlUsUUFBUSxJQUFJLFFBQWxDLEVBQTRDO0FBQzFDLGdCQUFNSSxjQUFjLEdBQUdILFNBQVMsQ0FBQ2hDLFdBQVYsRUFBdkI7O0FBQ0EsZ0JBQUksQ0FBQ3RELG1CQUFtQixDQUFDMEQsUUFBcEIsQ0FBNkIrQixjQUE3QixDQUFMLEVBQW1EO0FBQ2pESCxjQUFBQSxTQUFTLEdBQUcsTUFBWjtBQUNELGFBRkQsTUFFTztBQUNMO0FBQ0FBLGNBQUFBLFNBQVMsR0FBR0csY0FBWjtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxjQUFNekIsV0FBVyxHQUFHakUseUJBQXlCLENBQUM0RSxPQUFELENBQTdDOztBQUNBLGNBQUlYLFdBQVcsSUFBSUEsV0FBVyxDQUFDTixRQUFaLENBQXFCMkIsUUFBckIsQ0FBbkIsRUFBbUQ7QUFDakRFLFlBQUFBLGNBQWM7QUFDZjtBQUNGOztBQUVELFlBQU1HLFdBQVcsR0FBRy9CLGtCQUFrQixDQUFDMEIsUUFBRCxDQUF0Qzs7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFJSyxXQUFXLEtBQUs5QixXQUFXLENBQUMrQixPQUFoQyxFQUF5QztBQUN2QyxjQUFNQyxRQUFRLEdBQUdQLFFBQVEsQ0FBQ1EsU0FBVCxDQUFtQixDQUFuQixFQUFzQlIsUUFBUSxDQUFDRixNQUFULEdBQWtCLENBQXhDLENBQWpCO0FBQ0FQLFVBQUFBLE9BQU8sQ0FBQ0UsWUFBUixNQUF3QjdFLFdBQXhCLEdBQXNDMkYsUUFBdEMsRUFBa0ROLFNBQWxEO0FBQ0Q7O0FBQ0QsWUFBSUksV0FBVyxLQUFLOUIsV0FBVyxDQUFDQyxJQUFoQyxFQUFzQztBQUNwQztBQUNBO0FBQ0FlLFVBQUFBLE9BQU8sQ0FBQ0UsWUFBUixDQUFxQixtQkFBckIsRUFBMEMsRUFBMUM7QUFDRDs7QUFFRCxZQUNFekUsV0FBVyxDQUNUc0UsT0FEUyxFQUVUVSxRQUZTLEVBR1RDLFNBSFM7QUFJVDtBQUFVLFFBQUEsS0FBSSxDQUFDaEUsSUFKTjtBQUtUO0FBQWlCLFlBTFIsQ0FEYixFQVFFO0FBQ0EsY0FBSStDLFdBQVcsSUFBSWlCLFNBQWYsSUFBNEIsQ0FBQ0QsUUFBUSxDQUFDbkIsVUFBVCxDQUFvQmpFLFdBQXBCLENBQWpDLEVBQW1FO0FBQ2pFcUYsWUFBQUEsU0FBUyxHQUFHakIsV0FBVyxDQUFDTSxPQUFELEVBQVVVLFFBQVYsRUFBb0JDLFNBQXBCLENBQXZCO0FBQ0Q7QUFDRixTQVpELE1BWU87QUFDTHpDLFVBQUFBLElBQUksQ0FBQ2lELFFBQUwsR0FBZ0IsS0FBaEI7QUFDQXRGLFVBQUFBLElBQUksR0FBR3VGLEtBQVAsQ0FDRXRGLEdBREYsRUFFRSx3Q0FGRixFQUdFa0UsT0FIRixFQUlFVSxRQUpGLEVBS0VDLFNBTEY7QUFPRDs7QUFFRDtBQUNBekMsUUFBQUEsSUFBSSxDQUFDeUMsU0FBTCxHQUFpQkEsU0FBakI7QUFDRCxPQXZGRDs7QUF5RkE7QUFDSjtBQUNBO0FBQ0E7QUFDSSxVQUFNVSx1QkFBdUIsR0FBRyxTQUExQkEsdUJBQTBCLENBQUNwQixPQUFELEVBQWE7QUFDM0N0RSxRQUFBQSxxQkFBcUIsQ0FBQ3NFLE9BQUQsRUFBVTtBQUFBLGlCQUFNcUIsTUFBTSxDQUFDLEtBQUksQ0FBQzFFLFdBQUwsRUFBRCxDQUFaO0FBQUEsU0FBVixDQUFyQjtBQUVBO0FBQ0E7QUFDQTtBQUNBa0QsUUFBQUEsd0JBQXdCLENBQUN6QixPQUF6QixDQUFpQyxVQUFDRyxJQUFELEVBQVU7QUFDekMsaUJBQU9xQixpQkFBaUIsQ0FBQ3JCLElBQUQsQ0FBeEI7QUFDRCxTQUZEO0FBR0FzQixRQUFBQSx3QkFBd0IsQ0FBQ1UsTUFBekIsR0FBa0MsQ0FBbEM7QUFFQTtBQUNBLFlBQU1SLE9BQU8sR0FBR0MsT0FBTyxDQUFDdkIsUUFBUixDQUFpQkMsV0FBakIsRUFBaEI7O0FBQ0EsWUFBSXFCLE9BQU8sS0FBSyxLQUFoQixFQUF1QjtBQUNyQixXQUFDLE1BQUQsRUFBUyxZQUFULEVBQXVCM0IsT0FBdkIsQ0FBK0IsVUFBQ0csSUFBRCxFQUFVO0FBQ3ZDLGdCQUNFeUIsT0FBTyxDQUFDQyxZQUFSLENBQXFCMUIsSUFBckIsS0FDQSxDQUFDeUIsT0FBTyxDQUFDRyxZQUFSLENBQXFCNUIsSUFBckIsRUFBMkJlLFVBQTNCLENBQXNDLEdBQXRDLENBRkgsRUFHRTtBQUNBckUsY0FBQUEsYUFBYSxDQUFDK0UsT0FBRCxDQUFiO0FBQ0FwRSxjQUFBQSxJQUFJLEdBQUd1RixLQUFQLENBQ0V0RixHQURGLEVBRUUsdURBRkY7QUFJRDtBQUNGLFdBWEQ7QUFZRDtBQUNGLE9BM0JEOztBQTZCQTJELE1BQUFBLFFBQVEsQ0FBQ3pCLE9BQVQsQ0FBaUIscUJBQWpCLEVBQXdDK0IsbUJBQXhDO0FBQ0FOLE1BQUFBLFFBQVEsQ0FBQ3pCLE9BQVQsQ0FBaUIsdUJBQWpCLEVBQTBDc0MscUJBQTFDO0FBQ0FiLE1BQUFBLFFBQVEsQ0FBQ3pCLE9BQVQsQ0FBaUIsdUJBQWpCLEVBQTBDeUMscUJBQTFDO0FBQ0FoQixNQUFBQSxRQUFRLENBQUN6QixPQUFULENBQWlCLHlCQUFqQixFQUE0Q3FELHVCQUE1QztBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUEvVkE7QUFBQTtBQUFBLFdBZ1dFLHVDQUE4QjVCLFFBQTlCLEVBQXdDO0FBQ3RDO0FBQ0EsVUFBSTFCLFdBQUo7O0FBRUEsVUFBTWdDLG1CQUFtQixHQUFHLFNBQXRCQSxtQkFBc0IsQ0FBQzlCLElBQUQsRUFBT0MsSUFBUCxFQUFnQjtBQUMxQyxZQUFPOEIsT0FBUCxHQUFrQjlCLElBQWxCLENBQU84QixPQUFQO0FBQ0FqQyxRQUFBQSxXQUFXLEdBQUdHLElBQUksQ0FBQ0gsV0FBbkI7O0FBQ0EsWUFBSWlDLE9BQU8sS0FBSyxVQUFoQixFQUE0QjtBQUMxQixjQUFNdUIsSUFBSSxHQUFHdEQsSUFBSSxDQUFDbUMsWUFBTCxDQUFrQixNQUFsQixDQUFiOztBQUNBLGNBQUltQixJQUFJLElBQUlBLElBQUksQ0FBQzVDLFdBQUwsT0FBdUIsY0FBbkMsRUFBbUQ7QUFDakRaLFlBQUFBLFdBQVcsQ0FBQyxVQUFELENBQVgsR0FBMEIsSUFBMUI7QUFDRDtBQUNGO0FBQ0YsT0FURDs7QUFXQSxVQUFNdUMscUJBQXFCLEdBQUcsU0FBeEJBLHFCQUF3QixDQUFDQyxVQUFELEVBQWdCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBeEMsUUFBQUEsV0FBVyxDQUFDLFVBQUQsQ0FBWCxHQUEwQixLQUExQjtBQUNELE9BTEQ7O0FBT0EwQixNQUFBQSxRQUFRLENBQUN6QixPQUFULENBQWlCLHFCQUFqQixFQUF3QytCLG1CQUF4QztBQUNBTixNQUFBQSxRQUFRLENBQUN6QixPQUFULENBQWlCLHVCQUFqQixFQUEwQ3NDLHFCQUExQztBQUNEO0FBeFhIOztBQUFBO0FBQUE7O0FBMlhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTbkQsb0JBQVQsR0FBZ0M7QUFDOUIsTUFBTUgsTUFBTSxnQkFDUGhCLGVBRE87QUFFVndGLElBQUFBLFFBQVEsRUFBRXJHLGlCQUZBO0FBR1ZzRyxJQUFBQSxRQUFRLEVBQUUsQ0FBQyxLQUFELENBSEE7QUFJVkMsSUFBQUEsV0FBVyxFQUFFekUsTUFBTSxDQUFDbUIsSUFBUCxDQUFZN0MsZUFBWixDQUpIO0FBS1ZvRyxJQUFBQSxVQUFVLEVBQUUsSUFMRjtBQU1WQyxJQUFBQSxVQUFVLEVBQUUsSUFORjtBQU9WQyxJQUFBQSx1QkFBdUIsRUFBRTtBQVBmLElBQVo7O0FBU0E7QUFBTztBQUFpQzdFLElBQUFBO0FBQXhDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsSUFBTWlDLFdBQVcsR0FBRztBQUNsQkMsRUFBQUEsSUFBSSxFQUFFLENBRFk7QUFFbEI4QixFQUFBQSxPQUFPLEVBQUUsQ0FGUztBQUdsQmMsRUFBQUEsV0FBVyxFQUFFO0FBSEssQ0FBcEI7O0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOUMsa0JBQVQsQ0FBNEIwQixRQUE1QixFQUFzQztBQUNwQyxNQUFJQSxRQUFRLENBQUMsQ0FBRCxDQUFSLElBQWUsR0FBZixJQUFzQkEsUUFBUSxDQUFDQSxRQUFRLENBQUNGLE1BQVQsR0FBa0IsQ0FBbkIsQ0FBUixJQUFpQyxHQUEzRCxFQUFnRTtBQUM5RCxXQUFPdkIsV0FBVyxDQUFDK0IsT0FBbkI7QUFDRDs7QUFDRCxNQUFJTixRQUFRLENBQUNuQixVQUFULENBQW9CakUsV0FBcEIsQ0FBSixFQUFzQztBQUNwQyxXQUFPMkQsV0FBVyxDQUFDNkMsV0FBbkI7QUFDRDs7QUFDRCxTQUFPN0MsV0FBVyxDQUFDQyxJQUFuQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCBwdXJpZnkgZnJvbSAnZG9tcHVyaWZ5JztcblxuaW1wb3J0IHtkZXZBc3NlcnRFbGVtZW50fSBmcm9tICcjY29yZS9hc3NlcnQnO1xuaW1wb3J0IHtyZW1vdmVFbGVtZW50fSBmcm9tICcjY29yZS9kb20nO1xuXG5pbXBvcnQge1xuICBBTExPV0xJU1RFRF9BVFRSUyxcbiAgQUxMT1dMSVNURURfQVRUUlNfQllfVEFHUyxcbiAgQUxMT1dMSVNURURfVEFSR0VUUyxcbiAgQklORF9QUkVGSVgsXG4gIERFTllMSVNURURfVEFHUyxcbiAgRU1BSUxfQUxMT1dMSVNURURfQU1QX1RBR1MsXG4gIFRSSVBMRV9NVVNUQUNIRV9BTExPV0xJU1RFRF9UQUdTLFxuICBpc1ZhbGlkQXR0cixcbiAgbWFya0VsZW1lbnRGb3JEaWZmaW5nLFxufSBmcm9tICcuL3Nhbml0YXRpb24nO1xuXG5pbXBvcnQge2lzQW1wNEVtYWlsfSBmcm9tICcuLi9mb3JtYXQnO1xuaW1wb3J0IHt1c2VyfSBmcm9tICcuLi9sb2cnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAncHVyaWZpZXInO1xuXG4vKipcbiAqIFRhZ3MgdGhhdCBhcmUgb25seSBhbGxvd2xpc3RlZCBmb3Igc3BlY2lmaWMgdmFsdWVzIG9mIGdpdmVuIGF0dHJpYnV0ZXMuXG4gKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCB7YXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlczogIUFycmF5PHN0cmluZz59Pn1cbiAqL1xuY29uc3QgQUxMT1dMSVNURURfVEFHU19CWV9BVFRSUyA9IHtcbiAgJ3NjcmlwdCc6IHtcbiAgICAnYXR0cmlidXRlJzogJ3R5cGUnLFxuICAgICd2YWx1ZXMnOiBbJ2FwcGxpY2F0aW9uL2pzb24nLCAnYXBwbGljYXRpb24vbGQranNvbiddLFxuICB9LFxufTtcblxuY29uc3QgUFVSSUZZX1BST0ZJTEVTID0gLyoqIEB0eXBlIHshRG9tUHVyaWZ5Q29uZmlnfSAqLyAoe1xuICBVU0VfUFJPRklMRVM6IHtcbiAgICBodG1sOiB0cnVlLFxuICAgIHN2ZzogdHJ1ZSxcbiAgICBzdmdGaWx0ZXJzOiB0cnVlLFxuICB9LFxufSk7XG5cbi8qKlxuICogQHR5cGVkZWYge3thZGRIb29rOiAhRnVuY3Rpb24sIHJlbW92ZUFsbEhvb2tzOiAhRnVuY3Rpb24sIHNhbml0aXplOiAhRnVuY3Rpb259fVxuICovXG5sZXQgRG9tUHVyaWZ5RGVmO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtmdW5jdGlvbihzdHJpbmcsIHN0cmluZywgc3RyaW5nKTogc3RyaW5nfVxuICovXG5leHBvcnQgbGV0IEF0dHJpYnV0ZVJld3JpdGVyRGVmO1xuXG5leHBvcnQgY2xhc3MgUHVyaWZpZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY1xuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0PX0gb3B0X2NvbmZpZ1xuICAgKiBAcGFyYW0geyFBdHRyaWJ1dGVSZXdyaXRlckRlZj19IG9wdF9hdHRyUmV3cml0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoZG9jLCBvcHRfY29uZmlnLCBvcHRfYXR0clJld3JpdGUpIHtcbiAgICAvKiogQHByaXZhdGUgeyFEb2N1bWVudH0gKi9cbiAgICB0aGlzLmRvY18gPSBkb2M7XG5cbiAgICAvKipcbiAgICAgKiBNb25vdG9uaWNhbGx5IGluY3JlYXNpbmcgY291bnRlciB1c2VkIGZvciBrZXlpbmcgbm9kZXMuXG4gICAgICogQHByaXZhdGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmtleUNvdW50ZXJfID0gMTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IURvbVB1cmlmeURlZn0gKi9cbiAgICB0aGlzLmRvbVB1cmlmeV8gPSBwdXJpZnkoc2VsZik7XG5cbiAgICAvKiogQHByaXZhdGUgeyFEb21QdXJpZnlEZWZ9ICovXG4gICAgdGhpcy5kb21QdXJpZnlUcmlwbGVfID0gcHVyaWZ5KHNlbGYpO1xuXG4gICAgY29uc3QgY29uZmlnID0gT2JqZWN0LmFzc2lnbihvcHRfY29uZmlnIHx8IHt9LCBzdGFuZGFyZFB1cmlmeUNvbmZpZygpKTtcbiAgICB0aGlzLmRvbVB1cmlmeV8uc2V0Q29uZmlnKGNvbmZpZyk7XG4gICAgdGhpcy5hZGRQdXJpZnlIb29rc18odGhpcy5kb21QdXJpZnlfLCBvcHRfYXR0clJld3JpdGUpO1xuXG4gICAgdGhpcy5hZGRQdXJpZnlIb29rc1RyaXBsZU11c3RhY2hlXyh0aGlzLmRvbVB1cmlmeVRyaXBsZV8pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSA8Ym9keT4gZWxlbWVudCBjb250YWluaW5nIHRoZSBzYW5pdGl6ZWQgYGRpcnR5YCBtYXJrdXAuXG4gICAqIFVzZXMgdGhlIHN0YW5kYXJkIERPTVB1cmlmeSBjb25maWcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJ0eVxuICAgKiBAcmV0dXJuIHshTm9kZX1cbiAgICovXG4gIHB1cmlmeUh0bWwoZGlydHkpIHtcbiAgICBjb25zdCBib2R5ID0gdGhpcy5kb21QdXJpZnlfLnNhbml0aXplKGRpcnR5KTtcbiAgICByZXR1cm4gYm9keTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VzIERPTVB1cmlmeSB0byBzYW5pdGl6ZSBIVE1MIHdpdGggc3RyaWN0ZXIgcG9saWN5IGZvciB1bmVzY2FwZWQgdGVtcGxhdGVzXG4gICAqIGUuZy4gdHJpcGxlIG11c3RhY2hlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGlydHlcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgcHVyaWZ5VGFnc0ZvclRyaXBsZU11c3RhY2hlKGRpcnR5KSB7XG4gICAgLy8gPHRlbXBsYXRlPiBlbGVtZW50cyBhcmUgcGFyc2VkIGJ5IHRoZSBicm93c2VyIGFzIGRvY3VtZW50IGZyYWdtZW50cyBhbmRcbiAgICAvLyByZXBhcmVudGVkIHRvIHRoZSBoZWFkLiBTbyB0byBzdXBwb3J0IG5lc3RlZCB0ZW1wbGF0ZXMsIHdlIG5lZWRcbiAgICAvLyBSRVRVUk5fRE9NX0ZSQUdNRU5UIHRvIGtlZXAgdGhlIDx0ZW1wbGF0ZT4gYW5kIEZPUkNFX0JPRFkgdG8gcHJldmVudFxuICAgIC8vIHJlcGFyZW50aW5nLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2N1cmU1My9ET01QdXJpZnkvaXNzdWVzLzI4NSNpc3N1ZWNvbW1lbnQtMzk3ODEwNjcxXG4gICAgY29uc3QgZnJhZ21lbnQgPSB0aGlzLmRvbVB1cmlmeVRyaXBsZV8uc2FuaXRpemUoZGlydHksIHtcbiAgICAgICdBTExPV0VEX1RBR1MnOiBUUklQTEVfTVVTVEFDSEVfQUxMT1dMSVNURURfVEFHUyxcbiAgICAgICdGT1JDRV9CT0RZJzogdHJ1ZSxcbiAgICAgICdSRVRVUk5fRE9NX0ZSQUdNRU5UJzogdHJ1ZSxcbiAgICB9KTtcbiAgICAvLyBTZXJpYWxpemUgRG9jdW1lbnRGcmFnbWVudCB0byBIVE1MLiBYTUxTZXJpYWxpemVyIHdvdWxkIGFsc28gd29yaywgYnV0IGFkZHNcbiAgICAvLyBuYW1lc3BhY2VzIGZvciBhbGwgZWxlbWVudHMgYW5kIGF0dHJpYnV0ZXMuXG4gICAgY29uc3QgZGl2ID0gdGhpcy5kb2NfLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgcmV0dXJuIGRpdi4vKk9LKi8gaW5uZXJIVE1MO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBjb3B5IG9mIHRoZSBtYXAgb2YgYWxsb3dlZCB0YWcgbmFtZXMgKHN0YW5kYXJkIERPTVB1cmlmeSBjb25maWcpLlxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj59XG4gICAqL1xuICBnZXRBbGxvd2VkVGFncygpIHtcbiAgICBjb25zdCBhbGxvd2VkVGFncyA9IHt9O1xuICAgIC8vIFVzZSB0aGlzIGhvb2sgdG8gZXh0cmFjdCBwdXJpZmllcidzIGFsbG93ZWQgdGFncy5cbiAgICB0aGlzLmRvbVB1cmlmeV8uYWRkSG9vaygndXBvblNhbml0aXplRWxlbWVudCcsIChub2RlLCBkYXRhKSA9PiB7XG4gICAgICBPYmplY3QuYXNzaWduKGFsbG93ZWRUYWdzLCBkYXRhLmFsbG93ZWRUYWdzKTtcbiAgICB9KTtcbiAgICAvLyBTYW5pdGl6ZSBkdW1teSBtYXJrdXAgc28gdGhhdCB0aGUgaG9vayBpcyBpbnZva2VkLlxuICAgIGNvbnN0IHAgPSB0aGlzLmRvY18uY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIHRoaXMuZG9tUHVyaWZ5Xy5zYW5pdGl6ZShwKTtcbiAgICBPYmplY3Qua2V5cyhERU5ZTElTVEVEX1RBR1MpLmZvckVhY2goKHRhZykgPT4ge1xuICAgICAgYWxsb3dlZFRhZ3NbdGFnXSA9IGZhbHNlO1xuICAgIH0pO1xuICAgIC8vIFBvcHMgdGhlIGxhc3QgaG9vayBhZGRlZC5cbiAgICB0aGlzLmRvbVB1cmlmeV8ucmVtb3ZlSG9vaygndXBvblNhbml0aXplRWxlbWVudCcpO1xuICAgIHJldHVybiBhbGxvd2VkVGFncztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYW4gYXR0cmlidXRlIGFkZGl0aW9uL21vZGlmaWNhdGlvbi9yZW1vdmFsIGlzIHZhbGlkLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uJ3MgYmVoYXZpb3Igc2hvdWxkIG1hdGNoIHRoYXQgb2YgYWRkUHVyaWZ5SG9va3MoKSwgZXhjZXB0XG4gICAqIHRoYXQgaXQgb3BlcmF0ZXMgb24gYXR0cmlidXRlIGNoYW5nZXMgaW5zdGVhZCBvZiByZW5kZXJpbmcgbmV3IEhUTUwuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHIgTG93ZXItY2FzZSBhdHRyaWJ1dGUgbmFtZS5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgdmFsaWRhdGVBdHRyaWJ1dGVDaGFuZ2Uobm9kZSwgYXR0ciwgdmFsdWUpIHtcbiAgICBjb25zdCB0YWcgPSBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gRGlzYWxsb3cgY2hhbmdlIG9mIGF0dHJpYnV0ZXMgdGhhdCBhcmUgcmVxdWlyZWQgZm9yIGNlcnRhaW4gdGFncyxcbiAgICAvLyBlLmcuIHNjcmlwdFt0eXBlXS5cbiAgICBjb25zdCBhbGxvd2xpc3QgPSBBTExPV0xJU1RFRF9UQUdTX0JZX0FUVFJTW3RhZ107XG4gICAgaWYgKGFsbG93bGlzdCkge1xuICAgICAgY29uc3Qge2F0dHJpYnV0ZSwgdmFsdWVzfSA9IGFsbG93bGlzdDtcbiAgICAgIGlmIChhdHRyaWJ1dGUgPT09IGF0dHIpIHtcbiAgICAgICAgaWYgKHZhbHVlID09IG51bGwgfHwgIXZhbHVlcy5pbmNsdWRlcyh2YWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gYVt0YXJnZXRdIGlzIHJlcXVpcmVkIGFuZCBvbmx5IGNlcnRhaW4gdmFsdWVzIGFyZSBhbGxvd2VkLlxuICAgIGlmICh0YWcgPT09ICdhJyAmJiBhdHRyID09PSAndGFyZ2V0Jykge1xuICAgICAgaWYgKHZhbHVlID09IG51bGwgfHwgIUFMTE9XTElTVEVEX1RBUkdFVFMuaW5jbHVkZXModmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQnkgbm93LCB0aGUgYXR0cmlidXRlIGlzIHNhZmUgdG8gcmVtb3ZlLiAgRE9NUHVyaWZ5LmlzVmFsaWRBdHRyaWJ1dGUoKVxuICAgIC8vIGV4cGVjdHMgbm9uLW51bGwgdmFsdWVzLlxuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgYWxsb3cgYmluZGluZyBhdHRyaWJ1dGVzIGZvciBub3cuXG4gICAgaWYgKGJpbmRpbmdUeXBlRm9yQXR0cihhdHRyKSAhPT0gQmluZGluZ1R5cGUuTk9ORSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwdXJlID0gdGhpcy5kb21QdXJpZnlfLmlzVmFsaWRBdHRyaWJ1dGUodGFnLCBhdHRyLCB2YWx1ZSk7XG4gICAgaWYgKCFwdXJlKSB7XG4gICAgICAvLyBET01QdXJpZnkuaXNWYWxpZEF0dHJpYnV0ZSgpIGJ5IGRlZmF1bHQgcmVqZWN0cyBjZXJ0YWluIGF0dHJpYnV0ZXMgdGhhdFxuICAgICAgLy8gd2Ugc2hvdWxkIGFsbG93OiAoMSkgQU1QIGVsZW1lbnQgYXR0cmlidXRlcywgKDIpIHRhZy1zcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgICAgLy8gUmVqZWN0IGlmIF9ub3RfIG9uZSBvZiB0aGUgYWJvdmUuXG4gICAgICAvL1xuICAgICAgLy8gVE9ETyhjaG91bXgpOiBUaGlzIG9wdHMgb3V0IG9mIERPTVB1cmlmeSdzIGF0dHJpYnV0ZSBfdmFsdWVfIHNhbml0aXphdGlvblxuICAgICAgLy8gZm9yIHRoZSBhYm92ZSwgd2hpY2ggYXNzdW1lcyB0aGF0IHRoZSBhdHRyaWJ1dGVzIGRvbid0IGhhdmUgc2VjdXJpdHlcbiAgICAgIC8vIGltcGxpY2F0aW9ucyBiZXlvbmQgVVJMcyBldGMuIHRoYXQgYXJlIGNvdmVyZWQgYnkgaXNWYWxpZEF0dHIoKS5cbiAgICAgIC8vIFRoaXMgaXMgT0sgYnV0IHdlIG91Z2h0IHRvIGNvbnRyaWJ1dGUgbmV3IGhvb2tzIGFuZCByZW1vdmUgdGhpcy5cbiAgICAgIGNvbnN0IGF0dHJzQnlUYWdzID0gQUxMT1dMSVNURURfQVRUUlNfQllfVEFHU1t0YWddO1xuICAgICAgY29uc3QgYWxsb3dsaXN0ZWRGb3JUYWcgPSBhdHRyc0J5VGFncyAmJiBhdHRyc0J5VGFncy5pbmNsdWRlcyhhdHRyKTtcbiAgICAgIGlmICghYWxsb3dsaXN0ZWRGb3JUYWcgJiYgIXRhZy5zdGFydHNXaXRoKCdhbXAtJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkb2MgPSBub2RlLm93bmVyRG9jdW1lbnRcbiAgICAgID8gbm9kZS5vd25lckRvY3VtZW50XG4gICAgICA6IC8qKiBAdHlwZSB7IURvY3VtZW50fSAqLyAobm9kZSk7XG4gICAgLy8gUGVyZm9ybSBBTVAtc3BlY2lmaWMgYXR0cmlidXRlIHZhbGlkYXRpb24gZS5nLiBfX2FtcF9zb3VyY2Vfb3JpZ2luLlxuICAgIGlmICh2YWx1ZSAmJiAhaXNWYWxpZEF0dHIodGFnLCBhdHRyLCB2YWx1ZSwgZG9jLCAvKiBvcHRfcHVyaWZ5ICovIHRydWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgQU1QIGhvb2tzIHRvIGdpdmVuIERPTVB1cmlmeSBvYmplY3QuXG4gICAqIEBwYXJhbSB7IURvbVB1cmlmeURlZn0gcHVyaWZpZXJcbiAgICogQHBhcmFtIHshQXR0cmlidXRlUmV3cml0ZXJEZWZ8dW5kZWZpbmVkfSBhdHRyUmV3cml0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkUHVyaWZ5SG9va3NfKHB1cmlmaWVyLCBhdHRyUmV3cml0ZSkge1xuICAgIGNvbnN0IGlzRW1haWwgPSBpc0FtcDRFbWFpbCh0aGlzLmRvY18pO1xuXG4gICAgLy8gUmVmZXJlbmNlIHRvIERPTVB1cmlmeSdzIGBhbGxvd2VkVGFnc2AgYWxsb3dsaXN0LlxuICAgIGxldCBhbGxvd2VkVGFncztcbiAgICBjb25zdCBhbGxvd2VkVGFnc0NoYW5nZXMgPSBbXTtcblxuICAgIC8vIFJlZmVyZW5jZSB0byBET01QdXJpZnkncyBgYWxsb3dlZEF0dHJpYnV0ZXNgIGFsbG93bGlzdC5cbiAgICBsZXQgYWxsb3dlZEF0dHJpYnV0ZXM7XG4gICAgY29uc3QgYWxsb3dlZEF0dHJpYnV0ZXNDaGFuZ2VzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAgICogQHBhcmFtIHt7dGFnTmFtZTogc3RyaW5nLCBhbGxvd2VkVGFnczogIU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+fX0gZGF0YVxuICAgICAqL1xuICAgIGNvbnN0IHVwb25TYW5pdGl6ZUVsZW1lbnQgPSAobm9kZSwgZGF0YSkgPT4ge1xuICAgICAgY29uc3Qge3RhZ05hbWV9ID0gZGF0YTtcbiAgICAgIGFsbG93ZWRUYWdzID0gZGF0YS5hbGxvd2VkVGFncztcblxuICAgICAgLy8gQWxsb3cgYWxsIEFNUCBlbGVtZW50cy5cbiAgICAgIGlmICh0YWdOYW1lLnN0YXJ0c1dpdGgoJ2FtcC0nKSkge1xuICAgICAgICAvLyBFbmZvcmNlIEFNUDRFTUFJTCB0YWcgYWxsb3dsaXN0IGF0IHJ1bnRpbWUuXG4gICAgICAgIGFsbG93ZWRUYWdzW3RhZ05hbWVdID0gIWlzRW1haWwgfHwgRU1BSUxfQUxMT1dMSVNURURfQU1QX1RBR1NbdGFnTmFtZV07XG4gICAgICB9XG4gICAgICAvLyBTZXQgYHRhcmdldGAgYXR0cmlidXRlIGZvciA8YT4gdGFncyBpZiBuZWNlc3NhcnkuXG4gICAgICBpZiAodGFnTmFtZSA9PT0gJ2EnKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkZXZBc3NlcnRFbGVtZW50KG5vZGUpO1xuICAgICAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSAmJiAhZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3RhcmdldCcpKSB7XG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfdG9wJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEFsbG93IGNlcnRhaW4gdGFncyBpZiB0aGV5IGhhdmUgYW4gYXR0cmlidXRlIHdpdGggYSBhbGxvd2xpc3RlZCB2YWx1ZS5cbiAgICAgIGNvbnN0IGFsbG93bGlzdCA9IEFMTE9XTElTVEVEX1RBR1NfQllfQVRUUlNbdGFnTmFtZV07XG4gICAgICBpZiAoYWxsb3dsaXN0KSB7XG4gICAgICAgIGNvbnN0IHthdHRyaWJ1dGUsIHZhbHVlc30gPSBhbGxvd2xpc3Q7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkZXZBc3NlcnRFbGVtZW50KG5vZGUpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSAmJlxuICAgICAgICAgIHZhbHVlcy5pbmNsdWRlcyhlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpKVxuICAgICAgICApIHtcbiAgICAgICAgICBhbGxvd2VkVGFnc1t0YWdOYW1lXSA9IHRydWU7XG4gICAgICAgICAgYWxsb3dlZFRhZ3NDaGFuZ2VzLnB1c2godGFnTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHshTm9kZX0gdW51c2VkTm9kZVxuICAgICAqL1xuICAgIGNvbnN0IGFmdGVyU2FuaXRpemVFbGVtZW50cyA9ICh1bnVzZWROb2RlKSA9PiB7XG4gICAgICAvLyBET01QdXJpZnkgZG9lc24ndCBoYXZlIGEgYXR0cmlidXRlLXNwZWNpZmljIHRhZyBhbGxvd2xpc3QgQVBJIGFuZFxuICAgICAgLy8gYGFsbG93ZWRUYWdzYCBoYXMgYSBwZXItaW52b2NhdGlvbiBzY29wZSwgc28gd2UgbmVlZCB0byB1bmRvXG4gICAgICAvLyBjaGFuZ2VzIGFmdGVyIHNhbml0aXppbmcgZWxlbWVudHMuXG4gICAgICBhbGxvd2VkVGFnc0NoYW5nZXMuZm9yRWFjaCgodGFnKSA9PiB7XG4gICAgICAgIGRlbGV0ZSBhbGxvd2VkVGFnc1t0YWddO1xuICAgICAgfSk7XG4gICAgICBhbGxvd2VkVGFnc0NoYW5nZXMubGVuZ3RoID0gMDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e2F0dHJOYW1lOiBzdHJpbmcsIGF0dHJWYWx1ZTogc3RyaW5nLCBhbGxvd2VkQXR0cmlidXRlczogIU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+fX0gZGF0YVxuICAgICAqL1xuICAgIGNvbnN0IHVwb25TYW5pdGl6ZUF0dHJpYnV0ZSA9IChlbGVtZW50LCBkYXRhKSA9PiB7XG4gICAgICAvLyBCZXdhcmUgb2YgRE9NIENsb2JiZXJpbmcgd2hlbiB1c2luZyBwcm9wZXJ0aWVzIG9yIGZ1bmN0aW9ucyBvbiBgZWxlbWVudGAuXG4gICAgICAvLyBET01QdXJpZnkgY2hlY2tzIGEgZmV3IG9mIHRoZXNlIGZvciBpdHMgaW50ZXJuYWwgdXNhZ2UgKGUuZy4gYG5vZGVOYW1lYCksXG4gICAgICAvLyBidXQgbm90IG90aGVycyB0aGF0IG1heSBiZSB1c2VkIGluIGN1c3RvbSBob29rcy5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vY3VyZTUzL0RPTVB1cmlmeS93aWtpL1NlY3VyaXR5LUdvYWxzLSYtVGhyZWF0LU1vZGVsI3NlY3VyaXR5LWdvYWxzXG4gICAgICAvLyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL2N1cmU1My9ET01QdXJpZnkvYmxvYi9tYXN0ZXIvc3JjL3B1cmlmeS5qcyNMNTI3LlxuXG4gICAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3Qge2F0dHJOYW1lfSA9IGRhdGE7XG4gICAgICBsZXQge2F0dHJWYWx1ZX0gPSBkYXRhO1xuICAgICAgYWxsb3dlZEF0dHJpYnV0ZXMgPSBkYXRhLmFsbG93ZWRBdHRyaWJ1dGVzO1xuXG4gICAgICBjb25zdCBhbGxvd0F0dHJpYnV0ZSA9ICgpID0+IHtcbiAgICAgICAgLy8gT25seSBhZGQgbmV3IGF0dHJpYnV0ZXMgdG8gYGFsbG93ZWRBdHRyaWJ1dGVzQ2hhbmdlc2AgdG8gYXZvaWQgcmVtb3ZpbmdcbiAgICAgICAgLy8gZGVmYXVsdC1zdXBwb3J0ZWQgYXR0cmlidXRlcyBsYXRlciBlcnJvbmVvdXNseS5cbiAgICAgICAgaWYgKCFhbGxvd2VkQXR0cmlidXRlc1thdHRyTmFtZV0pIHtcbiAgICAgICAgICBhbGxvd2VkQXR0cmlidXRlc1thdHRyTmFtZV0gPSB0cnVlO1xuICAgICAgICAgIGFsbG93ZWRBdHRyaWJ1dGVzQ2hhbmdlcy5wdXNoKGF0dHJOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gQWxsb3cgYWxsIGF0dHJpYnV0ZXMgZm9yIEFNUCBlbGVtZW50cy4gVGhpcyBhdm9pZHMgdGhlIG5lZWQgdG8gYWxsb3dsaXN0XG4gICAgICAvLyBub25zdGFuZGFyZCBhdHRyaWJ1dGVzIGZvciBldmVyeSBjb21wb25lbnQgZS5nLiBhbXAtbGlnaHRib3hbc2Nyb2xsYWJsZV0uXG4gICAgICBjb25zdCBpc0FtcEVsZW1lbnQgPSB0YWdOYW1lLnN0YXJ0c1dpdGgoJ2FtcC0nKTtcbiAgICAgIGlmIChpc0FtcEVsZW1lbnQpIHtcbiAgICAgICAgYWxsb3dBdHRyaWJ1dGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGA8QT5gIGhhcyBzcGVjaWFsIHRhcmdldCBydWxlczpcbiAgICAgICAgLy8gLSBEZWZhdWx0IHRhcmdldCBpcyBcIl90b3BcIjtcbiAgICAgICAgLy8gLSBBbGxvd2VkIHRhcmdldHMgYXJlIFwiX2JsYW5rXCIsIFwiX3RvcFwiO1xuICAgICAgICAvLyAtIEFsbCBvdGhlciB0YXJnZXRzIGFyZSByZXdyaXR0ZWQgdG8gXCJfdG9wXCIuXG4gICAgICAgIGlmICh0YWdOYW1lID09ICdhJyAmJiBhdHRyTmFtZSA9PSAndGFyZ2V0Jykge1xuICAgICAgICAgIGNvbnN0IGxvd2VyY2FzZVZhbHVlID0gYXR0clZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKCFBTExPV0xJU1RFRF9UQVJHRVRTLmluY2x1ZGVzKGxvd2VyY2FzZVZhbHVlKSkge1xuICAgICAgICAgICAgYXR0clZhbHVlID0gJ190b3AnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBbHdheXMgdXNlIGxvd2VyY2FzZSB2YWx1ZXMgZm9yIGB0YXJnZXRgIGF0dHIuXG4gICAgICAgICAgICBhdHRyVmFsdWUgPSBsb3dlcmNhc2VWYWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3Igbm9uLUFNUCBlbGVtZW50cywgYWxsb3cgYXR0cmlidXRlcyBpbiB0YWctc3BlY2lmaWMgYWxsb3dsaXN0LlxuICAgICAgICBjb25zdCBhdHRyc0J5VGFncyA9IEFMTE9XTElTVEVEX0FUVFJTX0JZX1RBR1NbdGFnTmFtZV07XG4gICAgICAgIGlmIChhdHRyc0J5VGFncyAmJiBhdHRyc0J5VGFncy5pbmNsdWRlcyhhdHRyTmFtZSkpIHtcbiAgICAgICAgICBhbGxvd0F0dHJpYnV0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gYmluZGluZ1R5cGVGb3JBdHRyKGF0dHJOYW1lKTtcbiAgICAgIC8vIFJld3JpdGUgY2xhc3NpYyBiaW5kaW5ncyBlLmcuIFtmb29dPVwiYmFyXCIgLT4gZGF0YS1hbXAtYmluZC1mb289XCJiYXJcIi5cbiAgICAgIC8vIFRoaXMgaXMgYmVjYXVzZSBET01QdXJpZnkgZWFnZXJseSByZW1vdmVzIGF0dHJpYnV0ZXMgYW5kIHJlLWFkZHMgdGhlbVxuICAgICAgLy8gYWZ0ZXIgc2FuaXRpemF0aW9uLCB3aGljaCBmYWlscyBiZWNhdXNlIGBbXWAgYXJlIG5vdCB2YWxpZCBhdHRyIGNoYXJzLlxuICAgICAgaWYgKGJpbmRpbmdUeXBlID09PSBCaW5kaW5nVHlwZS5DTEFTU0lDKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gYXR0ck5hbWUuc3Vic3RyaW5nKDEsIGF0dHJOYW1lLmxlbmd0aCAtIDEpO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShgJHtCSU5EX1BSRUZJWH0ke3Byb3BlcnR5fWAsIGF0dHJWYWx1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYmluZGluZ1R5cGUgIT09IEJpbmRpbmdUeXBlLk5PTkUpIHtcbiAgICAgICAgLy8gU2V0IGEgY3VzdG9tIGF0dHJpYnV0ZSB0byBtYXJrIHRoaXMgZWxlbWVudCBhcyBjb250YWluaW5nIGEgYmluZGluZy5cbiAgICAgICAgLy8gVGhpcyBpcyBhbiBvcHRpbWl6YXRpb24gdGhhdCBvYnZpYXRlcyB0aGUgbmVlZCBmb3IgRE9NIHNjYW4gbGF0ZXIuXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdpLWFtcGh0bWwtYmluZGluZycsICcnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICBpc1ZhbGlkQXR0cihcbiAgICAgICAgICB0YWdOYW1lLFxuICAgICAgICAgIGF0dHJOYW1lLFxuICAgICAgICAgIGF0dHJWYWx1ZSxcbiAgICAgICAgICAvKiBkb2MgKi8gdGhpcy5kb2NfLFxuICAgICAgICAgIC8qIG9wdF9wdXJpZnkgKi8gdHJ1ZVxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgaWYgKGF0dHJSZXdyaXRlICYmIGF0dHJWYWx1ZSAmJiAhYXR0ck5hbWUuc3RhcnRzV2l0aChCSU5EX1BSRUZJWCkpIHtcbiAgICAgICAgICBhdHRyVmFsdWUgPSBhdHRyUmV3cml0ZSh0YWdOYW1lLCBhdHRyTmFtZSwgYXR0clZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YS5rZWVwQXR0ciA9IGZhbHNlO1xuICAgICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgICAgVEFHLFxuICAgICAgICAgICdSZW1vdmVkIGludmFsaWQgYXR0cmlidXRlICVzWyVzPVwiJXNcIl0uJyxcbiAgICAgICAgICB0YWdOYW1lLFxuICAgICAgICAgIGF0dHJOYW1lLFxuICAgICAgICAgIGF0dHJWYWx1ZVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBVcGRhdGUgYXR0cmlidXRlIHZhbHVlLlxuICAgICAgZGF0YS5hdHRyVmFsdWUgPSBhdHRyVmFsdWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAdGhpcyB7e3JlbW92ZWQ6ICFBcnJheX19IENvbnRhaW5zIGxpc3Qgb2YgcmVtb3ZlZCBlbGVtZW50cy9hdHRycyBzbyBmYXIuXG4gICAgICovXG4gICAgY29uc3QgYWZ0ZXJTYW5pdGl6ZUF0dHJpYnV0ZXMgPSAoZWxlbWVudCkgPT4ge1xuICAgICAgbWFya0VsZW1lbnRGb3JEaWZmaW5nKGVsZW1lbnQsICgpID0+IFN0cmluZyh0aGlzLmtleUNvdW50ZXJfKyspKTtcblxuICAgICAgLy8gRE9NUHVyaWZ5IGRvZXNuJ3QgaGF2ZSBhIHRhZy1zcGVjaWZpYyBhdHRyaWJ1dGUgYWxsb3dsaXN0IEFQSSBhbmRcbiAgICAgIC8vIGBhbGxvd2VkQXR0cmlidXRlc2AgaGFzIGEgcGVyLWludm9jYXRpb24gc2NvcGUsIHNvIHdlIG5lZWQgdG8gdW5kb1xuICAgICAgLy8gY2hhbmdlcyBhZnRlciBzYW5pdGl6aW5nIGF0dHJpYnV0ZXMuXG4gICAgICBhbGxvd2VkQXR0cmlidXRlc0NoYW5nZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgICBkZWxldGUgYWxsb3dlZEF0dHJpYnV0ZXNbYXR0cl07XG4gICAgICB9KTtcbiAgICAgIGFsbG93ZWRBdHRyaWJ1dGVzQ2hhbmdlcy5sZW5ndGggPSAwO1xuXG4gICAgICAvLyBPbmx5IGFsbG93IHJlbGF0aXZlIHJlZmVyZW5jZXMgaW4gPHVzZT4uXG4gICAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHRhZ05hbWUgPT09ICd1c2UnKSB7XG4gICAgICAgIFsnaHJlZicsICd4bGluazpocmVmJ10uZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHIpICYmXG4gICAgICAgICAgICAhZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cikuc3RhcnRzV2l0aCgnIycpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZW1vdmVFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICAgICAgdXNlcigpLmVycm9yKFxuICAgICAgICAgICAgICBUQUcsXG4gICAgICAgICAgICAgICdSZW1vdmVkIGludmFsaWQgPHVzZT4uIHVzZVtocmVmXSBtdXN0IHN0YXJ0IHdpdGggXCIjXCIuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBwdXJpZmllci5hZGRIb29rKCd1cG9uU2FuaXRpemVFbGVtZW50JywgdXBvblNhbml0aXplRWxlbWVudCk7XG4gICAgcHVyaWZpZXIuYWRkSG9vaygnYWZ0ZXJTYW5pdGl6ZUVsZW1lbnRzJywgYWZ0ZXJTYW5pdGl6ZUVsZW1lbnRzKTtcbiAgICBwdXJpZmllci5hZGRIb29rKCd1cG9uU2FuaXRpemVBdHRyaWJ1dGUnLCB1cG9uU2FuaXRpemVBdHRyaWJ1dGUpO1xuICAgIHB1cmlmaWVyLmFkZEhvb2soJ2FmdGVyU2FuaXRpemVBdHRyaWJ1dGVzJywgYWZ0ZXJTYW5pdGl6ZUF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdHJpcGxlLW11c3RhY2hlIHNwZWNpZmljIEFNUCBob29rcyB0byBnaXZlbiBET01QdXJpZnkgb2JqZWN0LlxuICAgKiBAcGFyYW0geyFEb21QdXJpZnlEZWZ9IHB1cmlmaWVyXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhZGRQdXJpZnlIb29rc1RyaXBsZU11c3RhY2hlXyhwdXJpZmllcikge1xuICAgIC8vIFJlZmVyZW5jZSB0byBET01QdXJpZnkncyBgYWxsb3dlZFRhZ3NgIGFsbG93bGlzdC5cbiAgICBsZXQgYWxsb3dlZFRhZ3M7XG5cbiAgICBjb25zdCB1cG9uU2FuaXRpemVFbGVtZW50ID0gKG5vZGUsIGRhdGEpID0+IHtcbiAgICAgIGNvbnN0IHt0YWdOYW1lfSA9IGRhdGE7XG4gICAgICBhbGxvd2VkVGFncyA9IGRhdGEuYWxsb3dlZFRhZ3M7XG4gICAgICBpZiAodGFnTmFtZSA9PT0gJ3RlbXBsYXRlJykge1xuICAgICAgICBjb25zdCB0eXBlID0gbm9kZS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgICAgaWYgKHR5cGUgJiYgdHlwZS50b0xvd2VyQ2FzZSgpID09PSAnYW1wLW11c3RhY2hlJykge1xuICAgICAgICAgIGFsbG93ZWRUYWdzWyd0ZW1wbGF0ZSddID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBhZnRlclNhbml0aXplRWxlbWVudHMgPSAodW51c2VkTm9kZSkgPT4ge1xuICAgICAgLy8gRE9NUHVyaWZ5IGRvZXNuJ3QgaGF2ZSBhbiByZXF1aXJlZC1hdHRyaWJ1dGUgdGFnIGFsbG93bGlzdCBBUEkgYW5kXG4gICAgICAvLyBgYWxsb3dlZFRhZ3NgIGhhcyBhIHBlci1pbnZvY2F0aW9uIHNjb3BlLCBzbyB3ZSBuZWVkIHRvIHJlbW92ZVxuICAgICAgLy8gcmVxdWlyZWQtYXR0cmlidXRlIHRhZ3MgYWZ0ZXIgc2FuaXRpemluZyBlYWNoIGVsZW1lbnQuXG4gICAgICBhbGxvd2VkVGFnc1sndGVtcGxhdGUnXSA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBwdXJpZmllci5hZGRIb29rKCd1cG9uU2FuaXRpemVFbGVtZW50JywgdXBvblNhbml0aXplRWxlbWVudCk7XG4gICAgcHVyaWZpZXIuYWRkSG9vaygnYWZ0ZXJTYW5pdGl6ZUVsZW1lbnRzJywgYWZ0ZXJTYW5pdGl6ZUVsZW1lbnRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgc3RhbmRhcmQgRE9NUHVyaWZ5IGNvbmZpZyBmb3IgZXNjYXBlZCB0ZW1wbGF0ZXMuXG4gKiBEbyBub3QgdXNlIGZvciB1bmVzY2FwZWQgdGVtcGxhdGVzLlxuICpcbiAqIE5PVEU6IFNlZSB0aGF0IHdlIHVzZSBEb21QdXJpZnlDb25maWcgZm91bmQgaW5cbiAqIGJ1aWxkLXN5c3RlbS9kb21wdXJpZnkuZXh0ZXJuLmpzIGFzIHRoZSBleGFjdCB0eXBlLiBUaGlzIGlzIHRvIHByZXZlbnRcbiAqIGNsb3N1cmUgY29tcGlsZXIgZnJvbSBvcHRpbWl6aW5nIHRoZXNlIGZpZWxkcyBoZXJlIGluIHRoaXMgZmlsZSBhbmQgaW4gdGhlXG4gKiAzcmQgcGFydHkgbGlicmFyeSBmaWxlLiBTZWUgIzE5NjI0IGZvciBmdXJ0aGVyIGluZm9ybWF0aW9uLlxuICpcbiAqIEByZXR1cm4geyFEb21QdXJpZnlDb25maWd9XG4gKi9cbmZ1bmN0aW9uIHN0YW5kYXJkUHVyaWZ5Q29uZmlnKCkge1xuICBjb25zdCBjb25maWcgPSB7XG4gICAgLi4uUFVSSUZZX1BST0ZJTEVTLFxuICAgIEFERF9BVFRSOiBBTExPV0xJU1RFRF9BVFRSUyxcbiAgICBBRERfVEFHUzogWyd1c2UnXSxcbiAgICBGT1JCSURfVEFHUzogT2JqZWN0LmtleXMoREVOWUxJU1RFRF9UQUdTKSxcbiAgICBGT1JDRV9CT0RZOiB0cnVlLFxuICAgIFJFVFVSTl9ET006IHRydWUsXG4gICAgQUxMT1dfVU5LTk9XTl9QUk9UT0NPTFM6IHRydWUsXG4gIH07XG4gIHJldHVybiAvKiogQHR5cGUgeyFEb21QdXJpZnlDb25maWd9ICovIChjb25maWcpO1xufVxuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmNvbnN0IEJpbmRpbmdUeXBlID0ge1xuICBOT05FOiAwLFxuICBDTEFTU0lDOiAxLFxuICBBTFRFUk5BVElWRTogMixcbn07XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGF0dHJOYW1lXG4gKiBAcmV0dXJuIHtCaW5kaW5nVHlwZX1cbiAqL1xuZnVuY3Rpb24gYmluZGluZ1R5cGVGb3JBdHRyKGF0dHJOYW1lKSB7XG4gIGlmIChhdHRyTmFtZVswXSA9PSAnWycgJiYgYXR0ck5hbWVbYXR0ck5hbWUubGVuZ3RoIC0gMV0gPT0gJ10nKSB7XG4gICAgcmV0dXJuIEJpbmRpbmdUeXBlLkNMQVNTSUM7XG4gIH1cbiAgaWYgKGF0dHJOYW1lLnN0YXJ0c1dpdGgoQklORF9QUkVGSVgpKSB7XG4gICAgcmV0dXJuIEJpbmRpbmdUeXBlLkFMVEVSTkFUSVZFO1xuICB9XG4gIHJldHVybiBCaW5kaW5nVHlwZS5OT05FO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/purifier/index.js