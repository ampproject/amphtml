import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

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
import { CSS } from "../../../build/amp-social-share-0.1.css";
import { Keys } from "../../../src/core/constants/key-codes";
import { Services } from "../../../src/service";
import { addParamsToUrl } from "../../../src/url";
import { dev, devAssert, user, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getDataParamsFromAttributes } from "../../../src/core/dom";
import { getSocialConfig } from "./amp-social-share-config";
import { openWindowDialog } from "../../../src/open-window-dialog";
import { parseQueryString } from "../../../src/core/types/string/url";
import { toggle } from "../../../src/core/dom/style";
var TAG = 'amp-social-share';

var AmpSocialShare = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpSocialShare, _AMP$BaseElement);

  var _super = _createSuper(AmpSocialShare);

  /** @param {!AmpElement} element */
  function AmpSocialShare(element) {
    var _this;

    _classCallCheck(this, AmpSocialShare);

    _this = _super.call(this, element);

    /** @private {?string} */
    _this.shareEndpoint_ = null;

    /** @private @const {!JsonObject} */
    _this.params_ = dict();

    /** @private {?../../../src/service/platform-impl.Platform} */
    _this.platform_ = null;

    /** @private {?string} */
    _this.href_ = null;

    /** @private {?string} */
    _this.target_ = null;

    /** @private {?Array<string>} */
    _this.bindingVars_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpSocialShare, [{
    key: "isLayoutSupported",
    value: function isLayoutSupported() {
      return true;
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      var _this2 = this;

      var element = this.element;
      var typeAttr = userAssert(element.getAttribute('type'), 'The type attribute is required. %s', element);
      userAssert(!/\s/.test(typeAttr), 'Space characters are not allowed in type attribute value. %s', element);
      this.platform_ = Services.platformFor(this.win);
      var systemShareSupported = ('share' in this.win.navigator);

      if (typeAttr === 'system') {
        // Hide/ignore system component if navigator.share unavailable
        if (!systemShareSupported) {
          toggle(element, false);
          return;
        }
      } else {
        // Hide/ignore non-system component if system share wants to be unique
        var systemOnly = systemShareSupported && !!this.win.document.querySelectorAll('amp-social-share[type=system][data-mode=replace]').length;

        if (systemOnly) {
          toggle(element, false);
          return;
        }
      }

      var typeConfig = getSocialConfig(typeAttr) || dict();

      if (typeConfig['obsolete']) {
        toggle(element, false);
        user().warn(TAG, "Skipping obsolete share button " + typeAttr);
        return;
      }

      this.shareEndpoint_ = userAssert(element.getAttribute('data-share-endpoint') || typeConfig['shareEndpoint'], 'The data-share-endpoint attribute is required. %s', element);
      Object.assign(this.params_, typeConfig['defaultParams'], getDataParamsFromAttributes(element));
      this.bindingVars_ = typeConfig['bindings'];
      element.setAttribute('role', 'button');

      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }

      if (!element.getAttribute('aria-label')) {
        element.setAttribute('aria-label', "Share by " + typeAttr);
      }

      element.addEventListener('click', function () {
        return _this2.handleClick_();
      });
      element.addEventListener('keydown', this.handleKeyPress_.bind(this));
      element.classList.add("amp-social-share-" + typeAttr);
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this3 = this;

      // Do not layout if the component returns before
      // this.shareEndpoint_ is resolved from buildCallback.
      if (!this.shareEndpoint_) {
        return _resolvedPromise();
      }

      var hrefWithVars = addParamsToUrl(dev().assertString(this.shareEndpoint_), this.params_);
      var urlReplacements = Services.urlReplacementsForDoc(this.element);
      var bindings = {};

      if (this.bindingVars_) {
        this.bindingVars_.forEach(function (name) {
          var bindingName = name.toUpperCase();
          bindings[bindingName] = _this3.params_[name];
        });
      }

      return urlReplacements.expandUrlAsync(hrefWithVars, bindings).then(function (href) {
        _this3.href_ = href;

        // mailto:, sms: protocols breaks when opened in _blank on iOS Safari
        var _Services$urlForDoc$p = Services.urlForDoc(_this3.element).parse(href),
            protocol = _Services$urlForDoc$p.protocol;

        var isMailTo = protocol === 'mailto:';
        var isSms = protocol === 'sms:';
        _this3.target_ = _this3.platform_.isIos() && (isMailTo || isSms) ? '_top' : _this3.element.hasAttribute('data-target') ? _this3.element.getAttribute('data-target') : '_blank';

        if (isSms) {
          // http://stackoverflow.com/a/19126326
          // This code path seems to be stable for both iOS and Android.
          _this3.href_ = _this3.href_.replace('?', '?&');
        }
      });
    }
    /**
     * Handle key presses on the element.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "handleKeyPress_",
    value: function handleKeyPress_(event) {
      var key = event.key;

      if (key == Keys.SPACE || key == Keys.ENTER) {
        event.preventDefault();
        this.handleActivation_();
      }
    }
    /**
     * Handle clicks on the element.
     * @private
     */

  }, {
    key: "handleClick_",
    value: function handleClick_() {
      this.handleActivation_();
    }
    /** @private */

  }, {
    key: "handleActivation_",
    value: function handleActivation_() {
      userAssert(this.href_ && this.target_, 'Clicked before href is set.');
      var href = dev().assertString(this.href_);
      var target = dev().assertString(this.target_);

      if (this.shareEndpoint_ === 'navigator-share:') {
        var navigator = this.win.navigator;
        devAssert(navigator.share);
        var dataStr = href.substr(href.indexOf('?'));
        var data = parseQueryString(dataStr);
        // Spreading data into an Object since Chrome uses the Object prototype.
        // TODO:(crbug.com/1123689): Remove this workaround once WebKit fix is released.
        navigator.share(_extends({}, data)).catch(function (e) {
          user().warn(TAG, e.message, dataStr);
        });
      } else {
        var windowFeatures = 'resizable,scrollbars,width=640,height=480';
        openWindowDialog(this.win, href, target, windowFeatures);
      }
    }
  }], [{
    key: "prerenderAllowed",
    value:
    /** @override @nocollapse */
    function prerenderAllowed() {
      return true;
    }
  }]);

  return AmpSocialShare;
}(AMP.BaseElement);

