import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

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

/* Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { AmpAd3PImpl } from "./amp-ad-3p-impl";
import { AmpAdCustom } from "./amp-ad-custom";
import { CSS } from "../../../build/amp-ad-0.1.css";
import { Services } from "../../../src/service";
import { adConfig } from "../../../ads/_config";
import { getA4ARegistry } from "../../../ads/_a4a-config";
import { hasOwn } from "../../../src/core/types/object";
import { userAssert } from "../../../src/log";

/**
 * Construct ad network type-specific tag and script name.  Note that this
 * omits the version number and '.js' suffix for the extension script, which
 * will be handled by the extension loader.
 *
 * @param {string} type
 * @return {string}
 * @private
 */
function networkImplementationTag(type) {
  return "amp-ad-network-" + type + "-impl";
}

export var AmpAd = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpAd, _AMP$BaseElement);

  var _super = _createSuper(AmpAd);

  function AmpAd() {
    _classCallCheck(this, AmpAd);

    return _super.apply(this, arguments);
  }

  _createClass(AmpAd, [{
    key: "isLayoutSupported",
    value:
    /** @override */
    function isLayoutSupported(unusedLayout) {
      // TODO(jridgewell, #5980, #8218): ensure that unupgraded calls are not
      // done for `isLayoutSupported`.
      return true;
    }
    /** @override */

  }, {
    key: "upgradeCallback",
    value: function upgradeCallback() {
      var _this = this;

      var a4aRegistry = getA4ARegistry();
      // Block whole ad load if a consent is needed.

      /** @const {string} */
      var consentId = this.element.getAttribute('data-consent-notification-id');
      var consent = consentId ? Services.userNotificationManagerForDoc(this.element).then(function (service) {
        return service.get(consentId);
      }) : _resolvedPromise();
      var type = this.element.getAttribute('type');
      return consent.then(function () {
        var isCustom = type === 'custom';
        userAssert(isCustom || hasOwn(adConfig, type) || hasOwn(a4aRegistry, type), "Unknown ad type \"" + type + "\"");

        // Check for the custom ad type (no ad network, self-service)
        if (isCustom) {
          return new AmpAdCustom(_this.element);
        }

        _this.win.ampAdSlotIdCounter = _this.win.ampAdSlotIdCounter || 0;
        var slotId = _this.win.ampAdSlotIdCounter++;
        return new Promise(function (resolve) {
          _this.getVsync().mutate(function () {
            _this.element.setAttribute('data-amp-slot-index', slotId);

            var useRemoteHtml = _this.element.getAmpDoc().getMetaByName('amp-3p-iframe-src');

            // TODO(tdrl): Check amp-ad registry to see if they have this already.
            // TODO(a4a-cam): Shorten this predicate.
            if (!a4aRegistry[type] || // Note that predicate execution may have side effects.
            !a4aRegistry[type](_this.win, _this.element, useRemoteHtml)) {
              // Either this ad network doesn't support Fast Fetch, its Fast
              // Fetch implementation has explicitly opted not to handle this
              // tag, or this page uses remote.html which is inherently
              // incompatible with Fast Fetch. Fall back to Delayed Fetch.
              return resolve(new AmpAd3PImpl(_this.element));
            }

            var extensionTagName = networkImplementationTag(type);

            _this.element.setAttribute('data-a4a-upgrade-type', extensionTagName);

            resolve(Services.extensionsFor(_this.win).loadElementClass(extensionTagName).then(function (ctor) {
              return new ctor(_this.element);
            }).catch(function (error) {
              // Work around presubmit restrictions.
              var TAG = _this.element.tagName;

              // Report error and fallback to 3p
              _this.user().error(TAG, 'Unable to load ad implementation for type ', type, ', falling back to 3p, error: ', error);

              return new AmpAd3PImpl(_this.element);
            }));
          });
        });
      });
    }
  }]);

  return AmpAd;
}(AMP.BaseElement);
AMP.extension('amp-ad', '0.1', function (AMP) {
  AMP.registerElement('amp-ad', AmpAd, CSS);
  AMP.registerElement('amp-embed', AmpAd);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hZC5qcyJdLCJuYW1lcyI6WyJBbXBBZDNQSW1wbCIsIkFtcEFkQ3VzdG9tIiwiQ1NTIiwiU2VydmljZXMiLCJhZENvbmZpZyIsImdldEE0QVJlZ2lzdHJ5IiwiaGFzT3duIiwidXNlckFzc2VydCIsIm5ldHdvcmtJbXBsZW1lbnRhdGlvblRhZyIsInR5cGUiLCJBbXBBZCIsInVudXNlZExheW91dCIsImE0YVJlZ2lzdHJ5IiwiY29uc2VudElkIiwiZWxlbWVudCIsImdldEF0dHJpYnV0ZSIsImNvbnNlbnQiLCJ1c2VyTm90aWZpY2F0aW9uTWFuYWdlckZvckRvYyIsInRoZW4iLCJzZXJ2aWNlIiwiZ2V0IiwiaXNDdXN0b20iLCJ3aW4iLCJhbXBBZFNsb3RJZENvdW50ZXIiLCJzbG90SWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldFZzeW5jIiwibXV0YXRlIiwic2V0QXR0cmlidXRlIiwidXNlUmVtb3RlSHRtbCIsImdldEFtcERvYyIsImdldE1ldGFCeU5hbWUiLCJleHRlbnNpb25UYWdOYW1lIiwiZXh0ZW5zaW9uc0ZvciIsImxvYWRFbGVtZW50Q2xhc3MiLCJjdG9yIiwiY2F0Y2giLCJlcnJvciIsIlRBRyIsInRhZ05hbWUiLCJ1c2VyIiwiQU1QIiwiQmFzZUVsZW1lbnQiLCJleHRlbnNpb24iLCJyZWdpc3RlckVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsV0FBUjtBQUNBLFNBQVFDLFdBQVI7QUFDQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUNBLFNBQVFDLFVBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0Ms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QjtBQUNBLGtCQUFNQyxHQUFHLEdBQUcsS0FBSSxDQUFDekIsT0FBTCxDQUFhMEIsT0FBekI7O0FBQ0E7QUFDQSxjQUFBLEtBQUksQ0FBQ0MsSUFBTCxHQUFZSCxLQUFaLENBQ0VDLEdBREYsRUFFRSw0Q0FGRixFQUdFOUIsSUFIRixFQUlFLCtCQUpGLEVBS0U2QixLQUxGOztBQU9BLHFCQUFPLElBQUl0QyxXQUFKLENBQWdCLEtBQUksQ0FBQ2MsT0FBckIsQ0FBUDtBQUNELGFBZkgsQ0FESyxDQUFQO0FBa0JELFdBeENEO0FBeUNELFNBMUNNLENBQVA7QUEyQ0QsT0ExRE0sQ0FBUDtBQTJERDtBQS9FSDs7QUFBQTtBQUFBLEVBQTJCNEIsR0FBRyxDQUFDQyxXQUEvQjtBQWtGQUQsR0FBRyxDQUFDRSxTQUFKLENBQWMsUUFBZCxFQUF3QixLQUF4QixFQUErQixVQUFDRixHQUFELEVBQVM7QUFDdENBLEVBQUFBLEdBQUcsQ0FBQ0csZUFBSixDQUFvQixRQUFwQixFQUE4Qm5DLEtBQTlCLEVBQXFDUixHQUFyQztBQUNBd0MsRUFBQUEsR0FBRyxDQUFDRyxlQUFKLENBQW9CLFdBQXBCLEVBQWlDbkMsS0FBakM7QUFDRCxDQUhEIiwic291cmNlc0NvbnRlbnQiOlsiLyogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0FtcEFkM1BJbXBsfSBmcm9tICcuL2FtcC1hZC0zcC1pbXBsJztcbmltcG9ydCB7QW1wQWRDdXN0b219IGZyb20gJy4vYW1wLWFkLWN1c3RvbSc7XG5pbXBvcnQge0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLWFkLTAuMS5jc3MnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHthZENvbmZpZ30gZnJvbSAnI2Fkcy9fY29uZmlnJztcbmltcG9ydCB7Z2V0QTRBUmVnaXN0cnl9IGZyb20gJyNhZHMvX2E0YS1jb25maWcnO1xuaW1wb3J0IHtoYXNPd259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3VzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuXG4vKipcbiAqIENvbnN0cnVjdCBhZCBuZXR3b3JrIHR5cGUtc3BlY2lmaWMgdGFnIGFuZCBzY3JpcHQgbmFtZS4gIE5vdGUgdGhhdCB0aGlzXG4gKiBvbWl0cyB0aGUgdmVyc2lvbiBudW1iZXIgYW5kICcuanMnIHN1ZmZpeCBmb3IgdGhlIGV4dGVuc2lvbiBzY3JpcHQsIHdoaWNoXG4gKiB3aWxsIGJlIGhhbmRsZWQgYnkgdGhlIGV4dGVuc2lvbiBsb2FkZXIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIG5ldHdvcmtJbXBsZW1lbnRhdGlvblRhZyh0eXBlKSB7XG4gIHJldHVybiBgYW1wLWFkLW5ldHdvcmstJHt0eXBlfS1pbXBsYDtcbn1cblxuZXhwb3J0IGNsYXNzIEFtcEFkIGV4dGVuZHMgQU1QLkJhc2VFbGVtZW50IHtcbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZCh1bnVzZWRMYXlvdXQpIHtcbiAgICAvLyBUT0RPKGpyaWRnZXdlbGwsICM1OTgwLCAjODIxOCk6IGVuc3VyZSB0aGF0IHVudXBncmFkZWQgY2FsbHMgYXJlIG5vdFxuICAgIC8vIGRvbmUgZm9yIGBpc0xheW91dFN1cHBvcnRlZGAuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHVwZ3JhZGVDYWxsYmFjaygpIHtcbiAgICBjb25zdCBhNGFSZWdpc3RyeSA9IGdldEE0QVJlZ2lzdHJ5KCk7XG4gICAgLy8gQmxvY2sgd2hvbGUgYWQgbG9hZCBpZiBhIGNvbnNlbnQgaXMgbmVlZGVkLlxuICAgIC8qKiBAY29uc3Qge3N0cmluZ30gKi9cbiAgICBjb25zdCBjb25zZW50SWQgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbnNlbnQtbm90aWZpY2F0aW9uLWlkJyk7XG4gICAgY29uc3QgY29uc2VudCA9IGNvbnNlbnRJZFxuICAgICAgPyBTZXJ2aWNlcy51c2VyTm90aWZpY2F0aW9uTWFuYWdlckZvckRvYyh0aGlzLmVsZW1lbnQpLnRoZW4oKHNlcnZpY2UpID0+XG4gICAgICAgICAgc2VydmljZS5nZXQoY29uc2VudElkKVxuICAgICAgICApXG4gICAgICA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG4gICAgcmV0dXJuIGNvbnNlbnQudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCBpc0N1c3RvbSA9IHR5cGUgPT09ICdjdXN0b20nO1xuICAgICAgdXNlckFzc2VydChcbiAgICAgICAgaXNDdXN0b20gfHwgaGFzT3duKGFkQ29uZmlnLCB0eXBlKSB8fCBoYXNPd24oYTRhUmVnaXN0cnksIHR5cGUpLFxuICAgICAgICBgVW5rbm93biBhZCB0eXBlIFwiJHt0eXBlfVwiYFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIHRoZSBjdXN0b20gYWQgdHlwZSAobm8gYWQgbmV0d29yaywgc2VsZi1zZXJ2aWNlKVxuICAgICAgaWYgKGlzQ3VzdG9tKSB7XG4gICAgICAgIHJldHVybiBuZXcgQW1wQWRDdXN0b20odGhpcy5lbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy53aW4uYW1wQWRTbG90SWRDb3VudGVyID0gdGhpcy53aW4uYW1wQWRTbG90SWRDb3VudGVyIHx8IDA7XG4gICAgICBjb25zdCBzbG90SWQgPSB0aGlzLndpbi5hbXBBZFNsb3RJZENvdW50ZXIrKztcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuZ2V0VnN5bmMoKS5tdXRhdGUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW1wLXNsb3QtaW5kZXgnLCBzbG90SWQpO1xuXG4gICAgICAgICAgY29uc3QgdXNlUmVtb3RlSHRtbCA9IHRoaXMuZWxlbWVudFxuICAgICAgICAgICAgLmdldEFtcERvYygpXG4gICAgICAgICAgICAuZ2V0TWV0YUJ5TmFtZSgnYW1wLTNwLWlmcmFtZS1zcmMnKTtcbiAgICAgICAgICAvLyBUT0RPKHRkcmwpOiBDaGVjayBhbXAtYWQgcmVnaXN0cnkgdG8gc2VlIGlmIHRoZXkgaGF2ZSB0aGlzIGFscmVhZHkuXG4gICAgICAgICAgLy8gVE9ETyhhNGEtY2FtKTogU2hvcnRlbiB0aGlzIHByZWRpY2F0ZS5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhYTRhUmVnaXN0cnlbdHlwZV0gfHxcbiAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBwcmVkaWNhdGUgZXhlY3V0aW9uIG1heSBoYXZlIHNpZGUgZWZmZWN0cy5cbiAgICAgICAgICAgICFhNGFSZWdpc3RyeVt0eXBlXSh0aGlzLndpbiwgdGhpcy5lbGVtZW50LCB1c2VSZW1vdGVIdG1sKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgLy8gRWl0aGVyIHRoaXMgYWQgbmV0d29yayBkb2Vzbid0IHN1cHBvcnQgRmFzdCBGZXRjaCwgaXRzIEZhc3RcbiAgICAgICAgICAgIC8vIEZldGNoIGltcGxlbWVudGF0aW9uIGhhcyBleHBsaWNpdGx5IG9wdGVkIG5vdCB0byBoYW5kbGUgdGhpc1xuICAgICAgICAgICAgLy8gdGFnLCBvciB0aGlzIHBhZ2UgdXNlcyByZW1vdGUuaHRtbCB3aGljaCBpcyBpbmhlcmVudGx5XG4gICAgICAgICAgICAvLyBpbmNvbXBhdGlibGUgd2l0aCBGYXN0IEZldGNoLiBGYWxsIGJhY2sgdG8gRGVsYXllZCBGZXRjaC5cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKG5ldyBBbXBBZDNQSW1wbCh0aGlzLmVsZW1lbnQpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBleHRlbnNpb25UYWdOYW1lID0gbmV0d29ya0ltcGxlbWVudGF0aW9uVGFnKHR5cGUpO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYTRhLXVwZ3JhZGUtdHlwZScsIGV4dGVuc2lvblRhZ05hbWUpO1xuICAgICAgICAgIHJlc29sdmUoXG4gICAgICAgICAgICBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKHRoaXMud2luKVxuICAgICAgICAgICAgICAubG9hZEVsZW1lbnRDbGFzcyhleHRlbnNpb25UYWdOYW1lKVxuICAgICAgICAgICAgICAudGhlbigoY3RvcikgPT4gbmV3IGN0b3IodGhpcy5lbGVtZW50KSlcbiAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFdvcmsgYXJvdW5kIHByZXN1Ym1pdCByZXN0cmljdGlvbnMuXG4gICAgICAgICAgICAgICAgY29uc3QgVEFHID0gdGhpcy5lbGVtZW50LnRhZ05hbWU7XG4gICAgICAgICAgICAgICAgLy8gUmVwb3J0IGVycm9yIGFuZCBmYWxsYmFjayB0byAzcFxuICAgICAgICAgICAgICAgIHRoaXMudXNlcigpLmVycm9yKFxuICAgICAgICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgICAgICAgJ1VuYWJsZSB0byBsb2FkIGFkIGltcGxlbWVudGF0aW9uIGZvciB0eXBlICcsXG4gICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgJywgZmFsbGluZyBiYWNrIHRvIDNwLCBlcnJvcjogJyxcbiAgICAgICAgICAgICAgICAgIGVycm9yXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEFtcEFkM1BJbXBsKHRoaXMuZWxlbWVudCk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5BTVAuZXh0ZW5zaW9uKCdhbXAtYWQnLCAnMC4xJywgKEFNUCkgPT4ge1xuICBBTVAucmVnaXN0ZXJFbGVtZW50KCdhbXAtYWQnLCBBbXBBZCwgQ1NTKTtcbiAgQU1QLnJlZ2lzdGVyRWxlbWVudCgnYW1wLWVtYmVkJywgQW1wQWQpO1xufSk7XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-ad/0.1/amp-ad.js