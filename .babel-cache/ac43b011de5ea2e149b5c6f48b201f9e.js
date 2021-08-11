function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import {
Action,
StateProperty,
getStoreService } from "./amp-story-store-service";

import { ActionTrust } from "../../../src/core/constants/action-constants";
import { CSS } from "../../../build/amp-story-consent-1.0.css";
import { Layout } from "../../../src/core/dom/layout";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { assertAbsoluteHttpOrHttpsUrl, assertHttpsUrl } from "../../../src/url";
import {
childElementByTag,
closest,
closestAncestorElementBySelector,
matches } from "../../../src/core/dom/query";

import { computedStyle, setImportantStyles } from "../../../src/core/dom/style";
import {
createShadowRootWithStyle,
getRGBFromCssColorValue,
getTextColorForRGB,
triggerClickFromLightDom } from "./utils";

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
  onlyAccept: false };


// TODO(gmajoulet): switch to `htmlFor` static template helper.
/**
 * Story consent template.
 * @param {!Object} config
 * @param {string} consentId
 * @param {?string} logoSrc
 * @return {!./simple-template.ElementDef}
 * @private @const
 */
var getTemplate = function getTemplate(config, consentId, logoSrc) {return ({
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-consent i-amphtml-story-system-reset' }),

    children: [
    {
      tag: 'div',
      attrs: dict({ 'class': 'i-amphtml-story-consent-overflow' }),
      children: [
      {
        tag: 'div',
        attrs: dict({ 'class': 'i-amphtml-story-consent-container' }),
        children: [
        {
          tag: 'div',
          attrs: dict({ 'class': 'i-amphtml-story-consent-header' }),
          children: [
          {
            tag: 'div',
            attrs: dict({
              'class': 'i-amphtml-story-consent-logo',
              'style': logoSrc ? "background-image: url('".concat(
              logoSrc, "') !important;") :
              '' }),

            children: [] }] },



        {
          tag: 'div',
          attrs: dict({ 'class': 'i-amphtml-story-consent-content' }),
          children: [
          {
            tag: 'h3',
            attrs: dict({}),
            children: [],
            unlocalizedString: config.title },

          {
            tag: 'p',
            attrs: dict({}),
            children: [],
            unlocalizedString: config.message },

          {
            tag: 'ul',
            attrs: dict({ 'class': 'i-amphtml-story-consent-vendors' }),
            children:
            config.vendors &&
            config.vendors.map(function (vendor) {return ({
                tag: 'li',
                attrs: dict({ 'class': 'i-amphtml-story-consent-vendor' }),
                children: [],
                unlocalizedString: vendor });}) },


          {
            tag: 'a',
            attrs: dict({
              'class':
              'i-amphtml-story-consent-external-link ' + (
              !(config.externalLink.title && config.externalLink.href) ?
              'i-amphtml-hidden' :
              ''),
              'href': config.externalLink.href,
              'target': '_top',
              'title': config.externalLink.title }),

            children: [],
            unlocalizedString: config.externalLink.title }] }] },





      {
        tag: 'div',
        attrs: dict({ 'class': 'i-amphtml-story-consent-actions' }),
        children: [
        {
          tag: 'button',
          attrs: dict({
            'class':
            'i-amphtml-story-consent-action ' +
            'i-amphtml-story-consent-action-reject' + (
            config.onlyAccept === true ? ' i-amphtml-hidden' : ''),
            'on': "tap:".concat(consentId, ".reject") }),

          children: [],
          localizedStringId:
          LocalizedStringId.AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL },

        {
          tag: 'button',
          attrs: dict({
            'class':
            'i-amphtml-story-consent-action ' +
            'i-amphtml-story-consent-action-accept',
            'on': "tap:".concat(consentId, ".accept") }),

          children: [],
          localizedStringId:
          LocalizedStringId.AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL }] }] }] });};








/**
 * The <amp-story-consent> custom element.
 */
