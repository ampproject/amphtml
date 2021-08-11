function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { BaseTemplate } from "../../../src/base-template";
import { Purifier } from "../../../src/purifier";
import { dict } from "../../../src/core/types/object";
import { getService, registerServiceBuilder } from "../../../src/service-helpers";
import { iterateCursor, templateContentClone } from "../../../src/core/dom";
import { rewriteAttributeValue } from "../../../src/url-rewrite";
import { user } from "../../../src/log";
import mustache from "../../../third_party/mustache/mustache";
var TAG = 'amp-mustache';

/**
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @visibleForTesting
 */
export var AmpMustache = /*#__PURE__*/function (_BaseTemplate) {
  _inherits(AmpMustache, _BaseTemplate);

  var _super = _createSuper(AmpMustache);

  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  function AmpMustache(element, win) {
    var _this;

    _classCallCheck(this, AmpMustache);

    _this = _super.call(this, element, win);
    registerServiceBuilder(win, 'purifier', function () {
      return new Purifier(win.document, dict(), rewriteAttributeValue);
    });

    /** @private @const {!Purifier} */
    _this.purifier_ = getService(win, 'purifier');
    // Unescaped templating (triple mustache) has a special, strict sanitizer.
    mustache.setUnescapedSanitizer(function (value) {
      return _this.purifier_.purifyTagsForTripleMustache(value);
    });
    return _this;
  }

  /** @override */
  _createClass(AmpMustache, [{
    key: "compileCallback",
    value: function compileCallback() {
      // If viewer is renderTemplate capable, skip the handling of the mustache
      // templates as its rendering is managed by the viewer. This template will
      // only be responsible for sanitizing and inserting it into the DOM.
      if (this.viewerCanRenderTemplates()) {
        return;
      }

      /** @private @const {!JsonObject} */
      this.nestedTemplates_ = dict();

      /** @private @const {string} */
      this.template_ = this.initTemplateString_();

      try {
        mustache.parse(this.template_,
        /* tags */
        undefined);
      } catch (err) {
        user().error(TAG, err.message, this.element);
      }
    }
    /**
     * @private
     * @return {string}
     */

  }, {
    key: "initTemplateString_",
    value: function initTemplateString_() {
      if (this.element.tagName == 'TEMPLATE') {
        var content = templateContentClone(this.element);
        this.processNestedTemplates_(content);
        var container = this.element.ownerDocument.createElement('div');
        container.appendChild(content);
        return container.
        /*OK*/
        innerHTML;
      } else if (this.element.tagName == 'SCRIPT') {
        return this.element.textContent;
      }

      return '';
    }
    /**
     * Stores and replaces nested templates with custom triple-mustache pointers.
     *
     * This prevents the outer-most template from replacing variables in nested
     * templates. Note that this constrains nested template markup to the more
     * restrictive sanitization rules of triple-mustache.
     *
     * @param {!DocumentFragment} content
     */

  }, {
    key: "processNestedTemplates_",
    value: function processNestedTemplates_(content) {
      var _this2 = this;

      var templates = content.querySelectorAll('template');
      iterateCursor(templates, function (template, index) {
        var key = "__AMP_NESTED_TEMPLATE_" + index;
        // Store the nested template markup, keyed by index.
        _this2.nestedTemplates_[key] = template.
        /*OK*/
        outerHTML;

        // Replace the markup with a pointer.
        var pointer = _this2.element.ownerDocument.createTextNode("{{{" + key + "}}}");

        template.parentNode.replaceChild(pointer, template);
      });
    }
    /** @override */

  }, {
    key: "setHtml",
    value: function setHtml(html) {
      var wrapped = "<div>" + html + "</div>";
      var purified = this.tryUnwrap(this.purifyAndSetHtml_(wrapped));
      return this.unwrapChildren(purified);
    }
    /** @override */

  }, {
    key: "render",
    value: function render(data) {
      return this.tryUnwrap(this.render_(data));
    }
    /** @override */

  }, {
    key: "renderAsString",
    value: function renderAsString(data) {
      return this.render_(data).
      /*OK*/
      innerHTML;
    }
    /**
     * @param {!JsonObject|string} data
     * @return {!Element}
     * @private
     */

  }, {
    key: "render_",
    value: function render_(data) {
      var mustacheData = data;

      // Also render any nested templates.
      if (typeof data === 'object') {
        mustacheData = _extends({}, data, this.nestedTemplates_);
      }

      var html = mustache.render(this.template_, mustacheData,
      /* partials */
      undefined);
      return this.purifyAndSetHtml_(html);
    }
    /**
     * @param {string} html
     * @return {!Element}
     * @private
     */

  }, {
    key: "purifyAndSetHtml_",
    value: function purifyAndSetHtml_(html) {
      var body = this.purifier_.purifyHtml("<div>" + html + "</div>");
      return body.firstElementChild;
    }
  }]);

  return AmpMustache;
}(BaseTemplate);
AMP.extension(TAG, '0.2', function (AMP) {
  AMP.registerTemplate(TAG, AmpMustache);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1tdXN0YWNoZS5qcyJdLCJuYW1lcyI6WyJCYXNlVGVtcGxhdGUiLCJQdXJpZmllciIsImRpY3QiLCJnZXRTZXJ2aWNlIiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlciIsIml0ZXJhdGVDdXJzb3IiLCJ0ZW1wbGF0ZUNvbnRlbnRDbG9uZSIsInJld3JpdGVBdHRyaWJ1dGVWYWx1ZSIsInVzZXIiLCJtdXN0YWNoZSIsIlRBRyIsIkFtcE11c3RhY2hlIiwiZWxlbWVudCIsIndpbiIsImRvY3VtZW50IiwicHVyaWZpZXJfIiwic2V0VW5lc2NhcGVkU2FuaXRpemVyIiwidmFsdWUiLCJwdXJpZnlUYWdzRm9yVHJpcGxlTXVzdGFjaGUiLCJ2aWV3ZXJDYW5SZW5kZXJUZW1wbGF0ZXMiLCJuZXN0ZWRUZW1wbGF0ZXNfIiwidGVtcGxhdGVfIiwiaW5pdFRlbXBsYXRlU3RyaW5nXyIsInBhcnNlIiwidW5kZWZpbmVkIiwiZXJyIiwiZXJyb3IiLCJtZXNzYWdlIiwidGFnTmFtZSIsImNvbnRlbnQiLCJwcm9jZXNzTmVzdGVkVGVtcGxhdGVzXyIsImNvbnRhaW5lciIsIm93bmVyRG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJpbm5lckhUTUwiLCJ0ZXh0Q29udGVudCIsInRlbXBsYXRlcyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJ0ZW1wbGF0ZSIsImluZGV4Iiwia2V5Iiwib3V0ZXJIVE1MIiwicG9pbnRlciIsImNyZWF0ZVRleHROb2RlIiwicGFyZW50Tm9kZSIsInJlcGxhY2VDaGlsZCIsImh0bWwiLCJ3cmFwcGVkIiwicHVyaWZpZWQiLCJ0cnlVbndyYXAiLCJwdXJpZnlBbmRTZXRIdG1sXyIsInVud3JhcENoaWxkcmVuIiwiZGF0YSIsInJlbmRlcl8iLCJtdXN0YWNoZURhdGEiLCJyZW5kZXIiLCJib2R5IiwicHVyaWZ5SHRtbCIsImZpcnN0RWxlbWVudENoaWxkIiwiQU1QIiwiZXh0ZW5zaW9uIiwicmVnaXN0ZXJUZW1wbGF0ZSJdLCJt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UUFBQUEsWUFBWSxnQkFBT0YsSUFBUCxFQUFnQixLQUFLakMsZ0JBQXJCLENBQVo7QUFDRDs7QUFDRCxVQUFNMkIsSUFBSSxHQUFHdEMsUUFBUSxDQUFDK0MsTUFBVCxDQUNYLEtBQUtuQyxTQURNLEVBRVhrQyxZQUZXO0FBR1g7QUFBZS9CLE1BQUFBLFNBSEosQ0FBYjtBQUtBLGFBQU8sS0FBSzJCLGlCQUFMLENBQXVCSixJQUF2QixDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTFIQTtBQUFBO0FBQUEsV0EySEUsMkJBQWtCQSxJQUFsQixFQUF3QjtBQUN0QixVQUFNVSxJQUFJLEdBQUcsS0FBSzFDLFNBQUwsQ0FBZTJDLFVBQWYsV0FBa0NYLElBQWxDLFlBQWI7QUFDQSxhQUFPVSxJQUFJLENBQUNFLGlCQUFaO0FBQ0Q7QUE5SEg7O0FBQUE7QUFBQSxFQUFpQzNELFlBQWpDO0FBaUlBNEQsR0FBRyxDQUFDQyxTQUFKLENBQWNuRCxHQUFkLEVBQW1CLEtBQW5CLEVBQTBCLFVBQVVrRCxHQUFWLEVBQWU7QUFDdkNBLEVBQUFBLEdBQUcsQ0FBQ0UsZ0JBQUosQ0FBcUJwRCxHQUFyQixFQUEwQkMsV0FBMUI7QUFDRCxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7QmFzZVRlbXBsYXRlfSBmcm9tICcuLi8uLi8uLi9zcmMvYmFzZS10ZW1wbGF0ZSc7XG5pbXBvcnQge1B1cmlmaWVyfSBmcm9tICcjcHVyaWZpZXInO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlLCByZWdpc3RlclNlcnZpY2VCdWlsZGVyfSBmcm9tICcuLi8uLi8uLi9zcmMvc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7aXRlcmF0ZUN1cnNvciwgdGVtcGxhdGVDb250ZW50Q2xvbmV9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge3Jld3JpdGVBdHRyaWJ1dGVWYWx1ZX0gZnJvbSAnLi4vLi4vLi4vc3JjL3VybC1yZXdyaXRlJztcbmltcG9ydCB7dXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQgbXVzdGFjaGUgZnJvbSAnI3RoaXJkX3BhcnR5L211c3RhY2hlL211c3RhY2hlJztcblxuY29uc3QgVEFHID0gJ2FtcC1tdXN0YWNoZSc7XG5cbi8qKlxuICogSW1wbGVtZW50cyBhbiBBTVAgdGVtcGxhdGUgZm9yIE11c3RhY2hlLmpzLlxuICogU2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy99LlxuICpcbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgQW1wTXVzdGFjaGUgZXh0ZW5kcyBCYXNlVGVtcGxhdGUge1xuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgd2luKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgd2luKTtcblxuICAgIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXIod2luLCAncHVyaWZpZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFB1cmlmaWVyKHdpbi5kb2N1bWVudCwgZGljdCgpLCByZXdyaXRlQXR0cmlidXRlVmFsdWUpO1xuICAgIH0pO1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFQdXJpZmllcn0gKi9cbiAgICB0aGlzLnB1cmlmaWVyXyA9IGdldFNlcnZpY2Uod2luLCAncHVyaWZpZXInKTtcblxuICAgIC8vIFVuZXNjYXBlZCB0ZW1wbGF0aW5nICh0cmlwbGUgbXVzdGFjaGUpIGhhcyBhIHNwZWNpYWwsIHN0cmljdCBzYW5pdGl6ZXIuXG4gICAgbXVzdGFjaGUuc2V0VW5lc2NhcGVkU2FuaXRpemVyKCh2YWx1ZSkgPT5cbiAgICAgIHRoaXMucHVyaWZpZXJfLnB1cmlmeVRhZ3NGb3JUcmlwbGVNdXN0YWNoZSh2YWx1ZSlcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjb21waWxlQ2FsbGJhY2soKSB7XG4gICAgLy8gSWYgdmlld2VyIGlzIHJlbmRlclRlbXBsYXRlIGNhcGFibGUsIHNraXAgdGhlIGhhbmRsaW5nIG9mIHRoZSBtdXN0YWNoZVxuICAgIC8vIHRlbXBsYXRlcyBhcyBpdHMgcmVuZGVyaW5nIGlzIG1hbmFnZWQgYnkgdGhlIHZpZXdlci4gVGhpcyB0ZW1wbGF0ZSB3aWxsXG4gICAgLy8gb25seSBiZSByZXNwb25zaWJsZSBmb3Igc2FuaXRpemluZyBhbmQgaW5zZXJ0aW5nIGl0IGludG8gdGhlIERPTS5cbiAgICBpZiAodGhpcy52aWV3ZXJDYW5SZW5kZXJUZW1wbGF0ZXMoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshSnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLm5lc3RlZFRlbXBsYXRlc18gPSBkaWN0KCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG4gICAgdGhpcy50ZW1wbGF0ZV8gPSB0aGlzLmluaXRUZW1wbGF0ZVN0cmluZ18oKTtcblxuICAgIHRyeSB7XG4gICAgICBtdXN0YWNoZS5wYXJzZSh0aGlzLnRlbXBsYXRlXywgLyogdGFncyAqLyB1bmRlZmluZWQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdXNlcigpLmVycm9yKFRBRywgZXJyLm1lc3NhZ2UsIHRoaXMuZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGluaXRUZW1wbGF0ZVN0cmluZ18oKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudC50YWdOYW1lID09ICdURU1QTEFURScpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZUNvbnRlbnRDbG9uZSh0aGlzLmVsZW1lbnQpO1xuICAgICAgdGhpcy5wcm9jZXNzTmVzdGVkVGVtcGxhdGVzXyhjb250ZW50KTtcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lci4vKk9LKi8gaW5uZXJIVE1MO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbGVtZW50LnRhZ05hbWUgPT0gJ1NDUklQVCcpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3JlcyBhbmQgcmVwbGFjZXMgbmVzdGVkIHRlbXBsYXRlcyB3aXRoIGN1c3RvbSB0cmlwbGUtbXVzdGFjaGUgcG9pbnRlcnMuXG4gICAqXG4gICAqIFRoaXMgcHJldmVudHMgdGhlIG91dGVyLW1vc3QgdGVtcGxhdGUgZnJvbSByZXBsYWNpbmcgdmFyaWFibGVzIGluIG5lc3RlZFxuICAgKiB0ZW1wbGF0ZXMuIE5vdGUgdGhhdCB0aGlzIGNvbnN0cmFpbnMgbmVzdGVkIHRlbXBsYXRlIG1hcmt1cCB0byB0aGUgbW9yZVxuICAgKiByZXN0cmljdGl2ZSBzYW5pdGl6YXRpb24gcnVsZXMgb2YgdHJpcGxlLW11c3RhY2hlLlxuICAgKlxuICAgKiBAcGFyYW0geyFEb2N1bWVudEZyYWdtZW50fSBjb250ZW50XG4gICAqL1xuICBwcm9jZXNzTmVzdGVkVGVtcGxhdGVzXyhjb250ZW50KSB7XG4gICAgY29uc3QgdGVtcGxhdGVzID0gY29udGVudC5xdWVyeVNlbGVjdG9yQWxsKCd0ZW1wbGF0ZScpO1xuICAgIGl0ZXJhdGVDdXJzb3IodGVtcGxhdGVzLCAodGVtcGxhdGUsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBrZXkgPSBgX19BTVBfTkVTVEVEX1RFTVBMQVRFXyR7aW5kZXh9YDtcblxuICAgICAgLy8gU3RvcmUgdGhlIG5lc3RlZCB0ZW1wbGF0ZSBtYXJrdXAsIGtleWVkIGJ5IGluZGV4LlxuICAgICAgdGhpcy5uZXN0ZWRUZW1wbGF0ZXNfW2tleV0gPSB0ZW1wbGF0ZS4vKk9LKi8gb3V0ZXJIVE1MO1xuXG4gICAgICAvLyBSZXBsYWNlIHRoZSBtYXJrdXAgd2l0aCBhIHBvaW50ZXIuXG4gICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYHt7eyR7a2V5fX19fWApO1xuICAgICAgdGVtcGxhdGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocG9pbnRlciwgdGVtcGxhdGUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZXRIdG1sKGh0bWwpIHtcbiAgICBjb25zdCB3cmFwcGVkID0gYDxkaXY+JHtodG1sfTwvZGl2PmA7XG4gICAgY29uc3QgcHVyaWZpZWQgPSB0aGlzLnRyeVVud3JhcCh0aGlzLnB1cmlmeUFuZFNldEh0bWxfKHdyYXBwZWQpKTtcbiAgICByZXR1cm4gdGhpcy51bndyYXBDaGlsZHJlbihwdXJpZmllZCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlbmRlcihkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMudHJ5VW53cmFwKHRoaXMucmVuZGVyXyhkYXRhKSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlbmRlckFzU3RyaW5nKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJfKGRhdGEpLi8qT0sqLyBpbm5lckhUTUw7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdHxzdHJpbmd9IGRhdGFcbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW5kZXJfKGRhdGEpIHtcbiAgICBsZXQgbXVzdGFjaGVEYXRhID0gZGF0YTtcbiAgICAvLyBBbHNvIHJlbmRlciBhbnkgbmVzdGVkIHRlbXBsYXRlcy5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICBtdXN0YWNoZURhdGEgPSB7Li4uZGF0YSwgLi4udGhpcy5uZXN0ZWRUZW1wbGF0ZXNffTtcbiAgICB9XG4gICAgY29uc3QgaHRtbCA9IG11c3RhY2hlLnJlbmRlcihcbiAgICAgIHRoaXMudGVtcGxhdGVfLFxuICAgICAgbXVzdGFjaGVEYXRhLFxuICAgICAgLyogcGFydGlhbHMgKi8gdW5kZWZpbmVkXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5wdXJpZnlBbmRTZXRIdG1sXyhodG1sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHB1cmlmeUFuZFNldEh0bWxfKGh0bWwpIHtcbiAgICBjb25zdCBib2R5ID0gdGhpcy5wdXJpZmllcl8ucHVyaWZ5SHRtbChgPGRpdj4ke2h0bWx9PC9kaXY+YCk7XG4gICAgcmV0dXJuIGJvZHkuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIH1cbn1cblxuQU1QLmV4dGVuc2lvbihUQUcsICcwLjInLCBmdW5jdGlvbiAoQU1QKSB7XG4gIEFNUC5yZWdpc3RlclRlbXBsYXRlKFRBRywgQW1wTXVzdGFjaGUpO1xufSk7XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-mustache/0.2/amp-mustache.js