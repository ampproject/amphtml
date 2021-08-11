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
import { Action, StateProperty, getStoreService } from "./amp-story-store-service";
import { ActionTrust } from "../../../src/core/constants/action-constants";
import { CSS } from "../../../build/amp-story-consent-1.0.css";
import { Layout } from "../../../src/core/dom/layout";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { assertAbsoluteHttpOrHttpsUrl, assertHttpsUrl } from "../../../src/url";
import { childElementByTag, closest, closestAncestorElementBySelector, matches } from "../../../src/core/dom/query";
import { computedStyle, setImportantStyles } from "../../../src/core/dom/style";
import { createShadowRootWithStyle, getRGBFromCssColorValue, getTextColorForRGB, triggerClickFromLightDom } from "./utils";
import { dev, user, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { isArray } from "../../../src/core/types";
import { isJsonScriptTag } from "../../../src/core/dom";
import { parseJson } from "../../../src/core/types/object/json";
import { renderAsElement } from "./simple-template";

/** @const {string} */
var TAG = 'amp-story-consent';

/**
 * Default optional config parameters.
 * @const {!Object}
 */
var DEFAULT_OPTIONAL_PARAMETERS = {
  externalLink: {},
  onlyAccept: false
};

// TODO(gmajoulet): switch to `htmlFor` static template helper.

/**
 * Story consent template.
 * @param {!Object} config
 * @param {string} consentId
 * @param {?string} logoSrc
 * @return {!./simple-template.ElementDef}
 * @private @const
 */
var getTemplate = function getTemplate(config, consentId, logoSrc) {
  return {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-consent i-amphtml-story-system-reset'
    }),
    children: [{
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-consent-overflow'
      }),
      children: [{
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-consent-container'
        }),
        children: [{
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-consent-header'
          }),
          children: [{
            tag: 'div',
            attrs: dict({
              'class': 'i-amphtml-story-consent-logo',
              'style': logoSrc ? "background-image: url('" + logoSrc + "') !important;" : ''
            }),
            children: []
          }]
        }, {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-consent-content'
          }),
          children: [{
            tag: 'h3',
            attrs: dict({}),
            children: [],
            unlocalizedString: config.title
          }, {
            tag: 'p',
            attrs: dict({}),
            children: [],
            unlocalizedString: config.message
          }, {
            tag: 'ul',
            attrs: dict({
              'class': 'i-amphtml-story-consent-vendors'
            }),
            children: config.vendors && config.vendors.map(function (vendor) {
              return {
                tag: 'li',
                attrs: dict({
                  'class': 'i-amphtml-story-consent-vendor'
                }),
                children: [],
                unlocalizedString: vendor
              };
            })
          }, {
            tag: 'a',
            attrs: dict({
              'class': 'i-amphtml-story-consent-external-link ' + (!(config.externalLink.title && config.externalLink.href) ? 'i-amphtml-hidden' : ''),
              'href': config.externalLink.href,
              'target': '_top',
              'title': config.externalLink.title
            }),
            children: [],
            unlocalizedString: config.externalLink.title
          }]
        }]
      }, {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-consent-actions'
        }),
        children: [{
          tag: 'button',
          attrs: dict({
            'class': 'i-amphtml-story-consent-action ' + 'i-amphtml-story-consent-action-reject' + (config.onlyAccept === true ? ' i-amphtml-hidden' : ''),
            'on': "tap:" + consentId + ".reject"
          }),
          children: [],
          localizedStringId: LocalizedStringId.AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL
        }, {
          tag: 'button',
          attrs: dict({
            'class': 'i-amphtml-story-consent-action ' + 'i-amphtml-story-consent-action-accept',
            'on': "tap:" + consentId + ".accept"
          }),
          children: [],
          localizedStringId: LocalizedStringId.AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL
        }]
      }]
    }]
  };
};

/**
 * The <amp-story-consent> custom element.
 */