export var AmpStoryConsent = /*#__PURE__*/function (_AMP$BaseElement) {_inherits(AmpStoryConsent, _AMP$BaseElement);var _super = _createSuper(AmpStoryConsent);
  /** @param {!AmpElement} element */
  function AmpStoryConsent(element) {var _this;_classCallCheck(this, AmpStoryConsent);
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
    _this.storyConsentEl_ = null;return _this;
  }

  /** @override */_createClass(AmpStoryConsent, [{ key: "buildCallback", value:
    function buildCallback() {
      this.actions_ = Services.actionServiceForDoc(this.element);

      this.assertAndParseConfig_();

      var storyEl = /** @type {!Element} */(
      closestAncestorElementBySelector(this.element, 'AMP-STORY'));

      var consentEl = closestAncestorElementBySelector(
      this.element,
      'AMP-CONSENT');

      var consentId = consentEl.id;

      this.storeConsentId_(consentId);

      var logoSrc = storyEl && storyEl.getAttribute('publisher-logo-src');

      if (logoSrc) {
        assertHttpsUrl(logoSrc, storyEl, 'publisher-logo-src');
      } else {
        user().warn(
        TAG,
        'Expected "publisher-logo-src" attribute on <amp-story>');

      }

      // Story consent config is set by the `assertAndParseConfig_` method.
      if (this.storyConsentConfig_) {
        this.storyConsentEl_ = renderAsElement(
        this.win.document,
        getTemplate(this.storyConsentConfig_, consentId, logoSrc));

        createShadowRootWithStyle(this.element, this.storyConsentEl_, CSS);

        // Allow <amp-consent> actions in STAMP (defaults to no actions allowed).
        var actions = [
        { tagOrTarget: 'AMP-CONSENT', method: 'accept' },
        { tagOrTarget: 'AMP-CONSENT', method: 'prompt' },
        { tagOrTarget: 'AMP-CONSENT', method: 'reject' }];

        this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, actions);

        this.setAcceptButtonFontColor_();

        this.initializeListeners_();
      }
    }

    /** @override */ }, { key: "isLayoutSupported", value:
    function isLayoutSupported(layout) {
      return layout == Layout.NODISPLAY;
    }

    /**
     * @private
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this2 = this;
      this.storyConsentEl_.addEventListener(
      'click',
      function (event) {return _this2.onClick_(event);},
      true /** useCapture */);


      this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      function (rtlState) {
        _this2.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */);

    }

    /**
     * Listens to click events to trigger the actions programatically.
     * Since events bubble up from the Shadow DOM but their target is updated to
     * the Shadow root, the top level actions event listeners would not detect
     * and trigger the actions upon click events.
     * @param {!Event} event
     * @private
     */ }, { key: "onClick_", value:
    function onClick_(event) {
      if (!event.target) {
        return;
      }
      if (event.target.hasAttribute('on')) {
        var targetEl = /** @type {!Element} */(event.target);
        this.actions_.trigger(targetEl, 'tap', event, ActionTrust.HIGH);
      }
      var anchorClicked = closest(event.target, function (e) {return matches(e, 'a[href]');});
      if (anchorClicked) {
        triggerClickFromLightDom(anchorClicked, this.element);
        event.preventDefault();
      }
    }

    /**
     * Reacts to RTL state updates and triggers the UI for RTL.
     * @param {boolean} rtlState
     * @private
     */ }, { key: "onRtlStateUpdate_", value:
    function onRtlStateUpdate_(rtlState) {var _this3 = this;
      var mutator = function mutator() {
        rtlState ?
        _this3.storyConsentEl_.setAttribute('dir', 'rtl') :
        _this3.storyConsentEl_.removeAttribute('dir');
      };

      this.mutateElement(mutator, this.storyConsentEl_);
    }

    /**
     * Validates the story-consent config. `story-consent` is a new parameter
     * specific to stories, added on the `amp-consent` JSON config.
     * @private
     */ }, { key: "assertAndParseConfig_", value:
    function assertAndParseConfig_() {
      // Validation of the amp-consent config is handled by the amp-consent
      // javascript.
      var parentEl = /** @type {!Element} */(this.element.parentElement);
      var consentScript = childElementByTag(parentEl, 'script');
      this.consentConfig_ = consentScript && parseJson(consentScript.textContent);
      this.mergeLegacyConsents_();

      // amp-consent already triggered console errors, step out to avoid polluting
      // the console.
      if (!this.consentConfig_) {
        return;
      }

      var storyConsentScript = childElementByTag(this.element, 'script');

      userAssert(
      storyConsentScript && isJsonScriptTag(storyConsentScript),
      "".concat(TAG, " config should be put in a <script> tag with ") +
      'type="application/json"');


      this.storyConsentConfig_ = _objectSpread(_objectSpread({},
      DEFAULT_OPTIONAL_PARAMETERS),
      parseJson(storyConsentScript.textContent));


      user().assertString(
      this.storyConsentConfig_.title, "".concat(
      TAG, ": config requires a title"));

      user().assertString(
      this.storyConsentConfig_.message, "".concat(
      TAG, ": config requires a message"));

      userAssert(
      this.storyConsentConfig_.vendors &&
      isArray(this.storyConsentConfig_.vendors), "".concat(
      TAG, ": config requires an array of vendors"));

      user().assertBoolean(
      this.storyConsentConfig_.onlyAccept, "".concat(
      TAG, ": config requires \"onlyAccept\" to be a boolean"));


      // Runs the validation if any of the title or link are provided, since
      // both have to be provided for the external link to be displayed.
      if (
      this.storyConsentConfig_.externalLink.href ||
      this.storyConsentConfig_.externalLink.title)
      {
        user().assertString(
        this.storyConsentConfig_.externalLink.title, "".concat(
        TAG, ": config requires \"externalLink.title\" to be a string"));

        user().assertString(
        this.storyConsentConfig_.externalLink.href, "".concat(
        TAG, ": config requires \"externalLink.href\" to be an absolute URL"));

        assertAbsoluteHttpOrHttpsUrl(this.storyConsentConfig_.externalLink.href);
      }
    }

    /**
     * Merge legacy `consents` policy object from
     * amp-consent config into top level.
     * @private
     */ }, { key: "mergeLegacyConsents_", value:
    function mergeLegacyConsents_() {
      var legacyConsents = this.consentConfig_['consents'];
      if (legacyConsents) {
        var policyId = Object.keys(legacyConsents)[0];
        var policy = legacyConsents[policyId];
        this.consentConfig_.consentInstanceId = policyId;
        this.consentConfig_.checkConsentHref = policy.checkConsentHref;
        this.consentConfig_.promptIfUnknownForGeoGroup =
        policy.promptIfUnknownForGeoGroup;
        delete this.consentConfig_['consents'];
      }
    }

    /**
     * @param {string} consentId
     * @private
     */ }, { key: "storeConsentId_", value:
    function storeConsentId_(consentId) {var _this4 = this;
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
          var matchedGeoGroups = /** @type {!Array<string>} */(
          geo.matchedISOCountryGroups);

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
     */ }, { key: "setAcceptButtonFontColor_", value:
    function setAcceptButtonFontColor_() {
      var buttonEl = /** @type {!Element} */(
      this.storyConsentEl_.querySelector(
      '.i-amphtml-story-consent-action-accept'));


      var styles = computedStyle(this.win, buttonEl);

      var rgb = getRGBFromCssColorValue(styles['background-color']);
      var color = getTextColorForRGB(rgb);

      setImportantStyles(buttonEl, { color: color });
    } }]);return AmpStoryConsent;}(AMP.BaseElement);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-consent.js