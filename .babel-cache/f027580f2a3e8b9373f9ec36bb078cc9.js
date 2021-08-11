function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import { Deferred } from "../core/data-structures/promise";
import { rootNodeFor } from "../core/dom";
import { scopedQuerySelector } from "../core/dom/query";

import { userAssert } from "../log";
import {
getServiceForDoc,
registerServiceBuilderForDoc } from "../service-helpers";


/**
 * @fileoverview
 * For the set of decisions made on templating see:
 * {@link https://docs.google.com/document/d/1q-5MPQHnOHLF_uL7lQsGZdzuBgrPTkCy2PdRP-YCbOw/edit#}
 */

/** @private @const {string} */
var PROP_ = '__AMP_IMPL_';

/** @private @const {string} */
var PROP_PROMISE_ = '__AMP_WAIT_';

/** @private @const {function()} */
var EMPTY_FUNC = function EMPTY_FUNC() {};

/**
 */
export var Templates = /*#__PURE__*/function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function Templates(ampdoc) {_classCallCheck(this, Templates);
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /**
     * A map from template type to template's class promise.
     * @private @const {!Object<string, !Promise<typeof ../base-template.BaseTemplate>>}
     */
    this.templateClassMap_ = {};

    /**
     * A map from template type to template's class promise. This is a transient
     * storage. As soon as the template class loaded, the entry is removed.
     * @private @const {!Object<string, function(typeof ../base-template.BaseTemplate)>}
     */
    this.templateClassResolvers_ = {};
  }

  /**
   * Waits for template to be fully initialized.
   * @param {!Element} templateElement
   * @return {!Promise}
   */_createClass(Templates, [{ key: "whenReady", value:
    function whenReady(templateElement) {
      return this.getImplementation_(templateElement).then(EMPTY_FUNC);
    }

    /**
     * Inserts the specified template element.
     * @param {!Element} templateElement
     * @param {string} html
     * @return {!Promise<(!Element|!Array<!Element>)>}
     */ }, { key: "setHtmlForTemplate", value:
    function setHtmlForTemplate(templateElement, html) {var _this = this;
      return this.getImplementation_(templateElement).then(function (impl) {
        return _this.setHtml_(impl, html);
      });
    }

    /**
     * Renders the specified template element using the supplied data.
     * @param {!Element} templateElement
     * @param {!JsonObject} data
     * @return {!Promise<!Element>}
     */ }, { key: "renderTemplate", value:
    function renderTemplate(templateElement, data) {var _this2 = this;
      return this.getImplementation_(templateElement).then(function (impl) {
        return _this2.render_(impl, data);
      });
    }

    /**
     * Renders the specified template element using the supplied data.
     * @param {!Element} templateElement
     * @param {!JsonObject} data
     * @return {!Promise<!Element>}
     */ }, { key: "renderTemplateAsString", value:
    function renderTemplateAsString(templateElement, data) {
      return this.getImplementation_(templateElement).then(function (impl) {
        return impl.renderAsString(data);
      });
    }

    /**
     * Renders the specified template element using the supplied array of data
     * and returns an array of resulting elements.
     * @param {!Element} templateElement
     * @param {!Array<!JsonObject>} array
     * @return {!Promise<!Array<!Element>>}
     */ }, { key: "renderTemplateArray", value:
    function renderTemplateArray(templateElement, array) {var _this3 = this;
      if (array.length == 0) {
        return Promise.resolve([]);
      }
      return this.getImplementation_(templateElement).then(function (impl) {
        return array.map(function (item) {
          return _this3.render_(impl, item);
        });
      });
    }

    /**
     * Discovers the template for the specified parent and renders it using the
     * supplied data. The template can be specified either via "template"
     * attribute  or as a child "template" element. When specified via "template"
     * attribute, the value indicates the ID of the template element.
     * @param {!Element} parent
     * @param {!JsonObject} data
     * @param {string=} opt_querySelector
     * @return {!Promise<!Element>}
     */ }, { key: "findAndRenderTemplate", value:
    function findAndRenderTemplate(parent, data, opt_querySelector) {
      return this.renderTemplate(
      this.findTemplate(parent, opt_querySelector),
      data);

    }

    /**
     * Discovers the already rendered template for the specified parent and
     * inserts it in the DOM. The template can be specified either via "template"
     * attribute  or as a child "template" element. When specified via "template"
     * attribute, the value indicates the ID of the template element.
     * @param {!Element} parent
     * @param {string} html
     * @param {string=} opt_querySelector
     * @return {!Promise<(!Element|!Array<!Element>)>}
     */ }, { key: "findAndSetHtmlForTemplate", value:
    function findAndSetHtmlForTemplate(parent, html, opt_querySelector) {
      return this.setHtmlForTemplate(
      this.findTemplate(parent, opt_querySelector),
      html);

    }

    /**
     * Discovers the template for the specified parent and renders it using the
     * supplied array of data. The template can be specified either via "template"
     * attribute or as a child "template" element. When specified via "template"
     * attribute, the value indicates the ID of the template element. Returns
     * the array of the rendered elements.
     * @param {!Element} parent
     * @param {!Array<!JsonObject>} array
     * @param {string=} opt_querySelector
     * @return {!Promise<!Array<!Element>>}
     */ }, { key: "findAndRenderTemplateArray", value:
    function findAndRenderTemplateArray(parent, array, opt_querySelector) {
      return this.renderTemplateArray(
      this.findTemplate(parent, opt_querySelector),
      array);

    }

    /**
     * Detect if a template is present inside the parent.
     * @param {!Element} parent
     * @param {string=} opt_querySelector
     * @return {boolean}
     */ }, { key: "hasTemplate", value:
    function hasTemplate(parent, opt_querySelector) {
      return !!this.maybeFindTemplate(parent, opt_querySelector);
    }

    /**
     * Find a specified template inside the parent. Fail if the template is
     * not present.
     * @param {!Element} parent
     * @param {string=} opt_querySelector
     * @return {!Element}
     */ }, { key: "findTemplate", value:
    function findTemplate(parent, opt_querySelector) {
      var templateElement = this.maybeFindTemplate(parent, opt_querySelector);
      userAssert(templateElement, 'Template not found for %s', parent);
      var templateTagName = templateElement.tagName;
      userAssert(
      templateTagName == 'TEMPLATE' || (
      templateTagName == 'SCRIPT' &&
      templateElement.getAttribute('type') === 'text/plain'),
      'Template must be defined in a <template> or ' +
      '<script type="text/plain"> tag');

      return templateElement;
    }

    /**
     * Find a specified template inside the parent. Returns null if not present.
     * The template can be specified either via "template" attribute or as a
     * child "template" element. When specified via "template" attribute,
     * the value indicates the ID of the template element. The template
     * can be defined either via the <template> or <script> tag.
     * @param {!Element} parent
     * @param {string=} opt_querySelector
     * @return {?Element}
     */ }, { key: "maybeFindTemplate", value:
    function maybeFindTemplate(parent, opt_querySelector) {
      var templateId = parent.getAttribute('template');
      if (templateId) {
        var rootNode = /** @type {!Document|!ShadowRoot} */(
        rootNodeFor(parent));

        return rootNode.getElementById(templateId);
      } else if (opt_querySelector) {
        return scopedQuerySelector(parent, opt_querySelector);
      } else {
        return parent.querySelector('template[type], script[type="text/plain"]');
      }
    }

    /**
     * Returns the promise that will eventually yield the template implementation
     * for the specified template element.
     * @param {!Element} element
     * @return {!Promise<!../base-template.BaseTemplate>}
     * @private
     */ }, { key: "getImplementation_", value:
    function getImplementation_(element) {var _this4 = this;
      /** @const {!../base-template.BaseTemplate} */
      var impl = element[PROP_];
      if (impl) {
        return Promise.resolve(impl);
      }

      var type = '';
      var tagName = element.tagName;
      if (tagName == 'TEMPLATE') {
        type = element.getAttribute('type');
      } else if (tagName == 'SCRIPT') {
        type = element.getAttribute('template');
      }
      userAssert(type, 'Type must be specified: %s', element);

      var promise = element[PROP_PROMISE_];
      if (promise) {
        return promise;
      }

      promise = this.waitForTemplateClass_(element, type).then(
      function (templateClass) {
        // This is ugly workaround for https://github.com/google/closure-compiler/issues/2630.
        var Constr = /** @type {function(new:Object, !Element, !Window)} */(
        templateClass);

        var impl = (element[PROP_] = new Constr(element, _this4.ampdoc_.win));
        delete element[PROP_PROMISE_];
        return impl;
      });

      element[PROP_PROMISE_] = promise;
      return promise;
    }

    /**
     * Returns the promise that will eventually yield the template class. This
     * will wait until the actual template script has been downloaded and parsed.
     * @param {!Element} element
     * @param {string} type
     * @return {!Promise<typeof ../base-template.BaseTemplate>}
     * @private
     */ }, { key: "waitForTemplateClass_", value:
    function waitForTemplateClass_(element, type) {
      if (this.templateClassMap_[type]) {
        return this.templateClassMap_[type];
      }

      var deferred = new Deferred();
      var promise = deferred.promise,resolve = deferred.resolve;

      this.templateClassMap_[type] = promise;
      this.templateClassResolvers_[type] = resolve;
      return promise;
    }

    /**
     * Registers an extended template. This function should typically be called
     * through the registerTemplate method on the AMP runtime.
     * @param {string} type
     * @param {typeof ../base-template.BaseTemplate} templateClass
     * @private
     * @restricted
     */ }, { key: "registerTemplate_", value:
    function registerTemplate_(type, templateClass) {
      if (!this.templateClassMap_[type]) {
        this.templateClassMap_[type] = Promise.resolve(templateClass);
      } else {
        var resolver = this.templateClassResolvers_[type];
        userAssert(resolver, 'Duplicate template type: %s', type);
        delete this.templateClassResolvers_[type];
        resolver(templateClass);
      }
    }

    /**
     * @param {!../base-template.BaseTemplate} impl
     * @param {!JsonObject} data
     * @return {!Element}
     * @private
     */ }, { key: "render_", value:
    function render_(impl, data) {
      return impl.render(data);
    }

    /**
     * @param {!../base-template.BaseTemplate} impl
     * @param {string} html
     * @return {!Element|!Array<!Element>}
     * @private
     */ }, { key: "setHtml_", value:
    function setHtml_(impl, html) {
      return impl.setHtml(html);
    } }]);return Templates;}();


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installTemplatesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'templates', Templates);
}

/**
 * Registers an extended template. This function should typically be called
 * through the registerTemplate method on the AMP runtime.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {string} type
 * @param {typeof ../base-template.BaseTemplate} templateClass
 * @return {undefined}
 */
export function registerExtendedTemplateForDoc(ampdoc, type, templateClass) {
  var templatesService = getServiceForDoc(ampdoc, 'templates');
  return templatesService.registerTemplate_(type, templateClass);
}

/**
 * @param {!Templates} templates
 * @param {string} type
 * @return {!Promise<typeof ../base-template.BaseTemplate>|undefined}
 * @visibleForTesting
 */
export function getTemplateClassForTesting(templates, type) {
  return templates.templateClassMap_[type];
}
// /Users/mszylkowski/src/amphtml/src/service/template-impl.js