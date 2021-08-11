function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { getServiceForDoc, registerServiceBuilderForDoc } from "../service-helpers";

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
  function Templates(ampdoc) {
    _classCallCheck(this, Templates);

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
   */
  _createClass(Templates, [{
    key: "whenReady",
    value: function whenReady(templateElement) {
      return this.getImplementation_(templateElement).then(EMPTY_FUNC);
    }
    /**
     * Inserts the specified template element.
     * @param {!Element} templateElement
     * @param {string} html
     * @return {!Promise<(!Element|!Array<!Element>)>}
     */

  }, {
    key: "setHtmlForTemplate",
    value: function setHtmlForTemplate(templateElement, html) {
      var _this = this;

      return this.getImplementation_(templateElement).then(function (impl) {
        return _this.setHtml_(impl, html);
      });
    }
    /**
     * Renders the specified template element using the supplied data.
     * @param {!Element} templateElement
     * @param {!JsonObject} data
     * @return {!Promise<!Element>}
     */

  }, {
    key: "renderTemplate",
    value: function renderTemplate(templateElement, data) {
      var _this2 = this;

      return this.getImplementation_(templateElement).then(function (impl) {
        return _this2.render_(impl, data);
      });
    }
    /**
     * Renders the specified template element using the supplied data.
     * @param {!Element} templateElement
     * @param {!JsonObject} data
     * @return {!Promise<!Element>}
     */

  }, {
    key: "renderTemplateAsString",
    value: function renderTemplateAsString(templateElement, data) {
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
     */

  }, {
    key: "renderTemplateArray",
    value: function renderTemplateArray(templateElement, array) {
      var _this3 = this;

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
     */

  }, {
    key: "findAndRenderTemplate",
    value: function findAndRenderTemplate(parent, data, opt_querySelector) {
      return this.renderTemplate(this.findTemplate(parent, opt_querySelector), data);
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
     */

  }, {
    key: "findAndSetHtmlForTemplate",
    value: function findAndSetHtmlForTemplate(parent, html, opt_querySelector) {
      return this.setHtmlForTemplate(this.findTemplate(parent, opt_querySelector), html);
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
     */

  }, {
    key: "findAndRenderTemplateArray",
    value: function findAndRenderTemplateArray(parent, array, opt_querySelector) {
      return this.renderTemplateArray(this.findTemplate(parent, opt_querySelector), array);
    }
    /**
     * Detect if a template is present inside the parent.
     * @param {!Element} parent
     * @param {string=} opt_querySelector
     * @return {boolean}
     */

  }, {
    key: "hasTemplate",
    value: function hasTemplate(parent, opt_querySelector) {
      return !!this.maybeFindTemplate(parent, opt_querySelector);
    }
    /**
     * Find a specified template inside the parent. Fail if the template is
     * not present.
     * @param {!Element} parent
     * @param {string=} opt_querySelector
     * @return {!Element}
     */

  }, {
    key: "findTemplate",
    value: function findTemplate(parent, opt_querySelector) {
      var templateElement = this.maybeFindTemplate(parent, opt_querySelector);
      userAssert(templateElement, 'Template not found for %s', parent);
      var templateTagName = templateElement.tagName;
      userAssert(templateTagName == 'TEMPLATE' || templateTagName == 'SCRIPT' && templateElement.getAttribute('type') === 'text/plain', 'Template must be defined in a <template> or ' + '<script type="text/plain"> tag');
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
     */

  }, {
    key: "maybeFindTemplate",
    value: function maybeFindTemplate(parent, opt_querySelector) {
      var templateId = parent.getAttribute('template');

      if (templateId) {
        var rootNode =
        /** @type {!Document|!ShadowRoot} */
        rootNodeFor(parent);
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
     */

  }, {
    key: "getImplementation_",
    value: function getImplementation_(element) {
      var _this4 = this;

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

      promise = this.waitForTemplateClass_(element, type).then(function (templateClass) {
        // This is ugly workaround for https://github.com/google/closure-compiler/issues/2630.
        var Constr =
        /** @type {function(new:Object, !Element, !Window)} */
        templateClass;
        var impl = element[PROP_] = new Constr(element, _this4.ampdoc_.win);
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
     */

  }, {
    key: "waitForTemplateClass_",
    value: function waitForTemplateClass_(element, type) {
      if (this.templateClassMap_[type]) {
        return this.templateClassMap_[type];
      }

      var deferred = new Deferred();
      var promise = deferred.promise,
          resolve = deferred.resolve;
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
     */

  }, {
    key: "registerTemplate_",
    value: function registerTemplate_(type, templateClass) {
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
     */

  }, {
    key: "render_",
    value: function render_(impl, data) {
      return impl.render(data);
    }
    /**
     * @param {!../base-template.BaseTemplate} impl
     * @param {string} html
     * @return {!Element|!Array<!Element>}
     * @private
     */

  }, {
    key: "setHtml_",
    value: function setHtml_(impl, html) {
      return impl.setHtml(html);
    }
  }]);

  return Templates;
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLWltcGwuanMiXSwibmFtZXMiOlsiRGVmZXJyZWQiLCJyb290Tm9kZUZvciIsInNjb3BlZFF1ZXJ5U2VsZWN0b3IiLCJ1c2VyQXNzZXJ0IiwiZ2V0U2VydmljZUZvckRvYyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJQUk9QXyIsIlBST1BfUFJPTUlTRV8iLCJFTVBUWV9GVU5DIiwiVGVtcGxhdGVzIiwiYW1wZG9jIiwiYW1wZG9jXyIsInRlbXBsYXRlQ2xhc3NNYXBfIiwidGVtcGxhdGVDbGFzc1Jlc29sdmVyc18iLCJ0ZW1wbGF0ZUVsZW1lbnQiLCJnZXRJbXBsZW1lbnRhdGlvbl8iLCJ0aGVuIiwiaHRtbCIsImltcGwiLCJzZXRIdG1sXyIsImRhdGEiLCJyZW5kZXJfIiwicmVuZGVyQXNTdHJpbmciLCJhcnJheSIsImxlbmd0aCIsIlByb21pc2UiLCJyZXNvbHZlIiwibWFwIiwiaXRlbSIsInBhcmVudCIsIm9wdF9xdWVyeVNlbGVjdG9yIiwicmVuZGVyVGVtcGxhdGUiLCJmaW5kVGVtcGxhdGUiLCJzZXRIdG1sRm9yVGVtcGxhdGUiLCJyZW5kZXJUZW1wbGF0ZUFycmF5IiwibWF5YmVGaW5kVGVtcGxhdGUiLCJ0ZW1wbGF0ZVRhZ05hbWUiLCJ0YWdOYW1lIiwiZ2V0QXR0cmlidXRlIiwidGVtcGxhdGVJZCIsInJvb3ROb2RlIiwiZ2V0RWxlbWVudEJ5SWQiLCJxdWVyeVNlbGVjdG9yIiwiZWxlbWVudCIsInR5cGUiLCJwcm9taXNlIiwid2FpdEZvclRlbXBsYXRlQ2xhc3NfIiwidGVtcGxhdGVDbGFzcyIsIkNvbnN0ciIsIndpbiIsImRlZmVycmVkIiwicmVzb2x2ZXIiLCJyZW5kZXIiLCJzZXRIdG1sIiwiaW5zdGFsbFRlbXBsYXRlc1NlcnZpY2VGb3JEb2MiLCJyZWdpc3RlckV4dGVuZGVkVGVtcGxhdGVGb3JEb2MiLCJ0ZW1wbGF0ZXNTZXJ2aWNlIiwicmVnaXN0ZXJUZW1wbGF0ZV8iLCJnZXRUZW1wbGF0ZUNsYXNz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QixJQUFSLEVBQWNFLElBQWQsRUFBb0I7QUFDbEIsYUFBT0YsSUFBSSxDQUFDa0MsTUFBTCxDQUFZaEMsSUFBWixDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaFNBO0FBQUE7QUFBQSxXQWlTRSxrQkFBU0YsSUFBVCxFQUFlRCxJQUFmLEVBQXFCO0FBQ25CLGFBQU9DLElBQUksQ0FBQ21DLE9BQUwsQ0FBYXBDLElBQWIsQ0FBUDtBQUNEO0FBblNIOztBQUFBO0FBQUE7O0FBc1NBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU3FDLDZCQUFULENBQXVDNUMsTUFBdkMsRUFBK0M7QUFDcERMLEVBQUFBLDRCQUE0QixDQUFDSyxNQUFELEVBQVMsV0FBVCxFQUFzQkQsU0FBdEIsQ0FBNUI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTOEMsOEJBQVQsQ0FBd0M3QyxNQUF4QyxFQUFnRGtDLElBQWhELEVBQXNERyxhQUF0RCxFQUFxRTtBQUMxRSxNQUFNUyxnQkFBZ0IsR0FBR3BELGdCQUFnQixDQUFDTSxNQUFELEVBQVMsV0FBVCxDQUF6QztBQUNBLFNBQU84QyxnQkFBZ0IsQ0FBQ0MsaUJBQWpCLENBQW1DYixJQUFuQyxFQUF5Q0csYUFBekMsQ0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU1csMEJBQVQsQ0FBb0NDLFNBQXBDLEVBQStDZixJQUEvQyxFQUFxRDtBQUMxRCxTQUFPZSxTQUFTLENBQUMvQyxpQkFBVixDQUE0QmdDLElBQTVCLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge3Jvb3ROb2RlRm9yfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtzY29wZWRRdWVyeVNlbGVjdG9yfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuXG5pbXBvcnQge3VzZXJBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge1xuICBnZXRTZXJ2aWNlRm9yRG9jLFxuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jLFxufSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIEZvciB0aGUgc2V0IG9mIGRlY2lzaW9ucyBtYWRlIG9uIHRlbXBsYXRpbmcgc2VlOlxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMXEtNU1QUUhuT0hMRl91TDdsUXNHWmR6dUJnclBUa0N5MlBkUlAtWUNiT3cvZWRpdCN9XG4gKi9cblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgUFJPUF8gPSAnX19BTVBfSU1QTF8nO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBQUk9QX1BST01JU0VfID0gJ19fQU1QX1dBSVRfJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oKX0gKi9cbmNvbnN0IEVNUFRZX0ZVTkMgPSAoKSA9PiB7fTtcblxuLyoqXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZXMge1xuICAvKiogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvYyAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5hbXBkb2NfID0gYW1wZG9jO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgZnJvbSB0ZW1wbGF0ZSB0eXBlIHRvIHRlbXBsYXRlJ3MgY2xhc3MgcHJvbWlzZS5cbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCAhUHJvbWlzZTx0eXBlb2YgLi4vYmFzZS10ZW1wbGF0ZS5CYXNlVGVtcGxhdGU+Pn1cbiAgICAgKi9cbiAgICB0aGlzLnRlbXBsYXRlQ2xhc3NNYXBfID0ge307XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBmcm9tIHRlbXBsYXRlIHR5cGUgdG8gdGVtcGxhdGUncyBjbGFzcyBwcm9taXNlLiBUaGlzIGlzIGEgdHJhbnNpZW50XG4gICAgICogc3RvcmFnZS4gQXMgc29vbiBhcyB0aGUgdGVtcGxhdGUgY2xhc3MgbG9hZGVkLCB0aGUgZW50cnkgaXMgcmVtb3ZlZC5cbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCBmdW5jdGlvbih0eXBlb2YgLi4vYmFzZS10ZW1wbGF0ZS5CYXNlVGVtcGxhdGUpPn1cbiAgICAgKi9cbiAgICB0aGlzLnRlbXBsYXRlQ2xhc3NSZXNvbHZlcnNfID0ge307XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRlbXBsYXRlIHRvIGJlIGZ1bGx5IGluaXRpYWxpemVkLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0ZW1wbGF0ZUVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICB3aGVuUmVhZHkodGVtcGxhdGVFbGVtZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW1wbGVtZW50YXRpb25fKHRlbXBsYXRlRWxlbWVudCkudGhlbihFTVBUWV9GVU5DKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnRzIHRoZSBzcGVjaWZpZWQgdGVtcGxhdGUgZWxlbWVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGVtcGxhdGVFbGVtZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCghRWxlbWVudHwhQXJyYXk8IUVsZW1lbnQ+KT59XG4gICAqL1xuICBzZXRIdG1sRm9yVGVtcGxhdGUodGVtcGxhdGVFbGVtZW50LCBodG1sKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW1wbGVtZW50YXRpb25fKHRlbXBsYXRlRWxlbWVudCkudGhlbigoaW1wbCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0SHRtbF8oaW1wbCwgaHRtbCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgc3BlY2lmaWVkIHRlbXBsYXRlIGVsZW1lbnQgdXNpbmcgdGhlIHN1cHBsaWVkIGRhdGEuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRlbXBsYXRlRWxlbWVudFxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBkYXRhXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFFbGVtZW50Pn1cbiAgICovXG4gIHJlbmRlclRlbXBsYXRlKHRlbXBsYXRlRWxlbWVudCwgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLmdldEltcGxlbWVudGF0aW9uXyh0ZW1wbGF0ZUVsZW1lbnQpLnRoZW4oKGltcGwpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcl8oaW1wbCwgZGF0YSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgc3BlY2lmaWVkIHRlbXBsYXRlIGVsZW1lbnQgdXNpbmcgdGhlIHN1cHBsaWVkIGRhdGEuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRlbXBsYXRlRWxlbWVudFxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBkYXRhXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFFbGVtZW50Pn1cbiAgICovXG4gIHJlbmRlclRlbXBsYXRlQXNTdHJpbmcodGVtcGxhdGVFbGVtZW50LCBkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW1wbGVtZW50YXRpb25fKHRlbXBsYXRlRWxlbWVudCkudGhlbigoaW1wbCkgPT4ge1xuICAgICAgcmV0dXJuIGltcGwucmVuZGVyQXNTdHJpbmcoZGF0YSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgc3BlY2lmaWVkIHRlbXBsYXRlIGVsZW1lbnQgdXNpbmcgdGhlIHN1cHBsaWVkIGFycmF5IG9mIGRhdGFcbiAgICogYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgcmVzdWx0aW5nIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0ZW1wbGF0ZUVsZW1lbnRcbiAgICogQHBhcmFtIHshQXJyYXk8IUpzb25PYmplY3Q+fSBhcnJheVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhQXJyYXk8IUVsZW1lbnQ+Pn1cbiAgICovXG4gIHJlbmRlclRlbXBsYXRlQXJyYXkodGVtcGxhdGVFbGVtZW50LCBhcnJheSkge1xuICAgIGlmIChhcnJheS5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldEltcGxlbWVudGF0aW9uXyh0ZW1wbGF0ZUVsZW1lbnQpLnRoZW4oKGltcGwpID0+IHtcbiAgICAgIHJldHVybiBhcnJheS5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyXyhpbXBsLCBpdGVtKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc2NvdmVycyB0aGUgdGVtcGxhdGUgZm9yIHRoZSBzcGVjaWZpZWQgcGFyZW50IGFuZCByZW5kZXJzIGl0IHVzaW5nIHRoZVxuICAgKiBzdXBwbGllZCBkYXRhLiBUaGUgdGVtcGxhdGUgY2FuIGJlIHNwZWNpZmllZCBlaXRoZXIgdmlhIFwidGVtcGxhdGVcIlxuICAgKiBhdHRyaWJ1dGUgIG9yIGFzIGEgY2hpbGQgXCJ0ZW1wbGF0ZVwiIGVsZW1lbnQuIFdoZW4gc3BlY2lmaWVkIHZpYSBcInRlbXBsYXRlXCJcbiAgICogYXR0cmlidXRlLCB0aGUgdmFsdWUgaW5kaWNhdGVzIHRoZSBJRCBvZiB0aGUgdGVtcGxhdGUgZWxlbWVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50XG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGRhdGFcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfcXVlcnlTZWxlY3RvclxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhRWxlbWVudD59XG4gICAqL1xuICBmaW5kQW5kUmVuZGVyVGVtcGxhdGUocGFyZW50LCBkYXRhLCBvcHRfcXVlcnlTZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgdGhpcy5maW5kVGVtcGxhdGUocGFyZW50LCBvcHRfcXVlcnlTZWxlY3RvciksXG4gICAgICBkYXRhXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb3ZlcnMgdGhlIGFscmVhZHkgcmVuZGVyZWQgdGVtcGxhdGUgZm9yIHRoZSBzcGVjaWZpZWQgcGFyZW50IGFuZFxuICAgKiBpbnNlcnRzIGl0IGluIHRoZSBET00uIFRoZSB0ZW1wbGF0ZSBjYW4gYmUgc3BlY2lmaWVkIGVpdGhlciB2aWEgXCJ0ZW1wbGF0ZVwiXG4gICAqIGF0dHJpYnV0ZSAgb3IgYXMgYSBjaGlsZCBcInRlbXBsYXRlXCIgZWxlbWVudC4gV2hlbiBzcGVjaWZpZWQgdmlhIFwidGVtcGxhdGVcIlxuICAgKiBhdHRyaWJ1dGUsIHRoZSB2YWx1ZSBpbmRpY2F0ZXMgdGhlIElEIG9mIHRoZSB0ZW1wbGF0ZSBlbGVtZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWxcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfcXVlcnlTZWxlY3RvclxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwoIUVsZW1lbnR8IUFycmF5PCFFbGVtZW50Pik+fVxuICAgKi9cbiAgZmluZEFuZFNldEh0bWxGb3JUZW1wbGF0ZShwYXJlbnQsIGh0bWwsIG9wdF9xdWVyeVNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0SHRtbEZvclRlbXBsYXRlKFxuICAgICAgdGhpcy5maW5kVGVtcGxhdGUocGFyZW50LCBvcHRfcXVlcnlTZWxlY3RvciksXG4gICAgICBodG1sXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb3ZlcnMgdGhlIHRlbXBsYXRlIGZvciB0aGUgc3BlY2lmaWVkIHBhcmVudCBhbmQgcmVuZGVycyBpdCB1c2luZyB0aGVcbiAgICogc3VwcGxpZWQgYXJyYXkgb2YgZGF0YS4gVGhlIHRlbXBsYXRlIGNhbiBiZSBzcGVjaWZpZWQgZWl0aGVyIHZpYSBcInRlbXBsYXRlXCJcbiAgICogYXR0cmlidXRlIG9yIGFzIGEgY2hpbGQgXCJ0ZW1wbGF0ZVwiIGVsZW1lbnQuIFdoZW4gc3BlY2lmaWVkIHZpYSBcInRlbXBsYXRlXCJcbiAgICogYXR0cmlidXRlLCB0aGUgdmFsdWUgaW5kaWNhdGVzIHRoZSBJRCBvZiB0aGUgdGVtcGxhdGUgZWxlbWVudC4gUmV0dXJuc1xuICAgKiB0aGUgYXJyYXkgb2YgdGhlIHJlbmRlcmVkIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnRcbiAgICogQHBhcmFtIHshQXJyYXk8IUpzb25PYmplY3Q+fSBhcnJheVxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdF9xdWVyeVNlbGVjdG9yXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFBcnJheTwhRWxlbWVudD4+fVxuICAgKi9cbiAgZmluZEFuZFJlbmRlclRlbXBsYXRlQXJyYXkocGFyZW50LCBhcnJheSwgb3B0X3F1ZXJ5U2VsZWN0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJUZW1wbGF0ZUFycmF5KFxuICAgICAgdGhpcy5maW5kVGVtcGxhdGUocGFyZW50LCBvcHRfcXVlcnlTZWxlY3RvciksXG4gICAgICBhcnJheVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZWN0IGlmIGEgdGVtcGxhdGUgaXMgcHJlc2VudCBpbnNpZGUgdGhlIHBhcmVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3F1ZXJ5U2VsZWN0b3JcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc1RlbXBsYXRlKHBhcmVudCwgb3B0X3F1ZXJ5U2VsZWN0b3IpIHtcbiAgICByZXR1cm4gISF0aGlzLm1heWJlRmluZFRlbXBsYXRlKHBhcmVudCwgb3B0X3F1ZXJ5U2VsZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYSBzcGVjaWZpZWQgdGVtcGxhdGUgaW5zaWRlIHRoZSBwYXJlbnQuIEZhaWwgaWYgdGhlIHRlbXBsYXRlIGlzXG4gICAqIG5vdCBwcmVzZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnRcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfcXVlcnlTZWxlY3RvclxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICovXG4gIGZpbmRUZW1wbGF0ZShwYXJlbnQsIG9wdF9xdWVyeVNlbGVjdG9yKSB7XG4gICAgY29uc3QgdGVtcGxhdGVFbGVtZW50ID0gdGhpcy5tYXliZUZpbmRUZW1wbGF0ZShwYXJlbnQsIG9wdF9xdWVyeVNlbGVjdG9yKTtcbiAgICB1c2VyQXNzZXJ0KHRlbXBsYXRlRWxlbWVudCwgJ1RlbXBsYXRlIG5vdCBmb3VuZCBmb3IgJXMnLCBwYXJlbnQpO1xuICAgIGNvbnN0IHRlbXBsYXRlVGFnTmFtZSA9IHRlbXBsYXRlRWxlbWVudC50YWdOYW1lO1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICB0ZW1wbGF0ZVRhZ05hbWUgPT0gJ1RFTVBMQVRFJyB8fFxuICAgICAgICAodGVtcGxhdGVUYWdOYW1lID09ICdTQ1JJUFQnICYmXG4gICAgICAgICAgdGVtcGxhdGVFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpID09PSAndGV4dC9wbGFpbicpLFxuICAgICAgJ1RlbXBsYXRlIG11c3QgYmUgZGVmaW5lZCBpbiBhIDx0ZW1wbGF0ZT4gb3IgJyArXG4gICAgICAgICc8c2NyaXB0IHR5cGU9XCJ0ZXh0L3BsYWluXCI+IHRhZydcbiAgICApO1xuICAgIHJldHVybiB0ZW1wbGF0ZUVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhIHNwZWNpZmllZCB0ZW1wbGF0ZSBpbnNpZGUgdGhlIHBhcmVudC4gUmV0dXJucyBudWxsIGlmIG5vdCBwcmVzZW50LlxuICAgKiBUaGUgdGVtcGxhdGUgY2FuIGJlIHNwZWNpZmllZCBlaXRoZXIgdmlhIFwidGVtcGxhdGVcIiBhdHRyaWJ1dGUgb3IgYXMgYVxuICAgKiBjaGlsZCBcInRlbXBsYXRlXCIgZWxlbWVudC4gV2hlbiBzcGVjaWZpZWQgdmlhIFwidGVtcGxhdGVcIiBhdHRyaWJ1dGUsXG4gICAqIHRoZSB2YWx1ZSBpbmRpY2F0ZXMgdGhlIElEIG9mIHRoZSB0ZW1wbGF0ZSBlbGVtZW50LiBUaGUgdGVtcGxhdGVcbiAgICogY2FuIGJlIGRlZmluZWQgZWl0aGVyIHZpYSB0aGUgPHRlbXBsYXRlPiBvciA8c2NyaXB0PiB0YWcuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhcmVudFxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdF9xdWVyeVNlbGVjdG9yXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKi9cbiAgbWF5YmVGaW5kVGVtcGxhdGUocGFyZW50LCBvcHRfcXVlcnlTZWxlY3Rvcikge1xuICAgIGNvbnN0IHRlbXBsYXRlSWQgPSBwYXJlbnQuZ2V0QXR0cmlidXRlKCd0ZW1wbGF0ZScpO1xuICAgIGlmICh0ZW1wbGF0ZUlkKSB7XG4gICAgICBjb25zdCByb290Tm9kZSA9IC8qKiBAdHlwZSB7IURvY3VtZW50fCFTaGFkb3dSb290fSAqLyAoXG4gICAgICAgIHJvb3ROb2RlRm9yKHBhcmVudClcbiAgICAgICk7XG4gICAgICByZXR1cm4gcm9vdE5vZGUuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGVJZCk7XG4gICAgfSBlbHNlIGlmIChvcHRfcXVlcnlTZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIHNjb3BlZFF1ZXJ5U2VsZWN0b3IocGFyZW50LCBvcHRfcXVlcnlTZWxlY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwYXJlbnQucXVlcnlTZWxlY3RvcigndGVtcGxhdGVbdHlwZV0sIHNjcmlwdFt0eXBlPVwidGV4dC9wbGFpblwiXScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9taXNlIHRoYXQgd2lsbCBldmVudHVhbGx5IHlpZWxkIHRoZSB0ZW1wbGF0ZSBpbXBsZW1lbnRhdGlvblxuICAgKiBmb3IgdGhlIHNwZWNpZmllZCB0ZW1wbGF0ZSBlbGVtZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlPCEuLi9iYXNlLXRlbXBsYXRlLkJhc2VUZW1wbGF0ZT59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRJbXBsZW1lbnRhdGlvbl8oZWxlbWVudCkge1xuICAgIC8qKiBAY29uc3QgeyEuLi9iYXNlLXRlbXBsYXRlLkJhc2VUZW1wbGF0ZX0gKi9cbiAgICBjb25zdCBpbXBsID0gZWxlbWVudFtQUk9QX107XG4gICAgaWYgKGltcGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaW1wbCk7XG4gICAgfVxuXG4gICAgbGV0IHR5cGUgPSAnJztcbiAgICBjb25zdCB7dGFnTmFtZX0gPSBlbGVtZW50O1xuICAgIGlmICh0YWdOYW1lID09ICdURU1QTEFURScpIHtcbiAgICAgIHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpO1xuICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PSAnU0NSSVBUJykge1xuICAgICAgdHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0ZW1wbGF0ZScpO1xuICAgIH1cbiAgICB1c2VyQXNzZXJ0KHR5cGUsICdUeXBlIG11c3QgYmUgc3BlY2lmaWVkOiAlcycsIGVsZW1lbnQpO1xuXG4gICAgbGV0IHByb21pc2UgPSBlbGVtZW50W1BST1BfUFJPTUlTRV9dO1xuICAgIGlmIChwcm9taXNlKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBwcm9taXNlID0gdGhpcy53YWl0Rm9yVGVtcGxhdGVDbGFzc18oZWxlbWVudCwgdHlwZSkudGhlbihcbiAgICAgICh0ZW1wbGF0ZUNsYXNzKSA9PiB7XG4gICAgICAgIC8vIFRoaXMgaXMgdWdseSB3b3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL2Nsb3N1cmUtY29tcGlsZXIvaXNzdWVzLzI2MzAuXG4gICAgICAgIGNvbnN0IENvbnN0ciA9IC8qKiBAdHlwZSB7ZnVuY3Rpb24obmV3Ok9iamVjdCwgIUVsZW1lbnQsICFXaW5kb3cpfSAqLyAoXG4gICAgICAgICAgdGVtcGxhdGVDbGFzc1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBpbXBsID0gKGVsZW1lbnRbUFJPUF9dID0gbmV3IENvbnN0cihlbGVtZW50LCB0aGlzLmFtcGRvY18ud2luKSk7XG4gICAgICAgIGRlbGV0ZSBlbGVtZW50W1BST1BfUFJPTUlTRV9dO1xuICAgICAgICByZXR1cm4gaW1wbDtcbiAgICAgIH1cbiAgICApO1xuICAgIGVsZW1lbnRbUFJPUF9QUk9NSVNFX10gPSBwcm9taXNlO1xuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb21pc2UgdGhhdCB3aWxsIGV2ZW50dWFsbHkgeWllbGQgdGhlIHRlbXBsYXRlIGNsYXNzLiBUaGlzXG4gICAqIHdpbGwgd2FpdCB1bnRpbCB0aGUgYWN0dWFsIHRlbXBsYXRlIHNjcmlwdCBoYXMgYmVlbiBkb3dubG9hZGVkIGFuZCBwYXJzZWQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQHJldHVybiB7IVByb21pc2U8dHlwZW9mIC4uL2Jhc2UtdGVtcGxhdGUuQmFzZVRlbXBsYXRlPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHdhaXRGb3JUZW1wbGF0ZUNsYXNzXyhlbGVtZW50LCB0eXBlKSB7XG4gICAgaWYgKHRoaXMudGVtcGxhdGVDbGFzc01hcF9bdHlwZV0pIHtcbiAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlQ2xhc3NNYXBfW3R5cGVdO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gICAgY29uc3Qge3Byb21pc2UsIHJlc29sdmV9ID0gZGVmZXJyZWQ7XG5cbiAgICB0aGlzLnRlbXBsYXRlQ2xhc3NNYXBfW3R5cGVdID0gcHJvbWlzZTtcbiAgICB0aGlzLnRlbXBsYXRlQ2xhc3NSZXNvbHZlcnNfW3R5cGVdID0gcmVzb2x2ZTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gZXh0ZW5kZWQgdGVtcGxhdGUuIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHR5cGljYWxseSBiZSBjYWxsZWRcbiAgICogdGhyb3VnaCB0aGUgcmVnaXN0ZXJUZW1wbGF0ZSBtZXRob2Qgb24gdGhlIEFNUCBydW50aW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0ge3R5cGVvZiAuLi9iYXNlLXRlbXBsYXRlLkJhc2VUZW1wbGF0ZX0gdGVtcGxhdGVDbGFzc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmVzdHJpY3RlZFxuICAgKi9cbiAgcmVnaXN0ZXJUZW1wbGF0ZV8odHlwZSwgdGVtcGxhdGVDbGFzcykge1xuICAgIGlmICghdGhpcy50ZW1wbGF0ZUNsYXNzTWFwX1t0eXBlXSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZUNsYXNzTWFwX1t0eXBlXSA9IFByb21pc2UucmVzb2x2ZSh0ZW1wbGF0ZUNsYXNzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVzb2x2ZXIgPSB0aGlzLnRlbXBsYXRlQ2xhc3NSZXNvbHZlcnNfW3R5cGVdO1xuICAgICAgdXNlckFzc2VydChyZXNvbHZlciwgJ0R1cGxpY2F0ZSB0ZW1wbGF0ZSB0eXBlOiAlcycsIHR5cGUpO1xuICAgICAgZGVsZXRlIHRoaXMudGVtcGxhdGVDbGFzc1Jlc29sdmVyc19bdHlwZV07XG4gICAgICByZXNvbHZlcih0ZW1wbGF0ZUNsYXNzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vYmFzZS10ZW1wbGF0ZS5CYXNlVGVtcGxhdGV9IGltcGxcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gZGF0YVxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlbmRlcl8oaW1wbCwgZGF0YSkge1xuICAgIHJldHVybiBpbXBsLnJlbmRlcihkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi9iYXNlLXRlbXBsYXRlLkJhc2VUZW1wbGF0ZX0gaW1wbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICAgKiBAcmV0dXJuIHshRWxlbWVudHwhQXJyYXk8IUVsZW1lbnQ+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0SHRtbF8oaW1wbCwgaHRtbCkge1xuICAgIHJldHVybiBpbXBsLnNldEh0bWwoaHRtbCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVGVtcGxhdGVzU2VydmljZUZvckRvYyhhbXBkb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhhbXBkb2MsICd0ZW1wbGF0ZXMnLCBUZW1wbGF0ZXMpO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBleHRlbmRlZCB0ZW1wbGF0ZS4gVGhpcyBmdW5jdGlvbiBzaG91bGQgdHlwaWNhbGx5IGJlIGNhbGxlZFxuICogdGhyb3VnaCB0aGUgcmVnaXN0ZXJUZW1wbGF0ZSBtZXRob2Qgb24gdGhlIEFNUCBydW50aW1lLlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7dHlwZW9mIC4uL2Jhc2UtdGVtcGxhdGUuQmFzZVRlbXBsYXRlfSB0ZW1wbGF0ZUNsYXNzXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckV4dGVuZGVkVGVtcGxhdGVGb3JEb2MoYW1wZG9jLCB0eXBlLCB0ZW1wbGF0ZUNsYXNzKSB7XG4gIGNvbnN0IHRlbXBsYXRlc1NlcnZpY2UgPSBnZXRTZXJ2aWNlRm9yRG9jKGFtcGRvYywgJ3RlbXBsYXRlcycpO1xuICByZXR1cm4gdGVtcGxhdGVzU2VydmljZS5yZWdpc3RlclRlbXBsYXRlXyh0eXBlLCB0ZW1wbGF0ZUNsYXNzKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFUZW1wbGF0ZXN9IHRlbXBsYXRlc1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4geyFQcm9taXNlPHR5cGVvZiAuLi9iYXNlLXRlbXBsYXRlLkJhc2VUZW1wbGF0ZT58dW5kZWZpbmVkfVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZW1wbGF0ZUNsYXNzRm9yVGVzdGluZyh0ZW1wbGF0ZXMsIHR5cGUpIHtcbiAgcmV0dXJuIHRlbXBsYXRlcy50ZW1wbGF0ZUNsYXNzTWFwX1t0eXBlXTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/template-impl.js