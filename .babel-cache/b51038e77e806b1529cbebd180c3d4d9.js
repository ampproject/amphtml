function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { Toast } from "./toast";
import {
copyTextToClipboard,
isCopyingToClipboardSupported } from "../../../src/core/window/clipboard";

import { dev, devAssert, user } from "../../../src/log";
import { dict, map } from "../../../src/core/types/object";
import { getLocalizationService } from "./amp-story-localization-service";
import { getRequestService } from "./amp-story-request-service";
import { isObject } from "../../../src/core/types";
import { listen } from "../../../src/event-helper";
import { renderAsElement, renderSimpleTemplate } from "./simple-template";

/**
 * Maps share provider type to visible name.
 * If the name only needs to be capitalized (e.g. `facebook` to `Facebook`) it
 * does not need to be included here.
 * @const {!Object<string, !LocalizedStringId>}
 */
var SHARE_PROVIDER_LOCALIZED_STRING_ID = map({
  'system': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM,
  'email': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL,
  'facebook': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK,
  'line': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINE,
  'linkedin': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN,
  'pinterest': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST,
  'gplus': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS,
  'tumblr': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR,
  'twitter': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TWITTER,
  'whatsapp': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP,
  'sms': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SMS });


/**
 * Key for share providers in config.
 * @const {string}
 */
export var SHARE_PROVIDERS_KEY = 'shareProviders';

/**
 * Deprecated key for share providers in config.
 * @const {string}
 */
export var DEPRECATED_SHARE_PROVIDERS_KEY = 'share-providers';

/** @private @const {!./simple-template.ElementDef} */
var TEMPLATE = {
  tag: 'div',
  attrs: dict({ 'class': 'i-amphtml-story-share-widget' }),
  children: [
  {
    tag: 'ul',
    attrs: dict({ 'class': 'i-amphtml-story-share-list' }),
    children: [
    {
      tag: 'li',
      attrs: dict({ 'class': 'i-amphtml-story-share-system' }) }] }] };






/** @private @const {!./simple-template.ElementDef} */
var SHARE_ITEM_TEMPLATE = {
  tag: 'li',
  attrs: dict({ 'class': 'i-amphtml-story-share-item' }) };


/**
 * @private
 * @param {!Element} el
 * @return {./simple-template-ElementDef}
 */
function buildLinkShareItemTemplate(el) {
  return {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-share-icon i-amphtml-story-share-icon-link',
      'tabindex': 0,
      'role': 'button',
      'aria-label': getLocalizationService(el).getLocalizedString(
      LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK) }),


    children: [
    {
      tag: 'span',
      attrs: dict({ 'class': 'i-amphtml-story-share-label' }),
      localizedStringId:
      LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK }] };



}

/**
 * @param {!JsonObject=} opt_params
 * @return {!JsonObject}
 */
function buildProviderParams(opt_params) {
  var attrs = dict();

  if (opt_params) {
    Object.keys(opt_params).forEach(function (field) {
      if (field === 'provider') {
        return;
      }
      attrs["data-param-".concat(field)] = opt_params[field];
    });
  }

  return attrs;
}

/**
 * @param {!Document} doc
 * @param {string} shareType
 * @param {!JsonObject=} opt_params
 * @return {!Node}
 */
function buildProvider(doc, shareType, opt_params) {
  var shareProviderLocalizedStringId = devAssert(
  SHARE_PROVIDER_LOCALIZED_STRING_ID[shareType]);



  return renderSimpleTemplate(
  doc,
  /** @type {!Array<!./simple-template.ElementDef>} */([
  {
    tag: 'amp-social-share',
    attrs: /** @type {!JsonObject} */(
    Object.assign(
    dict({
      'width': 48,
      'height': 48,
      'class': 'i-amphtml-story-share-icon',
      'type': shareType }),

    buildProviderParams(opt_params))),


    children: [
    {
      tag: 'span',
      attrs: dict({ 'class': 'i-amphtml-story-share-label' }),
      localizedStringId: shareProviderLocalizedStringId }] }]));





}

/**
 * @param {!Document} doc
 * @param {string} url
 * @return {!Element}
 */
function buildCopySuccessfulToast(doc, url) {
  return renderAsElement(
  doc,
  /** @type {!./simple-template.ElementDef} */({
    tag: 'div',
    attrs: dict({ 'class': 'i-amphtml-story-copy-successful' }),
    children: [
    {
      tag: 'div',
      localizedStringId:
      LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT },

    {
      tag: 'div',
      attrs: dict({ 'class': 'i-amphtml-story-copy-url' }),
      unlocalizedString: url }] }));




}

/**
 * Social share widget for the system button.
 */