AMP.extension('amp-social-share', '0.1', function (AMP) {
  AMP.registerElement('amp-social-share', AmpSocialShare, CSS);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zb2NpYWwtc2hhcmUuanMiXSwibmFtZXMiOlsiQ1NTIiwiS2V5cyIsIlNlcnZpY2VzIiwiYWRkUGFyYW1zVG9VcmwiLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwidXNlckFzc2VydCIsImRpY3QiLCJnZXREYXRhUGFyYW1zRnJvbUF0dHJpYnV0ZXMiLCJnZXRTb2NpYWxDb25maWciLCJvcGVuV2luZG93RGlhbG9nIiwicGFyc2VRdWVyeVN0cmluZyIsInRvZ2dsZSIsIlRBRyIsIkFtcFNvY2lhbFNoYXJlIiwiZWxlbWVudCIsInNoYXJlRW5kcG9pbnRfIiwicGFyYW1zXyIsInBsYXRmb3JtXyIsImhyZWZfIiwidGFyZ2V0XyIsImJpbmRpbmdWYXJzXyIsInR5cGVBdHRyIiwiZ2V0QXR0cmlidXRlIiwidGVzdCIsInBsYXRmb3JtRm9yIiwid2luIiwic3lzdGVtU2hhcmVTdXBwb3J0ZWQiLCJuYXZpZ2F0b3IiLCJzeXN0ZW1Pbmx5IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGVuZ3RoIiwidHlwZUNvbmZpZyIsIndhcm4iLCJPYmplY3QiLCJhc3NpZ24iLCJzZXRBdHRyaWJ1dGUiLCJoYXNBdHRyaWJ1dGUiLCJhZGRFdmVudExpc3RlbmVyIiwiaGFuZGxlQ2xpY2tfIiwiaGFuZGxlS2V5UHJlc3NfIiwiYmluZCIsImNsYXNzTGlzdCIsImFkZCIsImhyZWZXaXRoVmFycyIsImFzc2VydFN0cmluZyIsInVybFJlcGxhY2VtZW50cyIsInVybFJlcGxhY2VtZW50c0ZvckRvYyIsImJpbmRpbmdzIiwiZm9yRWFjaCIsIm5hbWUiLCJiaW5kaW5nTmFtZSIsInRvVXBwZXJDYXNlIiwiZXhwYW5kVXJsQXN5bmMiLCJ0aGVuIiwiaHJlZiIsInVybEZvckRvYyIsInBhcnNlIiwicHJvdG9jb2wiLCJpc01haWxUbyIsImlzU21zIiwiaXNJb3MiLCJyZXBsYWNlIiwiZXZlbnQiLCJrZXkiLCJTUEFDRSIsIkVOVEVSIiwicHJldmVudERlZmF1bHQiLCJoYW5kbGVBY3RpdmF0aW9uXyIsInRhcmdldCIsInNoYXJlIiwiZGF0YVN0ciIsInN1YnN0ciIsImluZGV4T2YiLCJkYXRhIiwiY2F0Y2giLCJlIiwibWVzc2FnZSIsIndpbmRvd0ZlYXR1cmVzIiwiQU1QIiwiQmFzZUVsZW1lbnQiLCJleHRlbnNpb24iLCJyZWdpc3RlckVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLEdBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLGNBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWIsRUFBd0JDLElBQXhCLEVBQThCQyxVQUE5QjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQywyQkFBUjtBQUNBLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLGdCQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUVBLElBQU1DLEdBQUcsR0FBRyxrQkFBWjs7SUFFTUMsYzs7Ozs7QUFNSjtBQUNBLDBCQUFZQyxPQUFaLEVBQXFCO0FBQUE7O0FBQUE7O0FBQ25CLDhCQUFNQSxPQUFOOztBQUNBO0FBQ0EsVUFBS0MsY0FBTCxHQUFzQixJQUF0Qjs7QUFFQTtBQUNBLFVBQUtDLE9BQUwsR0FBZVYsSUFBSSxFQUFuQjs7QUFFQTtBQUNBLFVBQUtXLFNBQUwsR0FBaUIsSUFBakI7O0FBRUE7QUFDQSxVQUFLQyxLQUFMLEdBQWEsSUFBYjs7QUFFQTtBQUNBLFVBQUtDLE9BQUwsR0FBZSxJQUFmOztBQUVBO0FBQ0EsVUFBS0MsWUFBTCxHQUFvQixJQUFwQjtBQWxCbUI7QUFtQnBCOztBQUVEOzs7V0FDQSw2QkFBb0I7QUFDbEIsYUFBTyxJQUFQO0FBQ0Q7QUFFRDs7OztXQUNBLHlCQUFnQjtBQUFBOztBQUNkLFVBQU9OLE9BQVAsR0FBa0IsSUFB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Q0FBQzZELE9BQUQsQ0FBN0I7QUFDQTtBQUNBO0FBQ0E1QyxRQUFBQSxTQUFTLENBQUMyQyxLQUFWLGNBQW9CSSxJQUFwQixHQUEyQkMsS0FBM0IsQ0FBaUMsVUFBQ0MsQ0FBRCxFQUFPO0FBQ3RDeEUsVUFBQUEsSUFBSSxHQUFHNkIsSUFBUCxDQUFZckIsR0FBWixFQUFpQmdFLENBQUMsQ0FBQ0MsT0FBbkIsRUFBNEJOLE9BQTVCO0FBQ0QsU0FGRDtBQUdELE9BVkQsTUFVTztBQUNMLFlBQU1PLGNBQWMsR0FBRywyQ0FBdkI7QUFDQXJFLFFBQUFBLGdCQUFnQixDQUFDLEtBQUtnQixHQUFOLEVBQVc4QixJQUFYLEVBQWlCYyxNQUFqQixFQUF5QlMsY0FBekIsQ0FBaEI7QUFDRDtBQUNGOzs7O0FBdExEO0FBQ0EsZ0NBQTBCO0FBQ3hCLGFBQU8sSUFBUDtBQUNEOzs7O0VBSjBCQyxHQUFHLENBQUNDLFc7O0FBMExqQ0QsR0FBRyxDQUFDRSxTQUFKLENBQWMsa0JBQWQsRUFBa0MsS0FBbEMsRUFBeUMsVUFBQ0YsR0FBRCxFQUFTO0FBQ2hEQSxFQUFBQSxHQUFHLENBQUNHLGVBQUosQ0FBb0Isa0JBQXBCLEVBQXdDckUsY0FBeEMsRUFBd0RmLEdBQXhEO0FBQ0QsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLXNvY2lhbC1zaGFyZS0wLjEuY3NzJztcbmltcG9ydCB7S2V5c30gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2tleS1jb2Rlcyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2FkZFBhcmFtc1RvVXJsfSBmcm9tICcuLi8uLi8uLi9zcmMvdXJsJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXREYXRhUGFyYW1zRnJvbUF0dHJpYnV0ZXN9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2dldFNvY2lhbENvbmZpZ30gZnJvbSAnLi9hbXAtc29jaWFsLXNoYXJlLWNvbmZpZyc7XG5pbXBvcnQge29wZW5XaW5kb3dEaWFsb2d9IGZyb20gJy4uLy4uLy4uL3NyYy9vcGVuLXdpbmRvdy1kaWFsb2cnO1xuaW1wb3J0IHtwYXJzZVF1ZXJ5U3RyaW5nfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvdXJsJztcbmltcG9ydCB7dG9nZ2xlfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG5jb25zdCBUQUcgPSAnYW1wLXNvY2lhbC1zaGFyZSc7XG5cbmNsYXNzIEFtcFNvY2lhbFNoYXJlIGV4dGVuZHMgQU1QLkJhc2VFbGVtZW50IHtcbiAgLyoqIEBvdmVycmlkZSBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgcHJlcmVuZGVyQWxsb3dlZCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50ICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50KTtcbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd9ICovXG4gICAgdGhpcy5zaGFyZUVuZHBvaW50XyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshSnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLnBhcmFtc18gPSBkaWN0KCk7XG5cbiAgICAvKiogQHByaXZhdGUgez8uLi8uLi8uLi9zcmMvc2VydmljZS9wbGF0Zm9ybS1pbXBsLlBsYXRmb3JtfSAqL1xuICAgIHRoaXMucGxhdGZvcm1fID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P3N0cmluZ30gKi9cbiAgICB0aGlzLmhyZWZfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P3N0cmluZ30gKi9cbiAgICB0aGlzLnRhcmdldF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/QXJyYXk8c3RyaW5nPn0gKi9cbiAgICB0aGlzLmJpbmRpbmdWYXJzXyA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzTGF5b3V0U3VwcG9ydGVkKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIGNvbnN0IHtlbGVtZW50fSA9IHRoaXM7XG4gICAgY29uc3QgdHlwZUF0dHIgPSB1c2VyQXNzZXJ0KFxuICAgICAgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSxcbiAgICAgICdUaGUgdHlwZSBhdHRyaWJ1dGUgaXMgcmVxdWlyZWQuICVzJyxcbiAgICAgIGVsZW1lbnRcbiAgICApO1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICAhL1xccy8udGVzdCh0eXBlQXR0ciksXG4gICAgICAnU3BhY2UgY2hhcmFjdGVycyBhcmUgbm90IGFsbG93ZWQgaW4gdHlwZSBhdHRyaWJ1dGUgdmFsdWUuICVzJyxcbiAgICAgIGVsZW1lbnRcbiAgICApO1xuXG4gICAgdGhpcy5wbGF0Zm9ybV8gPSBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0aGlzLndpbik7XG5cbiAgICBjb25zdCBzeXN0ZW1TaGFyZVN1cHBvcnRlZCA9ICdzaGFyZScgaW4gdGhpcy53aW4ubmF2aWdhdG9yO1xuICAgIGlmICh0eXBlQXR0ciA9PT0gJ3N5c3RlbScpIHtcbiAgICAgIC8vIEhpZGUvaWdub3JlIHN5c3RlbSBjb21wb25lbnQgaWYgbmF2aWdhdG9yLnNoYXJlIHVuYXZhaWxhYmxlXG4gICAgICBpZiAoIXN5c3RlbVNoYXJlU3VwcG9ydGVkKSB7XG4gICAgICAgIHRvZ2dsZShlbGVtZW50LCBmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSGlkZS9pZ25vcmUgbm9uLXN5c3RlbSBjb21wb25lbnQgaWYgc3lzdGVtIHNoYXJlIHdhbnRzIHRvIGJlIHVuaXF1ZVxuICAgICAgY29uc3Qgc3lzdGVtT25seSA9XG4gICAgICAgIHN5c3RlbVNoYXJlU3VwcG9ydGVkICYmXG4gICAgICAgICEhdGhpcy53aW4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAnYW1wLXNvY2lhbC1zaGFyZVt0eXBlPXN5c3RlbV1bZGF0YS1tb2RlPXJlcGxhY2VdJ1xuICAgICAgICApLmxlbmd0aDtcbiAgICAgIGlmIChzeXN0ZW1Pbmx5KSB7XG4gICAgICAgIHRvZ2dsZShlbGVtZW50LCBmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdHlwZUNvbmZpZyA9IGdldFNvY2lhbENvbmZpZyh0eXBlQXR0cikgfHwgZGljdCgpO1xuICAgIGlmICh0eXBlQ29uZmlnWydvYnNvbGV0ZSddKSB7XG4gICAgICB0b2dnbGUoZWxlbWVudCwgZmFsc2UpO1xuICAgICAgdXNlcigpLndhcm4oVEFHLCBgU2tpcHBpbmcgb2Jzb2xldGUgc2hhcmUgYnV0dG9uICR7dHlwZUF0dHJ9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2hhcmVFbmRwb2ludF8gPSB1c2VyQXNzZXJ0KFxuICAgICAgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2hhcmUtZW5kcG9pbnQnKSB8fFxuICAgICAgICB0eXBlQ29uZmlnWydzaGFyZUVuZHBvaW50J10sXG4gICAgICAnVGhlIGRhdGEtc2hhcmUtZW5kcG9pbnQgYXR0cmlidXRlIGlzIHJlcXVpcmVkLiAlcycsXG4gICAgICBlbGVtZW50XG4gICAgKTtcbiAgICBPYmplY3QuYXNzaWduKFxuICAgICAgdGhpcy5wYXJhbXNfLFxuICAgICAgdHlwZUNvbmZpZ1snZGVmYXVsdFBhcmFtcyddLFxuICAgICAgZ2V0RGF0YVBhcmFtc0Zyb21BdHRyaWJ1dGVzKGVsZW1lbnQpXG4gICAgKTtcblxuICAgIHRoaXMuYmluZGluZ1ZhcnNfID0gdHlwZUNvbmZpZ1snYmluZGluZ3MnXTtcblxuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2J1dHRvbicpO1xuICAgIGlmICghZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3RhYmluZGV4JykpIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgfVxuICAgIGlmICghZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKSkge1xuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgU2hhcmUgYnkgJHt0eXBlQXR0cn1gKTtcbiAgICB9XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuaGFuZGxlQ2xpY2tfKCkpO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5UHJlc3NfLmJpbmQodGhpcykpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChgYW1wLXNvY2lhbC1zaGFyZS0ke3R5cGVBdHRyfWApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICAvLyBEbyBub3QgbGF5b3V0IGlmIHRoZSBjb21wb25lbnQgcmV0dXJucyBiZWZvcmVcbiAgICAvLyB0aGlzLnNoYXJlRW5kcG9pbnRfIGlzIHJlc29sdmVkIGZyb20gYnVpbGRDYWxsYmFjay5cbiAgICBpZiAoIXRoaXMuc2hhcmVFbmRwb2ludF8pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBocmVmV2l0aFZhcnMgPSBhZGRQYXJhbXNUb1VybChcbiAgICAgIGRldigpLmFzc2VydFN0cmluZyh0aGlzLnNoYXJlRW5kcG9pbnRfKSxcbiAgICAgIHRoaXMucGFyYW1zX1xuICAgICk7XG4gICAgY29uc3QgdXJsUmVwbGFjZW1lbnRzID0gU2VydmljZXMudXJsUmVwbGFjZW1lbnRzRm9yRG9jKHRoaXMuZWxlbWVudCk7XG4gICAgY29uc3QgYmluZGluZ3MgPSB7fTtcbiAgICBpZiAodGhpcy5iaW5kaW5nVmFyc18pIHtcbiAgICAgIHRoaXMuYmluZGluZ1ZhcnNfLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZ05hbWUgPSBuYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIGJpbmRpbmdzW2JpbmRpbmdOYW1lXSA9IHRoaXMucGFyYW1zX1tuYW1lXTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB1cmxSZXBsYWNlbWVudHNcbiAgICAgIC5leHBhbmRVcmxBc3luYyhocmVmV2l0aFZhcnMsIGJpbmRpbmdzKVxuICAgICAgLnRoZW4oKGhyZWYpID0+IHtcbiAgICAgICAgdGhpcy5ocmVmXyA9IGhyZWY7XG4gICAgICAgIC8vIG1haWx0bzosIHNtczogcHJvdG9jb2xzIGJyZWFrcyB3aGVuIG9wZW5lZCBpbiBfYmxhbmsgb24gaU9TIFNhZmFyaVxuICAgICAgICBjb25zdCB7cHJvdG9jb2x9ID0gU2VydmljZXMudXJsRm9yRG9jKHRoaXMuZWxlbWVudCkucGFyc2UoaHJlZik7XG4gICAgICAgIGNvbnN0IGlzTWFpbFRvID0gcHJvdG9jb2wgPT09ICdtYWlsdG86JztcbiAgICAgICAgY29uc3QgaXNTbXMgPSBwcm90b2NvbCA9PT0gJ3NtczonO1xuICAgICAgICB0aGlzLnRhcmdldF8gPVxuICAgICAgICAgIHRoaXMucGxhdGZvcm1fLmlzSW9zKCkgJiYgKGlzTWFpbFRvIHx8IGlzU21zKVxuICAgICAgICAgICAgPyAnX3RvcCdcbiAgICAgICAgICAgIDogdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKVxuICAgICAgICAgICAgPyB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpXG4gICAgICAgICAgICA6ICdfYmxhbmsnO1xuICAgICAgICBpZiAoaXNTbXMpIHtcbiAgICAgICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xOTEyNjMyNlxuICAgICAgICAgIC8vIFRoaXMgY29kZSBwYXRoIHNlZW1zIHRvIGJlIHN0YWJsZSBmb3IgYm90aCBpT1MgYW5kIEFuZHJvaWQuXG4gICAgICAgICAgdGhpcy5ocmVmXyA9IHRoaXMuaHJlZl8ucmVwbGFjZSgnPycsICc/JicpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUga2V5IHByZXNzZXMgb24gdGhlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlS2V5UHJlc3NfKGV2ZW50KSB7XG4gICAgY29uc3Qge2tleX0gPSBldmVudDtcbiAgICBpZiAoa2V5ID09IEtleXMuU1BBQ0UgfHwga2V5ID09IEtleXMuRU5URVIpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLmhhbmRsZUFjdGl2YXRpb25fKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBjbGlja3Mgb24gdGhlIGVsZW1lbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVDbGlja18oKSB7XG4gICAgdGhpcy5oYW5kbGVBY3RpdmF0aW9uXygpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGhhbmRsZUFjdGl2YXRpb25fKCkge1xuICAgIHVzZXJBc3NlcnQodGhpcy5ocmVmXyAmJiB0aGlzLnRhcmdldF8sICdDbGlja2VkIGJlZm9yZSBocmVmIGlzIHNldC4nKTtcbiAgICBjb25zdCBocmVmID0gZGV2KCkuYXNzZXJ0U3RyaW5nKHRoaXMuaHJlZl8pO1xuICAgIGNvbnN0IHRhcmdldCA9IGRldigpLmFzc2VydFN0cmluZyh0aGlzLnRhcmdldF8pO1xuICAgIGlmICh0aGlzLnNoYXJlRW5kcG9pbnRfID09PSAnbmF2aWdhdG9yLXNoYXJlOicpIHtcbiAgICAgIGNvbnN0IHtuYXZpZ2F0b3J9ID0gdGhpcy53aW47XG4gICAgICBkZXZBc3NlcnQobmF2aWdhdG9yLnNoYXJlKTtcbiAgICAgIGNvbnN0IGRhdGFTdHIgPSBocmVmLnN1YnN0cihocmVmLmluZGV4T2YoJz8nKSk7XG4gICAgICBjb25zdCBkYXRhID0gcGFyc2VRdWVyeVN0cmluZyhkYXRhU3RyKTtcbiAgICAgIC8vIFNwcmVhZGluZyBkYXRhIGludG8gYW4gT2JqZWN0IHNpbmNlIENocm9tZSB1c2VzIHRoZSBPYmplY3QgcHJvdG90eXBlLlxuICAgICAgLy8gVE9ETzooY3JidWcuY29tLzExMjM2ODkpOiBSZW1vdmUgdGhpcyB3b3JrYXJvdW5kIG9uY2UgV2ViS2l0IGZpeCBpcyByZWxlYXNlZC5cbiAgICAgIG5hdmlnYXRvci5zaGFyZSh7Li4uZGF0YX0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgIHVzZXIoKS53YXJuKFRBRywgZS5tZXNzYWdlLCBkYXRhU3RyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB3aW5kb3dGZWF0dXJlcyA9ICdyZXNpemFibGUsc2Nyb2xsYmFycyx3aWR0aD02NDAsaGVpZ2h0PTQ4MCc7XG4gICAgICBvcGVuV2luZG93RGlhbG9nKHRoaXMud2luLCBocmVmLCB0YXJnZXQsIHdpbmRvd0ZlYXR1cmVzKTtcbiAgICB9XG4gIH1cbn1cblxuQU1QLmV4dGVuc2lvbignYW1wLXNvY2lhbC1zaGFyZScsICcwLjEnLCAoQU1QKSA9PiB7XG4gIEFNUC5yZWdpc3RlckVsZW1lbnQoJ2FtcC1zb2NpYWwtc2hhcmUnLCBBbXBTb2NpYWxTaGFyZSwgQ1NTKTtcbn0pO1xuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-social-share/0.1/amp-social-share.js