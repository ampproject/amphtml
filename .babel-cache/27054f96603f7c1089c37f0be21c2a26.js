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
import { AmpAdUIHandler } from "./amp-ad-ui";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { LayoutPriority, isLayoutSizeDefined } from "../../../src/core/dom/layout";
import { Services } from "../../../src/service";
import { addParamToUrl } from "../../../src/url";
import { childElementByTag, closestAncestorElementBySelector } from "../../../src/core/dom/query";
import { hasOwn } from "../../../src/core/types/object";
import { removeChildren } from "../../../src/core/dom";
import { userAssert } from "../../../src/log";

/** @const {string} Tag name for custom ad implementation. */
export var TAG_AD_CUSTOM = 'amp-ad-custom';

/** @type {Object} A map of promises for each value of data-url. The promise
 *  will fetch data for the URL for the ad server, and return it as a map of
 *  objects, keyed by slot; each object contains the variables to be
 *   substituted into the mustache template. */
var ampCustomadXhrPromises = {};

/** @type {Object} a map of full urls (i.e. including the ampslots parameter)
 * for each value of data-url */
var ampCustomadFullUrls = null;
export var AmpAdCustom = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpAdCustom, _AMP$BaseElement);

  var _super = _createSuper(AmpAdCustom);

  /** @param {!AmpElement} element */
  function AmpAdCustom(element) {
    var _this;

    _classCallCheck(this, AmpAdCustom);

    _this = _super.call(this, element);

    /** @private {?string} The base URL of the ad server for this ad */
    _this.url_ = null;

    /** @private {?string} A string identifying this ad slot: the server's
     *  responses will be keyed by slot */
    _this.slot_ = null;

    /** @type {?AmpAdUIHandler} */
    _this.uiHandler = null;
    return _this;
  }

  /** @override */
  _createClass(AmpAdCustom, [{
    key: "getLayoutPriority",
    value: function getLayoutPriority() {
      // Since this is AMPHTML we are trusting that it will load responsibly
      return LayoutPriority.CONTENT;
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      // TODO: Add proper support for more layouts, and figure out which ones
      // we're permitting
      return isLayoutSizeDefined(layout);
    }
    /**
     * Builds AmpAdUIHandler callback
     */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      this.url_ = this.element.getAttribute('data-url');
      this.slot_ = this.element.getAttribute('data-slot');
      // Ensure that the slot value is legal
      userAssert(this.slot_ === null || this.slot_.match(/^[0-9a-z]+$/), 'custom ad slot should be alphanumeric: ' + this.slot_);
      var urlService = Services.urlForDoc(this.element);
      userAssert(this.url_ && urlService.isSecure(this.url_), 'custom ad url must be an HTTPS URL');
      this.uiHandler = new AmpAdUIHandler(this);
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this2 = this;

      /** @const {string} fullUrl */
      var fullUrl = this.getFullUrl_();
      // if we have cached the response, find it, otherwise fetch
      var responsePromise = ampCustomadXhrPromises[fullUrl] || Services.xhrFor(this.win).fetchJson(fullUrl).then(function (res) {
        return res.json();
      });

      if (this.slot_ !== null) {
        // Cache this response if using `data-slot` feature so only one request
        // is made per url
        ampCustomadXhrPromises[fullUrl] = responsePromise;
      }

      return responsePromise.then(function (data) {
        // We will get here when the data has been fetched from the server
        var templateData = data;

        if (_this2.slot_ !== null) {
          templateData = hasOwn(data, _this2.slot_) ? data[_this2.slot_] : null;
        }

        if (!templateData || typeof templateData != 'object') {
          _this2.uiHandler.applyNoContentUI();

          return;
        }

        templateData = _this2.handleTemplateData_(
        /** @type {!JsonObject} */
        templateData);

        _this2.renderStarted();

        try {
          Services.templatesForDoc(_this2.element).findAndRenderTemplate(_this2.element, templateData).then(function (renderedElement) {
            // Get here when the template has been rendered Clear out the
            // child template and replace it by the rendered version Note that
            // we can't clear templates that's not ad's child because they
            // maybe used by other ad component.
            removeChildren(_this2.element);

            _this2.element.appendChild(renderedElement);

            _this2.signals().signal(CommonSignals.INI_LOAD);
          });
        } catch (e) {
          _this2.uiHandler.applyNoContentUI();
        }
      });
    }
    /**
     * Handles the template data response.
     * There are two types of templateData format
     * Format option 1
     * {
     *   'templateId': {},
     *   'vars': {},
     *   'data': {
     *     'a': '1',
     *     'b': '2'
     *   }
     * }
     * or format option 2
     * {
     *  'a': '1',
     *  'b': '2'
     * }
     * if `templateId` or `vars` are not specified.
     *
     * @param {!JsonObject} templateData
     * @return {!JsonObject}
     */

  }, {
    key: "handleTemplateData_",
    value: function handleTemplateData_(templateData) {
      if (childElementByTag(this.element, 'template')) {
        // Need to check for template attribute if it's allowed in amp-ad tag
        return templateData;
      }

      // If use remote template specified by response
      userAssert(templateData['templateId'], 'TemplateId not specified');
      userAssert(templateData['data'] && typeof templateData['data'] == 'object', 'Template data not specified');
      this.element.setAttribute('template', templateData['templateId']);

      if (templateData['vars'] && typeof templateData['vars'] == 'object') {
        // Support for vars
        var vars = templateData['vars'];
        var keys = Object.keys(vars);

        for (var i = 0; i < keys.length; i++) {
          var attrName = 'data-vars-' + keys[i];

          try {
            this.element.setAttribute(attrName, vars[keys[i]]);
          } catch (e) {
            this.user().error(TAG_AD_CUSTOM, 'Fail to set attribute: ', e);
          }
        }
      }

      return templateData['data'];
    }
    /** @override  */

  }, {
    key: "unlayoutCallback",
    value: function unlayoutCallback() {
      this.uiHandler.applyUnlayoutUI();
      return true;
    }
    /**
     * @private getFullUrl_ Get a URL which includes a parameter indicating
     * all slots to be fetched from this web server URL
     * @return {string} The URL with the "ampslots" parameter appended
     */

  }, {
    key: "getFullUrl_",
    value: function getFullUrl_() {
      // If this ad doesn't have a slot defined, just return the base URL
      if (this.slot_ === null) {
        return userAssert(this.url_);
      }

      if (ampCustomadFullUrls === null) {
        // The array of ad urls has not yet been built, do so now.
        ampCustomadFullUrls = {};
        var slots = {};
        // Get the parent body of this amp-ad element. It could be the body of
        // the main document, or it could be an enclosing iframe.
        var body = closestAncestorElementBySelector(this.element, 'BODY');
        var elements = body.querySelectorAll('amp-ad[type=custom]');

        for (var index = 0; index < elements.length; index++) {
          var elem = elements[index];
          var url = elem.getAttribute('data-url');
          var slotId = elem.getAttribute('data-slot');

          if (slotId !== null) {
            if (!(url in slots)) {
              slots[url] = [];
            }

            slots[url].push(encodeURIComponent(slotId));
          }
        }

        for (var baseUrl in slots) {
          ampCustomadFullUrls[baseUrl] = addParamToUrl(baseUrl, 'ampslots', slots[baseUrl].join(','));
        }
      }

      return ampCustomadFullUrls[this.url_];
    }
  }]);

  return AmpAdCustom;
}(AMP.BaseElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hZC1jdXN0b20uanMiXSwibmFtZXMiOlsiQW1wQWRVSUhhbmRsZXIiLCJDb21tb25TaWduYWxzIiwiTGF5b3V0UHJpb3JpdHkiLCJpc0xheW91dFNpemVEZWZpbmVkIiwiU2VydmljZXMiLCJhZGRQYXJhbVRvVXJsIiwiY2hpbGRFbGVtZW50QnlUYWciLCJjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvciIsImhhc093biIsInJlbW92ZUNoaWxkcmVuIiwidXNlckFzc2VydCIsIlRBR19BRF9DVVNUT00iLCJhbXBDdXN0b21hZFhoclByb21pc2VzIiwiYW1wQ3VzdG9tYWRGdWxsVXJscyIsIkFtcEFkQ3VzdG9tIiwiZWxlbWVudCIsInVybF8iLCJzbG90XyIsInVpSGFuZGxlciIsIkNPTlRFTlQiLCJsYXlvdXQiLCJnZXRBdHRyaWJ1dGUiLCJtYXRjaCIsInVybFNlcnZpY2UiLCJ1cmxGb3JEb2MiLCJpc1NlY3VyZSIsImZ1bGxVcmwiLCJnZXRGdWxsVXJsXyIsInJlc3BvbnNlUHJvbWlzZSIsInhockZvciIsIndpbiIsImZldGNoSnNvbiIsInRoZW4iLCJyZXMiLCJqc29uIiwiZGF0YSIsInRlbXBsYXRlRGF0YSIsImFwcGx5Tm9Db250ZW50VUkiLCJoYW5kbGVUZW1wbGF0ZURhdGFfIiwicmVuZGVyU3RhcnRlZCIsInRlbXBsYXRlc0ZvckRvYyIsImZpbmRBbmRSZW5kZXJUZW1wbGF0ZSIsInJlbmRlcmVkRWxlbWVudCIsImFwcGVuZENoaWxkIiwic2lnbmFscyIsInNpZ25hbCIsIklOSV9MT0FEIiwiZSIsInNldEF0dHJpYnV0ZSIsInZhcnMiLCJrZXlzIiwiT2JqZWN0IiwiaSIsImxlbmd0aCIsImF0dHJOYW1lIiwidXNlciIsImVycm9yIiwiYXBwbHlVbmxheW91dFVJIiwic2xvdHMiLCJib2R5IiwiZWxlbWVudHMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaW5kZXgiLCJlbGVtIiwidXJsIiwic2xvdElkIiwicHVzaCIsImVuY29kZVVS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QUFhLEVBQWI7QUFDRDs7QUFDRE4sWUFBQUEsS0FBSyxDQUFDTSxHQUFELENBQUwsQ0FBV0UsSUFBWCxDQUFnQkMsa0JBQWtCLENBQUNGLE1BQUQsQ0FBbEM7QUFDRDtBQUNGOztBQUNELGFBQUssSUFBTUcsT0FBWCxJQUFzQlYsS0FBdEIsRUFBNkI7QUFDM0I3QyxVQUFBQSxtQkFBbUIsQ0FBQ3VELE9BQUQsQ0FBbkIsR0FBK0IvRCxhQUFhLENBQzFDK0QsT0FEMEMsRUFFMUMsVUFGMEMsRUFHMUNWLEtBQUssQ0FBQ1UsT0FBRCxDQUFMLENBQWVDLElBQWYsQ0FBb0IsR0FBcEIsQ0FIMEMsQ0FBNUM7QUFLRDtBQUNGOztBQUNELGFBQU94RCxtQkFBbUIsQ0FBQyxLQUFLRyxJQUFOLENBQTFCO0FBQ0Q7QUF4TUg7O0FBQUE7QUFBQSxFQUFpQ3NELEdBQUcsQ0FBQ0MsV0FBckMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtBbXBBZFVJSGFuZGxlcn0gZnJvbSAnLi9hbXAtYWQtdWknO1xuaW1wb3J0IHtDb21tb25TaWduYWxzfSBmcm9tICcjY29yZS9jb25zdGFudHMvY29tbW9uLXNpZ25hbHMnO1xuaW1wb3J0IHtMYXlvdXRQcmlvcml0eSwgaXNMYXlvdXRTaXplRGVmaW5lZH0gZnJvbSAnI2NvcmUvZG9tL2xheW91dCc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2FkZFBhcmFtVG9Vcmx9IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuaW1wb3J0IHtcbiAgY2hpbGRFbGVtZW50QnlUYWcsXG4gIGNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yLFxufSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtoYXNPd259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3JlbW92ZUNoaWxkcmVufSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHt1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSBUYWcgbmFtZSBmb3IgY3VzdG9tIGFkIGltcGxlbWVudGF0aW9uLiAqL1xuZXhwb3J0IGNvbnN0IFRBR19BRF9DVVNUT00gPSAnYW1wLWFkLWN1c3RvbSc7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSBBIG1hcCBvZiBwcm9taXNlcyBmb3IgZWFjaCB2YWx1ZSBvZiBkYXRhLXVybC4gVGhlIHByb21pc2VcbiAqICB3aWxsIGZldGNoIGRhdGEgZm9yIHRoZSBVUkwgZm9yIHRoZSBhZCBzZXJ2ZXIsIGFuZCByZXR1cm4gaXQgYXMgYSBtYXAgb2ZcbiAqICBvYmplY3RzLCBrZXllZCBieSBzbG90OyBlYWNoIG9iamVjdCBjb250YWlucyB0aGUgdmFyaWFibGVzIHRvIGJlXG4gKiAgIHN1YnN0aXR1dGVkIGludG8gdGhlIG11c3RhY2hlIHRlbXBsYXRlLiAqL1xuY29uc3QgYW1wQ3VzdG9tYWRYaHJQcm9taXNlcyA9IHt9O1xuXG4vKiogQHR5cGUge09iamVjdH0gYSBtYXAgb2YgZnVsbCB1cmxzIChpLmUuIGluY2x1ZGluZyB0aGUgYW1wc2xvdHMgcGFyYW1ldGVyKVxuICogZm9yIGVhY2ggdmFsdWUgb2YgZGF0YS11cmwgKi9cbmxldCBhbXBDdXN0b21hZEZ1bGxVcmxzID0gbnVsbDtcblxuZXhwb3J0IGNsYXNzIEFtcEFkQ3VzdG9tIGV4dGVuZHMgQU1QLkJhc2VFbGVtZW50IHtcbiAgLyoqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnQgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgIC8qKiBAcHJpdmF0ZSB7P3N0cmluZ30gVGhlIGJhc2UgVVJMIG9mIHRoZSBhZCBzZXJ2ZXIgZm9yIHRoaXMgYWQgKi9cbiAgICB0aGlzLnVybF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/c3RyaW5nfSBBIHN0cmluZyBpZGVudGlmeWluZyB0aGlzIGFkIHNsb3Q6IHRoZSBzZXJ2ZXInc1xuICAgICAqICByZXNwb25zZXMgd2lsbCBiZSBrZXllZCBieSBzbG90ICovXG4gICAgdGhpcy5zbG90XyA9IG51bGw7XG5cbiAgICAvKiogQHR5cGUgez9BbXBBZFVJSGFuZGxlcn0gKi9cbiAgICB0aGlzLnVpSGFuZGxlciA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldExheW91dFByaW9yaXR5KCkge1xuICAgIC8vIFNpbmNlIHRoaXMgaXMgQU1QSFRNTCB3ZSBhcmUgdHJ1c3RpbmcgdGhhdCBpdCB3aWxsIGxvYWQgcmVzcG9uc2libHlcbiAgICByZXR1cm4gTGF5b3V0UHJpb3JpdHkuQ09OVEVOVDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNMYXlvdXRTdXBwb3J0ZWQobGF5b3V0KSB7XG4gICAgLy8gVE9ETzogQWRkIHByb3BlciBzdXBwb3J0IGZvciBtb3JlIGxheW91dHMsIGFuZCBmaWd1cmUgb3V0IHdoaWNoIG9uZXNcbiAgICAvLyB3ZSdyZSBwZXJtaXR0aW5nXG4gICAgcmV0dXJuIGlzTGF5b3V0U2l6ZURlZmluZWQobGF5b3V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgQW1wQWRVSUhhbmRsZXIgY2FsbGJhY2tcbiAgICovXG4gIGJ1aWxkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy51cmxfID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKTtcbiAgICB0aGlzLnNsb3RfID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zbG90Jyk7XG4gICAgLy8gRW5zdXJlIHRoYXQgdGhlIHNsb3QgdmFsdWUgaXMgbGVnYWxcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgdGhpcy5zbG90XyA9PT0gbnVsbCB8fCB0aGlzLnNsb3RfLm1hdGNoKC9eWzAtOWEtel0rJC8pLFxuICAgICAgJ2N1c3RvbSBhZCBzbG90IHNob3VsZCBiZSBhbHBoYW51bWVyaWM6ICcgKyB0aGlzLnNsb3RfXG4gICAgKTtcblxuICAgIGNvbnN0IHVybFNlcnZpY2UgPSBTZXJ2aWNlcy51cmxGb3JEb2ModGhpcy5lbGVtZW50KTtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgdGhpcy51cmxfICYmIHVybFNlcnZpY2UuaXNTZWN1cmUodGhpcy51cmxfKSxcbiAgICAgICdjdXN0b20gYWQgdXJsIG11c3QgYmUgYW4gSFRUUFMgVVJMJ1xuICAgICk7XG5cbiAgICB0aGlzLnVpSGFuZGxlciA9IG5ldyBBbXBBZFVJSGFuZGxlcih0aGlzKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbGF5b3V0Q2FsbGJhY2soKSB7XG4gICAgLyoqIEBjb25zdCB7c3RyaW5nfSBmdWxsVXJsICovXG4gICAgY29uc3QgZnVsbFVybCA9IHRoaXMuZ2V0RnVsbFVybF8oKTtcbiAgICAvLyBpZiB3ZSBoYXZlIGNhY2hlZCB0aGUgcmVzcG9uc2UsIGZpbmQgaXQsIG90aGVyd2lzZSBmZXRjaFxuICAgIGNvbnN0IHJlc3BvbnNlUHJvbWlzZSA9XG4gICAgICBhbXBDdXN0b21hZFhoclByb21pc2VzW2Z1bGxVcmxdIHx8XG4gICAgICBTZXJ2aWNlcy54aHJGb3IodGhpcy53aW4pXG4gICAgICAgIC5mZXRjaEpzb24oZnVsbFVybClcbiAgICAgICAgLnRoZW4oKHJlcykgPT4gcmVzLmpzb24oKSk7XG4gICAgaWYgKHRoaXMuc2xvdF8gIT09IG51bGwpIHtcbiAgICAgIC8vIENhY2hlIHRoaXMgcmVzcG9uc2UgaWYgdXNpbmcgYGRhdGEtc2xvdGAgZmVhdHVyZSBzbyBvbmx5IG9uZSByZXF1ZXN0XG4gICAgICAvLyBpcyBtYWRlIHBlciB1cmxcbiAgICAgIGFtcEN1c3RvbWFkWGhyUHJvbWlzZXNbZnVsbFVybF0gPSByZXNwb25zZVByb21pc2U7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZVByb21pc2UudGhlbigoZGF0YSkgPT4ge1xuICAgICAgLy8gV2Ugd2lsbCBnZXQgaGVyZSB3aGVuIHRoZSBkYXRhIGhhcyBiZWVuIGZldGNoZWQgZnJvbSB0aGUgc2VydmVyXG4gICAgICBsZXQgdGVtcGxhdGVEYXRhID0gZGF0YTtcbiAgICAgIGlmICh0aGlzLnNsb3RfICE9PSBudWxsKSB7XG4gICAgICAgIHRlbXBsYXRlRGF0YSA9IGhhc093bihkYXRhLCB0aGlzLnNsb3RfKSA/IGRhdGFbdGhpcy5zbG90X10gOiBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRlbXBsYXRlRGF0YSB8fCB0eXBlb2YgdGVtcGxhdGVEYXRhICE9ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMudWlIYW5kbGVyLmFwcGx5Tm9Db250ZW50VUkoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0ZW1wbGF0ZURhdGEgPSB0aGlzLmhhbmRsZVRlbXBsYXRlRGF0YV8oXG4gICAgICAgIC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovICh0ZW1wbGF0ZURhdGEpXG4gICAgICApO1xuXG4gICAgICB0aGlzLnJlbmRlclN0YXJ0ZWQoKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgU2VydmljZXMudGVtcGxhdGVzRm9yRG9jKHRoaXMuZWxlbWVudClcbiAgICAgICAgICAuZmluZEFuZFJlbmRlclRlbXBsYXRlKHRoaXMuZWxlbWVudCwgdGVtcGxhdGVEYXRhKVxuICAgICAgICAgIC50aGVuKChyZW5kZXJlZEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIC8vIEdldCBoZXJlIHdoZW4gdGhlIHRlbXBsYXRlIGhhcyBiZWVuIHJlbmRlcmVkIENsZWFyIG91dCB0aGVcbiAgICAgICAgICAgIC8vIGNoaWxkIHRlbXBsYXRlIGFuZCByZXBsYWNlIGl0IGJ5IHRoZSByZW5kZXJlZCB2ZXJzaW9uIE5vdGUgdGhhdFxuICAgICAgICAgICAgLy8gd2UgY2FuJ3QgY2xlYXIgdGVtcGxhdGVzIHRoYXQncyBub3QgYWQncyBjaGlsZCBiZWNhdXNlIHRoZXlcbiAgICAgICAgICAgIC8vIG1heWJlIHVzZWQgYnkgb3RoZXIgYWQgY29tcG9uZW50LlxuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRyZW4odGhpcy5lbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChyZW5kZXJlZEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzKCkuc2lnbmFsKENvbW1vblNpZ25hbHMuSU5JX0xPQUQpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLnVpSGFuZGxlci5hcHBseU5vQ29udGVudFVJKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgdGVtcGxhdGUgZGF0YSByZXNwb25zZS5cbiAgICogVGhlcmUgYXJlIHR3byB0eXBlcyBvZiB0ZW1wbGF0ZURhdGEgZm9ybWF0XG4gICAqIEZvcm1hdCBvcHRpb24gMVxuICAgKiB7XG4gICAqICAgJ3RlbXBsYXRlSWQnOiB7fSxcbiAgICogICAndmFycyc6IHt9LFxuICAgKiAgICdkYXRhJzoge1xuICAgKiAgICAgJ2EnOiAnMScsXG4gICAqICAgICAnYic6ICcyJ1xuICAgKiAgIH1cbiAgICogfVxuICAgKiBvciBmb3JtYXQgb3B0aW9uIDJcbiAgICoge1xuICAgKiAgJ2EnOiAnMScsXG4gICAqICAnYic6ICcyJ1xuICAgKiB9XG4gICAqIGlmIGB0ZW1wbGF0ZUlkYCBvciBgdmFyc2AgYXJlIG5vdCBzcGVjaWZpZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHRlbXBsYXRlRGF0YVxuICAgKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAgICovXG4gIGhhbmRsZVRlbXBsYXRlRGF0YV8odGVtcGxhdGVEYXRhKSB7XG4gICAgaWYgKGNoaWxkRWxlbWVudEJ5VGFnKHRoaXMuZWxlbWVudCwgJ3RlbXBsYXRlJykpIHtcbiAgICAgIC8vIE5lZWQgdG8gY2hlY2sgZm9yIHRlbXBsYXRlIGF0dHJpYnV0ZSBpZiBpdCdzIGFsbG93ZWQgaW4gYW1wLWFkIHRhZ1xuICAgICAgcmV0dXJuIHRlbXBsYXRlRGF0YTtcbiAgICB9XG5cbiAgICAvLyBJZiB1c2UgcmVtb3RlIHRlbXBsYXRlIHNwZWNpZmllZCBieSByZXNwb25zZVxuICAgIHVzZXJBc3NlcnQodGVtcGxhdGVEYXRhWyd0ZW1wbGF0ZUlkJ10sICdUZW1wbGF0ZUlkIG5vdCBzcGVjaWZpZWQnKTtcblxuICAgIHVzZXJBc3NlcnQoXG4gICAgICB0ZW1wbGF0ZURhdGFbJ2RhdGEnXSAmJiB0eXBlb2YgdGVtcGxhdGVEYXRhWydkYXRhJ10gPT0gJ29iamVjdCcsXG4gICAgICAnVGVtcGxhdGUgZGF0YSBub3Qgc3BlY2lmaWVkJ1xuICAgICk7XG5cbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCd0ZW1wbGF0ZScsIHRlbXBsYXRlRGF0YVsndGVtcGxhdGVJZCddKTtcblxuICAgIGlmICh0ZW1wbGF0ZURhdGFbJ3ZhcnMnXSAmJiB0eXBlb2YgdGVtcGxhdGVEYXRhWyd2YXJzJ10gPT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIFN1cHBvcnQgZm9yIHZhcnNcbiAgICAgIGNvbnN0IHZhcnMgPSB0ZW1wbGF0ZURhdGFbJ3ZhcnMnXTtcbiAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh2YXJzKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBhdHRyTmFtZSA9ICdkYXRhLXZhcnMtJyArIGtleXNbaV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgdmFyc1trZXlzW2ldXSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB0aGlzLnVzZXIoKS5lcnJvcihUQUdfQURfQ1VTVE9NLCAnRmFpbCB0byBzZXQgYXR0cmlidXRlOiAnLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0ZW1wbGF0ZURhdGFbJ2RhdGEnXTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgICovXG4gIHVubGF5b3V0Q2FsbGJhY2soKSB7XG4gICAgdGhpcy51aUhhbmRsZXIuYXBwbHlVbmxheW91dFVJKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGUgZ2V0RnVsbFVybF8gR2V0IGEgVVJMIHdoaWNoIGluY2x1ZGVzIGEgcGFyYW1ldGVyIGluZGljYXRpbmdcbiAgICogYWxsIHNsb3RzIHRvIGJlIGZldGNoZWQgZnJvbSB0aGlzIHdlYiBzZXJ2ZXIgVVJMXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIFVSTCB3aXRoIHRoZSBcImFtcHNsb3RzXCIgcGFyYW1ldGVyIGFwcGVuZGVkXG4gICAqL1xuICBnZXRGdWxsVXJsXygpIHtcbiAgICAvLyBJZiB0aGlzIGFkIGRvZXNuJ3QgaGF2ZSBhIHNsb3QgZGVmaW5lZCwganVzdCByZXR1cm4gdGhlIGJhc2UgVVJMXG4gICAgaWYgKHRoaXMuc2xvdF8gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1c2VyQXNzZXJ0KHRoaXMudXJsXyk7XG4gICAgfVxuICAgIGlmIChhbXBDdXN0b21hZEZ1bGxVcmxzID09PSBudWxsKSB7XG4gICAgICAvLyBUaGUgYXJyYXkgb2YgYWQgdXJscyBoYXMgbm90IHlldCBiZWVuIGJ1aWx0LCBkbyBzbyBub3cuXG4gICAgICBhbXBDdXN0b21hZEZ1bGxVcmxzID0ge307XG4gICAgICBjb25zdCBzbG90cyA9IHt9O1xuXG4gICAgICAvLyBHZXQgdGhlIHBhcmVudCBib2R5IG9mIHRoaXMgYW1wLWFkIGVsZW1lbnQuIEl0IGNvdWxkIGJlIHRoZSBib2R5IG9mXG4gICAgICAvLyB0aGUgbWFpbiBkb2N1bWVudCwgb3IgaXQgY291bGQgYmUgYW4gZW5jbG9zaW5nIGlmcmFtZS5cbiAgICAgIGNvbnN0IGJvZHkgPSBjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3Rvcih0aGlzLmVsZW1lbnQsICdCT0RZJyk7XG4gICAgICBjb25zdCBlbGVtZW50cyA9IGJvZHkucXVlcnlTZWxlY3RvckFsbCgnYW1wLWFkW3R5cGU9Y3VzdG9tXScpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGVsZW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBlbGVtID0gZWxlbWVudHNbaW5kZXhdO1xuICAgICAgICBjb25zdCB1cmwgPSBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKTtcbiAgICAgICAgY29uc3Qgc2xvdElkID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2xvdCcpO1xuICAgICAgICBpZiAoc2xvdElkICE9PSBudWxsKSB7XG4gICAgICAgICAgaWYgKCEodXJsIGluIHNsb3RzKSkge1xuICAgICAgICAgICAgc2xvdHNbdXJsXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzbG90c1t1cmxdLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KHNsb3RJZCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGJhc2VVcmwgaW4gc2xvdHMpIHtcbiAgICAgICAgYW1wQ3VzdG9tYWRGdWxsVXJsc1tiYXNlVXJsXSA9IGFkZFBhcmFtVG9VcmwoXG4gICAgICAgICAgYmFzZVVybCxcbiAgICAgICAgICAnYW1wc2xvdHMnLFxuICAgICAgICAgIHNsb3RzW2Jhc2VVcmxdLmpvaW4oJywnKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYW1wQ3VzdG9tYWRGdWxsVXJsc1t0aGlzLnVybF9dO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-ad/0.1/amp-ad-custom.js