export var ShareWidget = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  function ShareWidget(win, storyEl) {_classCallCheck(this, ShareWidget);
    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = null;

    /** @protected @const {!Window} */
    this.win = win;

    /** @protected @const {!Element} */
    this.storyEl = storyEl;

    /** @protected {?Element} */
    this.root = null;

    /** @private @const {!./amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = getRequestService(this.win, storyEl);
  }

  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   * @return {!ShareWidget}
   */_createClass(ShareWidget, [{ key: "build", value:




    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {!Element}
     */
    function build(ampdoc) {
      devAssert(!this.root);

      this.ampdoc_ = ampdoc;

      this.root = renderAsElement(this.win.document, TEMPLATE);

      this.loadProviders();
      this.maybeAddLinkShareButton_();
      this.maybeAddSystemShareButton_();

      return this.root;
    }

    /**
     * @return {!../../../src/service/ampdoc-impl.AmpDoc}
     * @private
     */ }, { key: "getAmpDoc_", value:
    function getAmpDoc_() {
      return devAssert(this.ampdoc_);
    }

    /** @private */ }, { key: "maybeAddLinkShareButton_", value:
    function maybeAddLinkShareButton_() {var _this = this;
      if (!isCopyingToClipboardSupported(this.win.document)) {
        return;
      }

      var linkShareButton = renderAsElement(
      this.win.document,
      buildLinkShareItemTemplate(this.storyEl));


      this.add_(linkShareButton);

      listen(linkShareButton, 'click', function (e) {
        e.preventDefault();
        _this.copyUrlToClipboard_();
      });
      listen(linkShareButton, 'keyup', function (e) {
        var code = e.charCode || e.keyCode;
        // Check if pressed Space or Enter to trigger button.
        if (code === 32 || code === 13) {
          e.preventDefault();
          _this.copyUrlToClipboard_();
        }
      });
    }

    /**
     * @private
     */ }, { key: "copyUrlToClipboard_", value:
    function copyUrlToClipboard_() {
      var url = Services.documentInfoForDoc(this.getAmpDoc_()).canonicalUrl;

      if (!copyTextToClipboard(this.win, url)) {
        var localizationService = getLocalizationService(this.storyEl);
        devAssert(localizationService);
        var failureString = localizationService.getLocalizedString(
        LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT);

        Toast.show(this.storyEl, /** @type {string} */(failureString));
        return;
      }

      Toast.show(this.storyEl, buildCopySuccessfulToast(this.win.document, url));
    }

    /** @private */ }, { key: "maybeAddSystemShareButton_", value:
    function maybeAddSystemShareButton_() {
      if (!this.isSystemShareSupported()) {
        // `amp-social-share` will hide `system` buttons when not supported, but
        // we also need to avoid adding it for rendering reasons.
        return;
      }

      var container = /** @type {!Element} */(
      this.root).
      querySelector('.i-amphtml-story-share-system');

      this.loadRequiredExtensions();

      container.appendChild(buildProvider(this.win.document, 'system'));
    }

    /**
     * NOTE(alanorozco): This is a duplicate of the logic in the
     * `amp-social-share` component.
     * @param  {!../../../src/service/ampdoc-impl.AmpDoc=}  ampdoc
     * @return {boolean} Whether the browser supports native system sharing.
     */ }, { key: "isSystemShareSupported", value:
    function isSystemShareSupported() {var ampdoc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAmpDoc_();
      var viewer = Services.viewerForDoc(ampdoc);

      var platform = Services.platformFor(this.win);

      // Chrome exports navigator.share in WebView but does not implement it.
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
      var isChromeWebview = viewer.isWebviewEmbedded() && platform.isChrome();

      return 'share' in navigator && !isChromeWebview;
    }

    /**
     * Loads and applies the share providers configured by the publisher.
     * @protected
     */ }, { key: "loadProviders", value:
    function loadProviders() {var _this2 = this;
      this.loadRequiredExtensions();

      this.requestService_.loadShareConfig().then(function (config) {
        var providers =
        config && (
        config[SHARE_PROVIDERS_KEY] || config[DEPRECATED_SHARE_PROVIDERS_KEY]);
        if (!providers) {
          return;
        }
        _this2.setProviders_(providers);
      });
    }

    /**
     * @param {(!Object<string, (!JsonObject|boolean)> | !Array<!Object|string>)} providers
     * @private
     * TODO(alanorozco): Set story metadata in share config.
     */ }, { key: "setProviders_", value:
    function setProviders_(providers) {var _this3 = this;
      /** @type {!Array} */(providers).forEach(function (provider) {
        if (isObject(provider)) {
          _this3.add_(
          buildProvider(
          _this3.win.document,
          provider['provider'],
          /** @type {!JsonObject} */(provider)));


          return;
        }

        if (provider == 'system') {
          user().warn(
          'AMP-STORY',
          '`system` is not a valid share provider type. Native sharing is ' +
          'enabled by default and cannot be turned off.',
          provider);

          return;
        }
        _this3.add_(
        buildProvider(_this3.win.document, /** @type {string} */(provider)));

      });
    }

    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc=} ampdoc
     */ }, { key: "loadRequiredExtensions", value:
    function loadRequiredExtensions() {var ampdoc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAmpDoc_();
      Services.extensionsFor(this.win).installExtensionForDoc(
      ampdoc,
      'amp-social-share');

    }

    /**
     * @param {!Node} node
     * @private
     */ }, { key: "add_", value:
    function add_(node) {
      var list = devAssert(this.root).lastElementChild;
      var item = renderAsElement(this.win.document, SHARE_ITEM_TEMPLATE);

      item.appendChild(node);

      // `lastElementChild` is the system share button container, which should
      // always be last in list
      list.insertBefore(item, list.lastElementChild);
    } }], [{ key: "create", value: function create(win, storyEl) {return new ShareWidget(win, storyEl);} }]);return ShareWidget;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-share.js