export var AmpStoryConsent = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpStoryConsent, _AMP$BaseElement);

  var _super = _createSuper(AmpStoryConsent);

  /** @param {!AmpElement} element */
  function AmpStoryConsent(element) {
    var _this;

    _classCallCheck(this, AmpStoryConsent);

    _this = _super.call(this, element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    _this.actions_ = null;

    /** @private {?Object} */
    _this.consentConfig_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    _this.storeService_ = getStoreService(_this.win);

    /** @private {?Object} */
    _this.storyConsentConfig_ = null;

    /** @private {?Element} */
    _this.storyConsentEl_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpStoryConsent, [{
    key: "buildCallback",
    value: function buildCallback() {
      this.actions_ = Services.actionServiceForDoc(this.element);
      this.assertAndParseConfig_();
      var storyEl = dev().assertElement(closestAncestorElementBySelector(this.element, 'AMP-STORY'));
      var consentEl = closestAncestorElementBySelector(this.element, 'AMP-CONSENT');
      var consentId = consentEl.id;
      this.storeConsentId_(consentId);
      var logoSrc = storyEl && storyEl.getAttribute('publisher-logo-src');

      if (logoSrc) {
        assertHttpsUrl(logoSrc, storyEl, 'publisher-logo-src');
      } else {
        user().warn(TAG, 'Expected "publisher-logo-src" attribute on <amp-story>');
      }

      // Story consent config is set by the `assertAndParseConfig_` method.
      if (this.storyConsentConfig_) {
        this.storyConsentEl_ = renderAsElement(this.win.document, getTemplate(this.storyConsentConfig_, consentId, logoSrc));
        createShadowRootWithStyle(this.element, this.storyConsentEl_, CSS);
        // Allow <amp-consent> actions in STAMP (defaults to no actions allowed).
        var actions = [{
          tagOrTarget: 'AMP-CONSENT',
          method: 'accept'
        }, {
          tagOrTarget: 'AMP-CONSENT',
          method: 'prompt'
        }, {
          tagOrTarget: 'AMP-CONSENT',
          method: 'reject'
        }];
        this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, actions);
        this.setAcceptButtonFontColor_();
        this.initializeListeners_();
      }
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return layout == Layout.NODISPLAY;
    }
    /**
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this2 = this;

      this.storyConsentEl_.addEventListener('click', function (event) {
        return _this2.onClick_(event);
      }, true
      /** useCapture */
      );
      this.storeService_.subscribe(StateProperty.RTL_STATE, function (rtlState) {
        _this2.onRtlStateUpdate_(rtlState);
      }, true
      /** callToInitialize */
      );
    }
    /**
     * Listens to click events to trigger the actions programatically.
     * Since events bubble up from the Shadow DOM but their target is updated to
     * the Shadow root, the top level actions event listeners would not detect
     * and trigger the actions upon click events.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onClick_",
    value: function onClick_(event) {
      if (!event.target) {
        return;
      }

      if (event.target.hasAttribute('on')) {
        var targetEl = dev().assertElement(event.target);
        this.actions_.trigger(targetEl, 'tap', event, ActionTrust.HIGH);
      }

      var anchorClicked = closest(event.target, function (e) {
        return matches(e, 'a[href]');
      });

      if (anchorClicked) {
        triggerClickFromLightDom(anchorClicked, this.element);
        event.preventDefault();
      }
    }
    /**
     * Reacts to RTL state updates and triggers the UI for RTL.
     * @param {boolean} rtlState
     * @private
     */

  }, {
    key: "onRtlStateUpdate_",
    value: function onRtlStateUpdate_(rtlState) {
      var _this3 = this;

      var mutator = function mutator() {
        rtlState ? _this3.storyConsentEl_.setAttribute('dir', 'rtl') : _this3.storyConsentEl_.removeAttribute('dir');
      };

      this.mutateElement(mutator, this.storyConsentEl_);
    }
    /**
     * Validates the story-consent config. `story-consent` is a new parameter
     * specific to stories, added on the `amp-consent` JSON config.
     * @private
     */

  }, {
    key: "assertAndParseConfig_",
    value: function assertAndParseConfig_() {
      // Validation of the amp-consent config is handled by the amp-consent
      // javascript.
      var parentEl = dev().assertElement(this.element.parentElement);
      var consentScript = childElementByTag(parentEl, 'script');
      this.consentConfig_ = consentScript && parseJson(consentScript.textContent);
      this.mergeLegacyConsents_();

      // amp-consent already triggered console errors, step out to avoid polluting
      // the console.
      if (!this.consentConfig_) {
        return;
      }

      var storyConsentScript = childElementByTag(this.element, 'script');
      userAssert(storyConsentScript && isJsonScriptTag(storyConsentScript), TAG + " config should be put in a <script> tag with " + 'type="application/json"');
      this.storyConsentConfig_ = _extends({}, DEFAULT_OPTIONAL_PARAMETERS, parseJson(storyConsentScript.textContent));
      user().assertString(this.storyConsentConfig_.title, TAG + ": config requires a title");
      user().assertString(this.storyConsentConfig_.message, TAG + ": config requires a message");
      userAssert(this.storyConsentConfig_.vendors && isArray(this.storyConsentConfig_.vendors), TAG + ": config requires an array of vendors");
      user().assertBoolean(this.storyConsentConfig_.onlyAccept, TAG + ": config requires \"onlyAccept\" to be a boolean");

      // Runs the validation if any of the title or link are provided, since
      // both have to be provided for the external link to be displayed.
      if (this.storyConsentConfig_.externalLink.href || this.storyConsentConfig_.externalLink.title) {
        user().assertString(this.storyConsentConfig_.externalLink.title, TAG + ": config requires \"externalLink.title\" to be a string");
        user().assertString(this.storyConsentConfig_.externalLink.href, TAG + ": config requires \"externalLink.href\" to be an absolute URL");
        assertAbsoluteHttpOrHttpsUrl(this.storyConsentConfig_.externalLink.href);
      }
    }
    /**
     * Merge legacy `consents` policy object from
     * amp-consent config into top level.
     * @private
     */

  }, {
    key: "mergeLegacyConsents_",
    value: function mergeLegacyConsents_() {
      var legacyConsents = this.consentConfig_['consents'];

      if (legacyConsents) {
        var policyId = Object.keys(legacyConsents)[0];
        var policy = legacyConsents[policyId];
        this.consentConfig_.consentInstanceId = policyId;
        this.consentConfig_.checkConsentHref = policy.checkConsentHref;
        this.consentConfig_.promptIfUnknownForGeoGroup = policy.promptIfUnknownForGeoGroup;
        delete this.consentConfig_['consents'];
      }
    }
    /**
     * @param {string} consentId
     * @private
     */

  }, {
    key: "storeConsentId_",
    value: function storeConsentId_(consentId) {
      var _this4 = this;

      // checkConsentHref response overrides the amp-geo config, if provided.
      if (this.consentConfig_.checkConsentHref) {
        this.storeService_.dispatch(Action.SET_CONSENT_ID, consentId);
        return;
      }

      // If using amp-access with amp-geo, only set the consent id if the user is
      // in the expected geo group.
      var geoGroup = this.consentConfig_.promptIfUnknownForGeoGroup;

      if (geoGroup) {
        Services.geoForDocOrNull(this.element).then(function (geo) {
          var matchedGeoGroups =
          /** @type {!Array<string>} */
          geo.matchedISOCountryGroups;

          if (geo && !matchedGeoGroups.includes(geoGroup)) {
            return;
          }

          _this4.storeService_.dispatch(Action.SET_CONSENT_ID, consentId);
        });
      }
    }
    /**
     * Sets the accept button font color to either white or black, depending on
     * the publisher custom background color.
     * Must be called from the `buildCallback` or in another vsync mutate state.
     * @private
     */

  }, {
    key: "setAcceptButtonFontColor_",
    value: function setAcceptButtonFontColor_() {
      var buttonEl = dev().assertElement(this.storyConsentEl_.querySelector('.i-amphtml-story-consent-action-accept'));
      var styles = computedStyle(this.win, buttonEl);
      var rgb = getRGBFromCssColorValue(styles['background-color']);
      var color = getTextColorForRGB(rgb);
      setImportantStyles(buttonEl, {
        color: color
      });
    }
  }]);

  return AmpStoryConsent;
}(AMP.BaseElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1jb25zZW50LmpzIl0sIm5hbWVzIjpbIkFjdGlvbiIsIlN0YXRlUHJvcGVydHkiLCJnZXRTdG9yZVNlcnZpY2UiLCJBY3Rpb25UcnVzdCIsIkNTUyIsIkxheW91dCIsIkxvY2FsaXplZFN0cmluZ0lkIiwiU2VydmljZXMiLCJhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsIiwiYXNzZXJ0SHR0cHNVcmwiLCJjaGlsZEVsZW1lbnRCeVRhZyIsImNsb3Nlc3QiLCJjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvciIsIm1hdGNoZXMiLCJjb21wdXRlZFN0eWxlIiwic2V0SW1wb3J0YW50U3R5bGVzIiwiY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSIsImdldFJHQkZyb21Dc3NDb2xvclZhbHVlIiwiZ2V0VGV4dENvbG9yRm9yUkdCIiwidHJpZ2dlckNsaWNrRnJvbUxpZ2h0RG9tIiwiZGV2IiwidXNlciIsInVzZXJBc3NlcnQiLCJkaWN0IiwiaXNBcnJheSIsImlzSnNvblNjcmlwdFRhZyIsInBhcnNlSnNvbiIsInJlbmRlckFzRWxlbWVudCIsIlRBRyIsIkRFRkFVTFRfT1BUSU9OQUxfUEFSQU1FVEVSUyIsImV4dGVybmFsTGluayIsIm9ubHlBY2NlcHQiLCJnZXRUZW1wbGF0ZSIsImNvbmZpZyIsImNvbnNlbnRJZCIsImxvZ29TcmMiLCJ0YWciLCJhdHRycyIsImNoaWxkcmVuIiwidW5sb2NhbGl6ZWRTdHJpbmciLCJ0aXRsZSIsIm1lc3NhZ2UiLCJ2ZW5kb3JzIiwibWFwIiwidmVuZG9yIiwiaHJlZiIsImxvY2FsaXplZFN0cmluZ0lkIiwiQU1QX1NUT1JZX0NPTlNFTlRfREVDTElORV9CVVRUT05fTEFCRUwiLCJBTVBfU1RPUllfQ09OU0VOVF9BQ0NFUFRfQlVUVE9OX0xBQkVMIiwiQW1wU3RvcnlDb25zZW50IiwiZWxlbWVudCIsImFjdGlvbnNfIiwiY29uc2VudENvbmZpZ18iLCJzdG9yZVNlcnZpY2VfIiwid2luIiwic3RvcnlDb25zZW50Q29uZmlnXyIsInN0b3J5Q29uc2VudEVsXyIsImFjdGlvblNlcnZpY2VGb3JEb2MiLCJhc3NlcnRBbmRQYXJzZUNvbmZpZ18iLCJzdG9yeUVsIiwiYXNzZXJ0RWxlbWVudCIsImNvbnNlbnRFbCIsImlkIiwic3RvcmVDb25zZW50SWRfIiwiZ2V0QXR0cmlidXRlIiwid2FybiIsImRvY3VtZW50IiwiYWN0aW9ucyIsInRhZ09yVGFyZ2V0IiwibWV0aG9kIiwiZGlzcGF0Y2giLCJBRERfVE9fQUNUSU9OU19BTExPV0xJU1QiLCJzZXRBY2NlcHRCdXR0b25Gb250Q29sb3JfIiwiaW5pdGlhbGl6ZUxpc3RlbmVyc18iLCJsYXlvdXQiLCJOT0RJU1BMQVkiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJvbkNsaWNrXyIsInN1YnNjcmliZSIsIlJUTF9TVEFURSIsInJ0bFN0YXRlIiwib25SdGxTdGF0ZVVwZGF0ZV8iLCJ0YXJnZXQiLCJoYXNBdHRyaWJ1dGUiLCJ0YXJnZXRFbCIsInRyaWdnZXIiLCJISUdIIiwiYW5jaG9yQ2xpY2tlZCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsIm11dGF0b3IiLCJzZXRBdHRyaWJ1dGUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJtdXRhdGVFbGVtZW50IiwicGFyZW50RWwiLCJwYXJlbnRFbGVtZW50IiwiY29uc2VudFNjcmlwdCIsInRleHRDb250ZW50IiwibWVyZ2VMZWdhY3lDb25zZW50c18iLCJzdG9yeUNvbnNlbnRTY3JpcHQiLCJhc3NlcnRTdHJpbmciLCJhc3NlcnRCb29sZWFuIiwibGVnYWN5Q29uc2VudHMiLCJwb2xpY3lJZCIsIk9iamVjdCIsImtleXMiLCJwb2xpY3kiLCJjb25zZW50SW5zdGFuY2VJZCIsImNoZWNrQ29uc2VudEhyZWYiLCJwcm9tcHRJZlVua25vd25Gb3JHZW9Hcm91cCIsIlNFVF9DT05TRU5UX0lEIiwiZ2VvR3JvdXAiLCJnZW9Gb3JEb2NPck51bGwiLCJ0aGVuIiwiZ2VvIiwibWF0Y2hlZEdlb0dyb3VwcyIsIm1hdGNoZWRJU09Db3VudHJ5R3JvdXBzIiwiaW5jbHVkZXMiLCJidXR0b25FbCIsInF1ZXJ5U2VsZWN0b3IiLCJzdHlsZXMiLCJyZ2IiLCJjb2xvciIsIkFNUCIsIkJhc2VFbGVtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsTUFERixFQUVFQyxhQUZGLEVBR0VDLGVBSEY7QUFLQSxTQUFRQyxXQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLE1BQVI7QUFDQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyw0QkFBUixFQUFzQ0MsY0FBdEM7QUFDQSxTQUNFQyxpQkFERixFQUVFQyxPQUZGLEVBR0VDLGdDQUhGLEVBSUVDLE9BSkY7QUFNQSxTQUFRQyxhQUFSLEVBQXVCQyxrQkFBdkI7QUFDQSxTQUNFQyx5QkFERixFQUVFQyx1QkFGRixFQUdFQyxrQkFIRixFQUlFQyx3QkFKRjtBQU1BLFNBQVFDLEdBQVIsRUFBYUMsSUFBYixFQUFtQkMsVUFBbkI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLGVBQVI7QUFFQSxTQUFRQyxTQUFSO0FBQ0EsU0FBUUMsZUFBUjs7QUFFQTtBQUNBLElBQU1DLEdBQUcsR0FBRyxtQkFBWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLDJCQUEyQixHQUFHO0FBQ2xDQyxFQUFBQSxZQUFZLEVBQUUsRUFEb0I7QUFFbENDLEVBQUFBLFVBQVUsRUFBRTtBQUZzQixDQUFwQzs7QUFLQTs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsV0FBVyxHQUFHLFNBQWRBLFdBQWMsQ0FBQ0MsTUFBRCxFQUFTQyxTQUFULEVBQW9CQyxPQUFwQjtBQUFBLFNBQWlDO0FBQ25EQyxJQUFBQSxHQUFHLEVBQUUs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SUUsUUFBSixFQUFjO0FBQ1p6RyxRQUFBQSxRQUFRLENBQUMwRyxlQUFULENBQXlCLEtBQUsvRCxPQUE5QixFQUF1Q2dFLElBQXZDLENBQTRDLFVBQUNDLEdBQUQsRUFBUztBQUNuRCxjQUFNQyxnQkFBZ0I7QUFBRztBQUN2QkQsVUFBQUEsR0FBRyxDQUFDRSx1QkFETjs7QUFHQSxjQUFJRixHQUFHLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUNFLFFBQWpCLENBQTBCTixRQUExQixDQUFaLEVBQWlEO0FBQy9DO0FBQ0Q7O0FBQ0QsVUFBQSxNQUFJLENBQUMzRCxhQUFMLENBQW1CaUIsUUFBbkIsQ0FBNEJ0RSxNQUFNLENBQUMrRyxjQUFuQyxFQUFtRDdFLFNBQW5EO0FBQ0QsU0FSRDtBQVNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBM1BBO0FBQUE7QUFBQSxXQTRQRSxxQ0FBNEI7QUFDMUIsVUFBTXFGLFFBQVEsR0FBR25HLEdBQUcsR0FBR3dDLGFBQU4sQ0FDZixLQUFLSixlQUFMLENBQXFCZ0UsYUFBckIsQ0FDRSx3Q0FERixDQURlLENBQWpCO0FBS0EsVUFBTUMsTUFBTSxHQUFHM0csYUFBYSxDQUFDLEtBQUt3QyxHQUFOLEVBQVdpRSxRQUFYLENBQTVCO0FBRUEsVUFBTUcsR0FBRyxHQUFHekcsdUJBQXVCLENBQUN3RyxNQUFNLENBQUMsa0JBQUQsQ0FBUCxDQUFuQztBQUNBLFVBQU1FLEtBQUssR0FBR3pHLGtCQUFrQixDQUFDd0csR0FBRCxDQUFoQztBQUVBM0csTUFBQUEsa0JBQWtCLENBQUN3RyxRQUFELEVBQVc7QUFBQ0ksUUFBQUEsS0FBSyxFQUFMQTtBQUFELE9BQVgsQ0FBbEI7QUFDRDtBQXhRSDs7QUFBQTtBQUFBLEVBQXFDQyxHQUFHLENBQUNDLFdBQXpDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFjdGlvbixcbiAgU3RhdGVQcm9wZXJ0eSxcbiAgZ2V0U3RvcmVTZXJ2aWNlLFxufSBmcm9tICcuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7QWN0aW9uVHJ1c3R9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9hY3Rpb24tY29uc3RhbnRzJztcbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktY29uc2VudC0xLjAuY3NzJztcbmltcG9ydCB7TGF5b3V0fSBmcm9tICcjY29yZS9kb20vbGF5b3V0JztcbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7YXNzZXJ0QWJzb2x1dGVIdHRwT3JIdHRwc1VybCwgYXNzZXJ0SHR0cHNVcmx9IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuaW1wb3J0IHtcbiAgY2hpbGRFbGVtZW50QnlUYWcsXG4gIGNsb3Nlc3QsXG4gIGNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yLFxuICBtYXRjaGVzLFxufSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtjb21wdXRlZFN0eWxlLCBzZXRJbXBvcnRhbnRTdHlsZXN9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge1xuICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlLFxuICBnZXRSR0JGcm9tQ3NzQ29sb3JWYWx1ZSxcbiAgZ2V0VGV4dENvbG9yRm9yUkdCLFxuICB0cmlnZ2VyQ2xpY2tGcm9tTGlnaHREb20sXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtkZXYsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtpc0FycmF5fSBmcm9tICcjY29yZS90eXBlcyc7XG5pbXBvcnQge2lzSnNvblNjcmlwdFRhZ30gZnJvbSAnI2NvcmUvZG9tJztcblxuaW1wb3J0IHtwYXJzZUpzb259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdC9qc29uJztcbmltcG9ydCB7cmVuZGVyQXNFbGVtZW50fSBmcm9tICcuL3NpbXBsZS10ZW1wbGF0ZSc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdhbXAtc3RvcnktY29uc2VudCc7XG5cbi8qKlxuICogRGVmYXVsdCBvcHRpb25hbCBjb25maWcgcGFyYW1ldGVycy5cbiAqIEBjb25zdCB7IU9iamVjdH1cbiAqL1xuY29uc3QgREVGQVVMVF9PUFRJT05BTF9QQVJBTUVURVJTID0ge1xuICBleHRlcm5hbExpbms6IHt9LFxuICBvbmx5QWNjZXB0OiBmYWxzZSxcbn07XG5cbi8vIFRPRE8oZ21ham91bGV0KTogc3dpdGNoIHRvIGBodG1sRm9yYCBzdGF0aWMgdGVtcGxhdGUgaGVscGVyLlxuLyoqXG4gKiBTdG9yeSBjb25zZW50IHRlbXBsYXRlLlxuICogQHBhcmFtIHshT2JqZWN0fSBjb25maWdcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25zZW50SWRcbiAqIEBwYXJhbSB7P3N0cmluZ30gbG9nb1NyY1xuICogQHJldHVybiB7IS4vc2ltcGxlLXRlbXBsYXRlLkVsZW1lbnREZWZ9XG4gKiBAcHJpdmF0ZSBAY29uc3RcbiAqL1xuY29uc3QgZ2V0VGVtcGxhdGUgPSAoY29uZmlnLCBjb25zZW50SWQsIGxvZ29TcmMpID0+ICh7XG4gIHRhZzogJ2RpdicsXG4gIGF0dHJzOiBkaWN0KHtcbiAgICAnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LWNvbnNlbnQgaS1hbXBodG1sLXN0b3J5LXN5c3RlbS1yZXNldCcsXG4gIH0pLFxuICBjaGlsZHJlbjogW1xuICAgIHtcbiAgICAgIHRhZzogJ2RpdicsXG4gICAgICBhdHRyczogZGljdCh7J2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1jb25zZW50LW92ZXJmbG93J30pLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktY29uc2VudC1jb250YWluZXInfSksXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktY29uc2VudC1oZWFkZXInfSksXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1jb25zZW50LWxvZ28nLFxuICAgICAgICAgICAgICAgICAgICAnc3R5bGUnOiBsb2dvU3JjXG4gICAgICAgICAgICAgICAgICAgICAgPyBgYmFja2dyb3VuZC1pbWFnZTogdXJsKCcke2xvZ29TcmN9JykgIWltcG9ydGFudDtgXG4gICAgICAgICAgICAgICAgICAgICAgOiAnJyxcbiAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgICAgICBhdHRyczogZGljdCh7J2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1jb25zZW50LWNvbnRlbnQnfSksXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGFnOiAnaDMnLFxuICAgICAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe30pLFxuICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgICAgdW5sb2NhbGl6ZWRTdHJpbmc6IGNvbmZpZy50aXRsZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRhZzogJ3AnLFxuICAgICAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe30pLFxuICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgICAgdW5sb2NhbGl6ZWRTdHJpbmc6IGNvbmZpZy5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGFnOiAndWwnLFxuICAgICAgICAgICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktY29uc2VudC12ZW5kb3JzJ30pLFxuICAgICAgICAgICAgICAgICAgY2hpbGRyZW46XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZW5kb3JzICYmXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZW5kb3JzLm1hcCgodmVuZG9yKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgIHRhZzogJ2xpJyxcbiAgICAgICAgICAgICAgICAgICAgICBhdHRyczogZGljdCh7J2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1jb25zZW50LXZlbmRvcid9KSxcbiAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgdW5sb2NhbGl6ZWRTdHJpbmc6IHZlbmRvcixcbiAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGFnOiAnYScsXG4gICAgICAgICAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAgICAgICAgICdjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgJ2ktYW1waHRtbC1zdG9yeS1jb25zZW50LWV4dGVybmFsLWxpbmsgJyArXG4gICAgICAgICAgICAgICAgICAgICAgKCEoY29uZmlnLmV4dGVybmFsTGluay50aXRsZSAmJiBjb25maWcuZXh0ZXJuYWxMaW5rLmhyZWYpXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICdpLWFtcGh0bWwtaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICdocmVmJzogY29uZmlnLmV4dGVybmFsTGluay5ocmVmLFxuICAgICAgICAgICAgICAgICAgICAndGFyZ2V0JzogJ190b3AnLFxuICAgICAgICAgICAgICAgICAgICAndGl0bGUnOiBjb25maWcuZXh0ZXJuYWxMaW5rLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgICAgICAgICAgICB1bmxvY2FsaXplZFN0cmluZzogY29uZmlnLmV4dGVybmFsTGluay50aXRsZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICBhdHRyczogZGljdCh7J2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1jb25zZW50LWFjdGlvbnMnfSksXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnYnV0dG9uJyxcbiAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgICAgICdjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAnaS1hbXBodG1sLXN0b3J5LWNvbnNlbnQtYWN0aW9uICcgK1xuICAgICAgICAgICAgICAgICAgJ2ktYW1waHRtbC1zdG9yeS1jb25zZW50LWFjdGlvbi1yZWplY3QnICtcbiAgICAgICAgICAgICAgICAgIChjb25maWcub25seUFjY2VwdCA9PT0gdHJ1ZSA/ICcgaS1hbXBodG1sLWhpZGRlbicgOiAnJyksXG4gICAgICAgICAgICAgICAgJ29uJzogYHRhcDoke2NvbnNlbnRJZH0ucmVqZWN0YCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgICAgbG9jYWxpemVkU3RyaW5nSWQ6XG4gICAgICAgICAgICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0NPTlNFTlRfREVDTElORV9CVVRUT05fTEFCRUwsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0YWc6ICdidXR0b24nLFxuICAgICAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzpcbiAgICAgICAgICAgICAgICAgICdpLWFtcGh0bWwtc3RvcnktY29uc2VudC1hY3Rpb24gJyArXG4gICAgICAgICAgICAgICAgICAnaS1hbXBodG1sLXN0b3J5LWNvbnNlbnQtYWN0aW9uLWFjY2VwdCcsXG4gICAgICAgICAgICAgICAgJ29uJzogYHRhcDoke2NvbnNlbnRJZH0uYWNjZXB0YCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgICAgbG9jYWxpemVkU3RyaW5nSWQ6XG4gICAgICAgICAgICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0NPTlNFTlRfQUNDRVBUX0JVVFRPTl9MQUJFTCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbn0pO1xuXG4vKipcbiAqIFRoZSA8YW1wLXN0b3J5LWNvbnNlbnQ+IGN1c3RvbSBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlDb25zZW50IGV4dGVuZHMgQU1QLkJhc2VFbGVtZW50IHtcbiAgLyoqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnQgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li4vLi4vLi4vc3JjL3NlcnZpY2UvYWN0aW9uLWltcGwuQWN0aW9uU2VydmljZX0gKi9cbiAgICB0aGlzLmFjdGlvbnNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P09iamVjdH0gKi9cbiAgICB0aGlzLmNvbnNlbnRDb25maWdfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh0aGlzLndpbik7XG5cbiAgICAvKiogQHByaXZhdGUgez9PYmplY3R9ICovXG4gICAgdGhpcy5zdG9yeUNvbnNlbnRDb25maWdfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5zdG9yeUNvbnNlbnRFbF8gPSBudWxsO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHRoaXMuYWN0aW9uc18gPSBTZXJ2aWNlcy5hY3Rpb25TZXJ2aWNlRm9yRG9jKHRoaXMuZWxlbWVudCk7XG5cbiAgICB0aGlzLmFzc2VydEFuZFBhcnNlQ29uZmlnXygpO1xuXG4gICAgY29uc3Qgc3RvcnlFbCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICBjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3Rvcih0aGlzLmVsZW1lbnQsICdBTVAtU1RPUlknKVxuICAgICk7XG4gICAgY29uc3QgY29uc2VudEVsID0gY2xvc2VzdEFuY2VzdG9yRWxlbWVudEJ5U2VsZWN0b3IoXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAnQU1QLUNPTlNFTlQnXG4gICAgKTtcbiAgICBjb25zdCBjb25zZW50SWQgPSBjb25zZW50RWwuaWQ7XG5cbiAgICB0aGlzLnN0b3JlQ29uc2VudElkXyhjb25zZW50SWQpO1xuXG4gICAgY29uc3QgbG9nb1NyYyA9IHN0b3J5RWwgJiYgc3RvcnlFbC5nZXRBdHRyaWJ1dGUoJ3B1Ymxpc2hlci1sb2dvLXNyYycpO1xuXG4gICAgaWYgKGxvZ29TcmMpIHtcbiAgICAgIGFzc2VydEh0dHBzVXJsKGxvZ29TcmMsIHN0b3J5RWwsICdwdWJsaXNoZXItbG9nby1zcmMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXNlcigpLndhcm4oXG4gICAgICAgIFRBRyxcbiAgICAgICAgJ0V4cGVjdGVkIFwicHVibGlzaGVyLWxvZ28tc3JjXCIgYXR0cmlidXRlIG9uIDxhbXAtc3Rvcnk+J1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTdG9yeSBjb25zZW50IGNvbmZpZyBpcyBzZXQgYnkgdGhlIGBhc3NlcnRBbmRQYXJzZUNvbmZpZ19gIG1ldGhvZC5cbiAgICBpZiAodGhpcy5zdG9yeUNvbnNlbnRDb25maWdfKSB7XG4gICAgICB0aGlzLnN0b3J5Q29uc2VudEVsXyA9IHJlbmRlckFzRWxlbWVudChcbiAgICAgICAgdGhpcy53aW4uZG9jdW1lbnQsXG4gICAgICAgIGdldFRlbXBsYXRlKHRoaXMuc3RvcnlDb25zZW50Q29uZmlnXywgY29uc2VudElkLCBsb2dvU3JjKVxuICAgICAgKTtcbiAgICAgIGNyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUodGhpcy5lbGVtZW50LCB0aGlzLnN0b3J5Q29uc2VudEVsXywgQ1NTKTtcblxuICAgICAgLy8gQWxsb3cgPGFtcC1jb25zZW50PiBhY3Rpb25zIGluIFNUQU1QIChkZWZhdWx0cyB0byBubyBhY3Rpb25zIGFsbG93ZWQpLlxuICAgICAgY29uc3QgYWN0aW9ucyA9IFtcbiAgICAgICAge3RhZ09yVGFyZ2V0OiAnQU1QLUNPTlNFTlQnLCBtZXRob2Q6ICdhY2NlcHQnfSxcbiAgICAgICAge3RhZ09yVGFyZ2V0OiAnQU1QLUNPTlNFTlQnLCBtZXRob2Q6ICdwcm9tcHQnfSxcbiAgICAgICAge3RhZ09yVGFyZ2V0OiAnQU1QLUNPTlNFTlQnLCBtZXRob2Q6ICdyZWplY3QnfSxcbiAgICAgIF07XG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLkFERF9UT19BQ1RJT05TX0FMTE9XTElTVCwgYWN0aW9ucyk7XG5cbiAgICAgIHRoaXMuc2V0QWNjZXB0QnV0dG9uRm9udENvbG9yXygpO1xuXG4gICAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZChsYXlvdXQpIHtcbiAgICByZXR1cm4gbGF5b3V0ID09IExheW91dC5OT0RJU1BMQVk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNfKCkge1xuICAgIHRoaXMuc3RvcnlDb25zZW50RWxfLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnY2xpY2snLFxuICAgICAgKGV2ZW50KSA9PiB0aGlzLm9uQ2xpY2tfKGV2ZW50KSxcbiAgICAgIHRydWUgLyoqIHVzZUNhcHR1cmUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuUlRMX1NUQVRFLFxuICAgICAgKHJ0bFN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMub25SdGxTdGF0ZVVwZGF0ZV8ocnRsU3RhdGUpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3RlbnMgdG8gY2xpY2sgZXZlbnRzIHRvIHRyaWdnZXIgdGhlIGFjdGlvbnMgcHJvZ3JhbWF0aWNhbGx5LlxuICAgKiBTaW5jZSBldmVudHMgYnViYmxlIHVwIGZyb20gdGhlIFNoYWRvdyBET00gYnV0IHRoZWlyIHRhcmdldCBpcyB1cGRhdGVkIHRvXG4gICAqIHRoZSBTaGFkb3cgcm9vdCwgdGhlIHRvcCBsZXZlbCBhY3Rpb25zIGV2ZW50IGxpc3RlbmVycyB3b3VsZCBub3QgZGV0ZWN0XG4gICAqIGFuZCB0cmlnZ2VyIHRoZSBhY3Rpb25zIHVwb24gY2xpY2sgZXZlbnRzLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQ2xpY2tfKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGV2ZW50LnRhcmdldC5oYXNBdHRyaWJ1dGUoJ29uJykpIHtcbiAgICAgIGNvbnN0IHRhcmdldEVsID0gZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpO1xuICAgICAgdGhpcy5hY3Rpb25zXy50cmlnZ2VyKHRhcmdldEVsLCAndGFwJywgZXZlbnQsIEFjdGlvblRydXN0LkhJR0gpO1xuICAgIH1cbiAgICBjb25zdCBhbmNob3JDbGlja2VkID0gY2xvc2VzdChldmVudC50YXJnZXQsIChlKSA9PiBtYXRjaGVzKGUsICdhW2hyZWZdJykpO1xuICAgIGlmIChhbmNob3JDbGlja2VkKSB7XG4gICAgICB0cmlnZ2VyQ2xpY2tGcm9tTGlnaHREb20oYW5jaG9yQ2xpY2tlZCwgdGhpcy5lbGVtZW50KTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBSVEwgc3RhdGUgdXBkYXRlcyBhbmQgdHJpZ2dlcnMgdGhlIFVJIGZvciBSVEwuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcnRsU3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uUnRsU3RhdGVVcGRhdGVfKHJ0bFN0YXRlKSB7XG4gICAgY29uc3QgbXV0YXRvciA9ICgpID0+IHtcbiAgICAgIHJ0bFN0YXRlXG4gICAgICAgID8gdGhpcy5zdG9yeUNvbnNlbnRFbF8uc2V0QXR0cmlidXRlKCdkaXInLCAncnRsJylcbiAgICAgICAgOiB0aGlzLnN0b3J5Q29uc2VudEVsXy5yZW1vdmVBdHRyaWJ1dGUoJ2RpcicpO1xuICAgIH07XG5cbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQobXV0YXRvciwgdGhpcy5zdG9yeUNvbnNlbnRFbF8pO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyB0aGUgc3RvcnktY29uc2VudCBjb25maWcuIGBzdG9yeS1jb25zZW50YCBpcyBhIG5ldyBwYXJhbWV0ZXJcbiAgICogc3BlY2lmaWMgdG8gc3RvcmllcywgYWRkZWQgb24gdGhlIGBhbXAtY29uc2VudGAgSlNPTiBjb25maWcuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3NlcnRBbmRQYXJzZUNvbmZpZ18oKSB7XG4gICAgLy8gVmFsaWRhdGlvbiBvZiB0aGUgYW1wLWNvbnNlbnQgY29uZmlnIGlzIGhhbmRsZWQgYnkgdGhlIGFtcC1jb25zZW50XG4gICAgLy8gamF2YXNjcmlwdC5cbiAgICBjb25zdCBwYXJlbnRFbCA9IGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQpO1xuICAgIGNvbnN0IGNvbnNlbnRTY3JpcHQgPSBjaGlsZEVsZW1lbnRCeVRhZyhwYXJlbnRFbCwgJ3NjcmlwdCcpO1xuICAgIHRoaXMuY29uc2VudENvbmZpZ18gPSBjb25zZW50U2NyaXB0ICYmIHBhcnNlSnNvbihjb25zZW50U2NyaXB0LnRleHRDb250ZW50KTtcbiAgICB0aGlzLm1lcmdlTGVnYWN5Q29uc2VudHNfKCk7XG5cbiAgICAvLyBhbXAtY29uc2VudCBhbHJlYWR5IHRyaWdnZXJlZCBjb25zb2xlIGVycm9ycywgc3RlcCBvdXQgdG8gYXZvaWQgcG9sbHV0aW5nXG4gICAgLy8gdGhlIGNvbnNvbGUuXG4gICAgaWYgKCF0aGlzLmNvbnNlbnRDb25maWdfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcnlDb25zZW50U2NyaXB0ID0gY2hpbGRFbGVtZW50QnlUYWcodGhpcy5lbGVtZW50LCAnc2NyaXB0Jyk7XG5cbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgc3RvcnlDb25zZW50U2NyaXB0ICYmIGlzSnNvblNjcmlwdFRhZyhzdG9yeUNvbnNlbnRTY3JpcHQpLFxuICAgICAgYCR7VEFHfSBjb25maWcgc2hvdWxkIGJlIHB1dCBpbiBhIDxzY3JpcHQ+IHRhZyB3aXRoIGAgK1xuICAgICAgICAndHlwZT1cImFwcGxpY2F0aW9uL2pzb25cIidcbiAgICApO1xuXG4gICAgdGhpcy5zdG9yeUNvbnNlbnRDb25maWdfID0ge1xuICAgICAgLi4uREVGQVVMVF9PUFRJT05BTF9QQVJBTUVURVJTLFxuICAgICAgLi4ucGFyc2VKc29uKHN0b3J5Q29uc2VudFNjcmlwdC50ZXh0Q29udGVudCksXG4gICAgfTtcblxuICAgIHVzZXIoKS5hc3NlcnRTdHJpbmcoXG4gICAgICB0aGlzLnN0b3J5Q29uc2VudENvbmZpZ18udGl0bGUsXG4gICAgICBgJHtUQUd9OiBjb25maWcgcmVxdWlyZXMgYSB0aXRsZWBcbiAgICApO1xuICAgIHVzZXIoKS5hc3NlcnRTdHJpbmcoXG4gICAgICB0aGlzLnN0b3J5Q29uc2VudENvbmZpZ18ubWVzc2FnZSxcbiAgICAgIGAke1RBR306IGNvbmZpZyByZXF1aXJlcyBhIG1lc3NhZ2VgXG4gICAgKTtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgdGhpcy5zdG9yeUNvbnNlbnRDb25maWdfLnZlbmRvcnMgJiZcbiAgICAgICAgaXNBcnJheSh0aGlzLnN0b3J5Q29uc2VudENvbmZpZ18udmVuZG9ycyksXG4gICAgICBgJHtUQUd9OiBjb25maWcgcmVxdWlyZXMgYW4gYXJyYXkgb2YgdmVuZG9yc2BcbiAgICApO1xuICAgIHVzZXIoKS5hc3NlcnRCb29sZWFuKFxuICAgICAgdGhpcy5zdG9yeUNvbnNlbnRDb25maWdfLm9ubHlBY2NlcHQsXG4gICAgICBgJHtUQUd9OiBjb25maWcgcmVxdWlyZXMgXCJvbmx5QWNjZXB0XCIgdG8gYmUgYSBib29sZWFuYFxuICAgICk7XG5cbiAgICAvLyBSdW5zIHRoZSB2YWxpZGF0aW9uIGlmIGFueSBvZiB0aGUgdGl0bGUgb3IgbGluayBhcmUgcHJvdmlkZWQsIHNpbmNlXG4gICAgLy8gYm90aCBoYXZlIHRvIGJlIHByb3ZpZGVkIGZvciB0aGUgZXh0ZXJuYWwgbGluayB0byBiZSBkaXNwbGF5ZWQuXG4gICAgaWYgKFxuICAgICAgdGhpcy5zdG9yeUNvbnNlbnRDb25maWdfLmV4dGVybmFsTGluay5ocmVmIHx8XG4gICAgICB0aGlzLnN0b3J5Q29uc2VudENvbmZpZ18uZXh0ZXJuYWxMaW5rLnRpdGxlXG4gICAgKSB7XG4gICAgICB1c2VyKCkuYXNzZXJ0U3RyaW5nKFxuICAgICAgICB0aGlzLnN0b3J5Q29uc2VudENvbmZpZ18uZXh0ZXJuYWxMaW5rLnRpdGxlLFxuICAgICAgICBgJHtUQUd9OiBjb25maWcgcmVxdWlyZXMgXCJleHRlcm5hbExpbmsudGl0bGVcIiB0byBiZSBhIHN0cmluZ2BcbiAgICAgICk7XG4gICAgICB1c2VyKCkuYXNzZXJ0U3RyaW5nKFxuICAgICAgICB0aGlzLnN0b3J5Q29uc2VudENvbmZpZ18uZXh0ZXJuYWxMaW5rLmhyZWYsXG4gICAgICAgIGAke1RBR306IGNvbmZpZyByZXF1aXJlcyBcImV4dGVybmFsTGluay5ocmVmXCIgdG8gYmUgYW4gYWJzb2x1dGUgVVJMYFxuICAgICAgKTtcbiAgICAgIGFzc2VydEFic29sdXRlSHR0cE9ySHR0cHNVcmwodGhpcy5zdG9yeUNvbnNlbnRDb25maWdfLmV4dGVybmFsTGluay5ocmVmKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgbGVnYWN5IGBjb25zZW50c2AgcG9saWN5IG9iamVjdCBmcm9tXG4gICAqIGFtcC1jb25zZW50IGNvbmZpZyBpbnRvIHRvcCBsZXZlbC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1lcmdlTGVnYWN5Q29uc2VudHNfKCkge1xuICAgIGNvbnN0IGxlZ2FjeUNvbnNlbnRzID0gdGhpcy5jb25zZW50Q29uZmlnX1snY29uc2VudHMnXTtcbiAgICBpZiAobGVnYWN5Q29uc2VudHMpIHtcbiAgICAgIGNvbnN0IHBvbGljeUlkID0gT2JqZWN0LmtleXMobGVnYWN5Q29uc2VudHMpWzBdO1xuICAgICAgY29uc3QgcG9saWN5ID0gbGVnYWN5Q29uc2VudHNbcG9saWN5SWRdO1xuICAgICAgdGhpcy5jb25zZW50Q29uZmlnXy5jb25zZW50SW5zdGFuY2VJZCA9IHBvbGljeUlkO1xuICAgICAgdGhpcy5jb25zZW50Q29uZmlnXy5jaGVja0NvbnNlbnRIcmVmID0gcG9saWN5LmNoZWNrQ29uc2VudEhyZWY7XG4gICAgICB0aGlzLmNvbnNlbnRDb25maWdfLnByb21wdElmVW5rbm93bkZvckdlb0dyb3VwID1cbiAgICAgICAgcG9saWN5LnByb21wdElmVW5rbm93bkZvckdlb0dyb3VwO1xuICAgICAgZGVsZXRlIHRoaXMuY29uc2VudENvbmZpZ19bJ2NvbnNlbnRzJ107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb25zZW50SWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0b3JlQ29uc2VudElkXyhjb25zZW50SWQpIHtcbiAgICAvLyBjaGVja0NvbnNlbnRIcmVmIHJlc3BvbnNlIG92ZXJyaWRlcyB0aGUgYW1wLWdlbyBjb25maWcsIGlmIHByb3ZpZGVkLlxuICAgIGlmICh0aGlzLmNvbnNlbnRDb25maWdfLmNoZWNrQ29uc2VudEhyZWYpIHtcbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uU0VUX0NPTlNFTlRfSUQsIGNvbnNlbnRJZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgdXNpbmcgYW1wLWFjY2VzcyB3aXRoIGFtcC1nZW8sIG9ubHkgc2V0IHRoZSBjb25zZW50IGlkIGlmIHRoZSB1c2VyIGlzXG4gICAgLy8gaW4gdGhlIGV4cGVjdGVkIGdlbyBncm91cC5cbiAgICBjb25zdCBnZW9Hcm91cCA9IHRoaXMuY29uc2VudENvbmZpZ18ucHJvbXB0SWZVbmtub3duRm9yR2VvR3JvdXA7XG4gICAgaWYgKGdlb0dyb3VwKSB7XG4gICAgICBTZXJ2aWNlcy5nZW9Gb3JEb2NPck51bGwodGhpcy5lbGVtZW50KS50aGVuKChnZW8pID0+IHtcbiAgICAgICAgY29uc3QgbWF0Y2hlZEdlb0dyb3VwcyA9IC8qKiBAdHlwZSB7IUFycmF5PHN0cmluZz59ICovIChcbiAgICAgICAgICBnZW8ubWF0Y2hlZElTT0NvdW50cnlHcm91cHNcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGdlbyAmJiAhbWF0Y2hlZEdlb0dyb3Vwcy5pbmNsdWRlcyhnZW9Hcm91cCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5TRVRfQ09OU0VOVF9JRCwgY29uc2VudElkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhY2NlcHQgYnV0dG9uIGZvbnQgY29sb3IgdG8gZWl0aGVyIHdoaXRlIG9yIGJsYWNrLCBkZXBlbmRpbmcgb25cbiAgICogdGhlIHB1Ymxpc2hlciBjdXN0b20gYmFja2dyb3VuZCBjb2xvci5cbiAgICogTXVzdCBiZSBjYWxsZWQgZnJvbSB0aGUgYGJ1aWxkQ2FsbGJhY2tgIG9yIGluIGFub3RoZXIgdnN5bmMgbXV0YXRlIHN0YXRlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0QWNjZXB0QnV0dG9uRm9udENvbG9yXygpIHtcbiAgICBjb25zdCBidXR0b25FbCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICB0aGlzLnN0b3J5Q29uc2VudEVsXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnLmktYW1waHRtbC1zdG9yeS1jb25zZW50LWFjdGlvbi1hY2NlcHQnXG4gICAgICApXG4gICAgKTtcbiAgICBjb25zdCBzdHlsZXMgPSBjb21wdXRlZFN0eWxlKHRoaXMud2luLCBidXR0b25FbCk7XG5cbiAgICBjb25zdCByZ2IgPSBnZXRSR0JGcm9tQ3NzQ29sb3JWYWx1ZShzdHlsZXNbJ2JhY2tncm91bmQtY29sb3InXSk7XG4gICAgY29uc3QgY29sb3IgPSBnZXRUZXh0Q29sb3JGb3JSR0IocmdiKTtcblxuICAgIHNldEltcG9ydGFudFN0eWxlcyhidXR0b25FbCwge2NvbG9yfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-consent.js