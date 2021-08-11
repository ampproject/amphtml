function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { isElement } from "./core/types";
import { dev } from "./log";
import { Services } from "./service";

/**
 * The interface that is implemented by all templates.
 * @abstract
 */
export var BaseTemplate = /*#__PURE__*/function () {
  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  function BaseTemplate(element, win) {_classCallCheck(this, BaseTemplate);
    /** @public @const */
    this.element = element;

    /** @public @const {!Window} */
    this.win = element.ownerDocument.defaultView || win;

    /** @private @const */
    this.viewer_ = Services.viewerForDoc(this.element);

    this.compileCallback();
  }

  /**
   * Override in subclass if the element needs to compile the template.
   * @protected
   */_createClass(BaseTemplate, [{ key: "compileCallback", value:
    function compileCallback() {
      // Subclasses may override.
    }

    /**
     * Bypasses template rendering and directly sets HTML. Should only be used
     * for server-side rendering case. To be implemented by subclasses.
     * @param {string} unusedData
     * @return {!Element|!Array<Element>}
     * @abstract
     */ }, { key: "setHtml", value:
    function setHtml(unusedData) {}

    /**
     * To be implemented by subclasses.
     * @param {!JsonObject|string} unusedData
     * @return {!Element}
     * @abstract
     */ }, { key: "render", value:
    function render(unusedData) {}

    /**
     * To be implemented by subclasses.
     * @param {!JsonObject|string} unusedData
     * @return {string}
     * @abstract
     */ }, { key: "renderAsString", value:
    function renderAsString(unusedData) {}

    /**
     * Iterate through the child nodes of the given root, applying the
     * given callback to non-empty text nodes and elements.
     * @param {!Element} root
     * @param {function((!Element|string))} callback
     */ }, { key: "visitChildren_", value:
    function visitChildren_(root, callback) {
      for (var n = root.firstChild; n != null; n = n.nextSibling) {
        if (n.nodeType == /* TEXT */3) {
          var text = n.textContent.trim();
          if (text) {
            callback(text);
          }
        } else if (n.nodeType == /* COMMENT */8) {
          // Ignore comments.
        } else if (isElement(n)) {
          callback( /** @type {!Element} */(n));
        }
      }
    }

    /**
     * Unwraps the root element. If root has a single element child,
     * returns the child. Otherwise, returns root.
     * @param {!Element} root
     * @return {!Element}
     * @protected @final
     */ }, { key: "tryUnwrap", value:
    function tryUnwrap(root) {
      var onlyChild;
      this.visitChildren_(root, function (c) {
        if (onlyChild === undefined && c.nodeType) {
          onlyChild = c;
        } else {
          onlyChild = null;
        }
      });
      return onlyChild || root;
    }

    /**
     * Unwraps the root element and returns any children in an array.
     * Text node children are normalized inside a <div>.
     * @param {!Element} root
     * @return {!Array<!Element>}
     * @protected @final
     */ }, { key: "unwrapChildren", value:
    function unwrapChildren(root) {var _this = this;
      var children = [];
      this.visitChildren_(root, function (c) {
        if (typeof c == 'string') {
          var element = _this.win.document.createElement('div');
          element.textContent = c;
          children.push(element);
        } else {
          children.push(c);
        }
      });
      return children;
    }

    /**
     * @protected @final
     * @return {boolean}
     */ }, { key: "viewerCanRenderTemplates", value:
    function viewerCanRenderTemplates() {
      return this.viewer_.hasCapability('viewerRenderTemplate');
    } }]);return BaseTemplate;}();
// /Users/mszylkowski/src/amphtml/src/base-template.js