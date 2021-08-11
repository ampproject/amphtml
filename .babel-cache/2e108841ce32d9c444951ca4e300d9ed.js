function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { copyTextToClipboard, isCopyingToClipboardSupported } from "../../../src/core/window/clipboard";
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
  'sms': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SMS
});

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
  attrs: dict({
    'class': 'i-amphtml-story-share-widget'
  }),
  children: [{
    tag: 'ul',
    attrs: dict({
      'class': 'i-amphtml-story-share-list'
    }),
    children: [{
      tag: 'li',
      attrs: dict({
        'class': 'i-amphtml-story-share-system'
      })
    }]
  }]
};

/** @private @const {!./simple-template.ElementDef} */
var SHARE_ITEM_TEMPLATE = {
  tag: 'li',
  attrs: dict({
    'class': 'i-amphtml-story-share-item'
  })
};

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
      'aria-label': getLocalizationService(el).getLocalizedString(LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK)
    }),
    children: [{
      tag: 'span',
      attrs: dict({
        'class': 'i-amphtml-story-share-label'
      }),
      localizedStringId: LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK
    }]
  };
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

      attrs["data-param-" + field] = opt_params[field];
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
  var shareProviderLocalizedStringId = devAssert(SHARE_PROVIDER_LOCALIZED_STRING_ID[shareType], "No localized string to display name for share type " + shareType + ".");
  return renderSimpleTemplate(doc,
  /** @type {!Array<!./simple-template.ElementDef>} */
  [{
    tag: 'amp-social-share',
    attrs:
    /** @type {!JsonObject} */
    Object.assign(dict({
      'width': 48,
      'height': 48,
      'class': 'i-amphtml-story-share-icon',
      'type': shareType
    }), buildProviderParams(opt_params)),
    children: [{
      tag: 'span',
      attrs: dict({
        'class': 'i-amphtml-story-share-label'
      }),
      localizedStringId: shareProviderLocalizedStringId
    }]
  }]);
}

/**
 * @param {!Document} doc
 * @param {string} url
 * @return {!Element}
 */
function buildCopySuccessfulToast(doc, url) {
  return renderAsElement(doc,
  /** @type {!./simple-template.ElementDef} */
  {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-copy-successful'
    }),
    children: [{
      tag: 'div',
      localizedStringId: LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT
    }, {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-copy-url'
      }),
      unlocalizedString: url
    }]
  });
}

/**
 * Social share widget for the system button.
 */
export var ShareWidget = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  function ShareWidget(win, storyEl) {
    _classCallCheck(this, ShareWidget);

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
   */
  _createClass(ShareWidget, [{
    key: "build",
    value:
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {!Element}
     */
    function build(ampdoc) {
      devAssert(!this.root, 'Already built.');
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
     */

  }, {
    key: "getAmpDoc_",
    value: function getAmpDoc_() {
      return devAssert(this.ampdoc_);
    }
    /** @private */

  }, {
    key: "maybeAddLinkShareButton_",
    value: function maybeAddLinkShareButton_() {
      var _this = this;

      if (!isCopyingToClipboardSupported(this.win.document)) {
        return;
      }

      var linkShareButton = renderAsElement(this.win.document, buildLinkShareItemTemplate(this.storyEl));
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
     */

  }, {
    key: "copyUrlToClipboard_",
    value: function copyUrlToClipboard_() {
      var url = Services.documentInfoForDoc(this.getAmpDoc_()).canonicalUrl;

      if (!copyTextToClipboard(this.win, url)) {
        var localizationService = getLocalizationService(this.storyEl);
        devAssert(localizationService, 'Could not retrieve LocalizationService.');
        var failureString = localizationService.getLocalizedString(LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT);
        Toast.show(this.storyEl, dev().assertString(failureString));
        return;
      }

      Toast.show(this.storyEl, buildCopySuccessfulToast(this.win.document, url));
    }
    /** @private */

  }, {
    key: "maybeAddSystemShareButton_",
    value: function maybeAddSystemShareButton_() {
      if (!this.isSystemShareSupported()) {
        // `amp-social-share` will hide `system` buttons when not supported, but
        // we also need to avoid adding it for rendering reasons.
        return;
      }

      var container = dev().assertElement(this.root).querySelector('.i-amphtml-story-share-system');
      this.loadRequiredExtensions();
      container.appendChild(buildProvider(this.win.document, 'system'));
    }
    /**
     * NOTE(alanorozco): This is a duplicate of the logic in the
     * `amp-social-share` component.
     * @param  {!../../../src/service/ampdoc-impl.AmpDoc=}  ampdoc
     * @return {boolean} Whether the browser supports native system sharing.
     */

  }, {
    key: "isSystemShareSupported",
    value: function isSystemShareSupported(ampdoc) {
      if (ampdoc === void 0) {
        ampdoc = this.getAmpDoc_();
      }

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
     */

  }, {
    key: "loadProviders",
    value: function loadProviders() {
      var _this2 = this;

      this.loadRequiredExtensions();
      this.requestService_.loadShareConfig().then(function (config) {
        var providers = config && (config[SHARE_PROVIDERS_KEY] || config[DEPRECATED_SHARE_PROVIDERS_KEY]);

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
     */

  }, {
    key: "setProviders_",
    value: function setProviders_(providers) {
      var _this3 = this;

      /** @type {!Array} */
      providers.forEach(function (provider) {
        if (isObject(provider)) {
          _this3.add_(buildProvider(_this3.win.document, provider['provider'],
          /** @type {!JsonObject} */
          provider));

          return;
        }

        if (provider == 'system') {
          user().warn('AMP-STORY', '`system` is not a valid share provider type. Native sharing is ' + 'enabled by default and cannot be turned off.', provider);
          return;
        }

        _this3.add_(buildProvider(_this3.win.document,
        /** @type {string} */
        provider));
      });
    }
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc=} ampdoc
     */

  }, {
    key: "loadRequiredExtensions",
    value: function loadRequiredExtensions(ampdoc) {
      if (ampdoc === void 0) {
        ampdoc = this.getAmpDoc_();
      }

      Services.extensionsFor(this.win).installExtensionForDoc(ampdoc, 'amp-social-share');
    }
    /**
     * @param {!Node} node
     * @private
     */

  }, {
    key: "add_",
    value: function add_(node) {
      var list = devAssert(this.root).lastElementChild;
      var item = renderAsElement(this.win.document, SHARE_ITEM_TEMPLATE);
      item.appendChild(node);
      // `lastElementChild` is the system share button container, which should
      // always be last in list
      list.insertBefore(item, list.lastElementChild);
    }
  }], [{
    key: "create",
    value: function create(win, storyEl) {
      return new ShareWidget(win, storyEl);
    }
  }]);

  return ShareWidget;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1zaGFyZS5qcyJdLCJuYW1lcyI6WyJMb2NhbGl6ZWRTdHJpbmdJZCIsIlNlcnZpY2VzIiwiVG9hc3QiLCJjb3B5VGV4dFRvQ2xpcGJvYXJkIiwiaXNDb3B5aW5nVG9DbGlwYm9hcmRTdXBwb3J0ZWQiLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwiZGljdCIsIm1hcCIsImdldExvY2FsaXphdGlvblNlcnZpY2UiLCJnZXRSZXF1ZXN0U2VydmljZSIsImlzT2JqZWN0IiwibGlzdGVuIiwicmVuZGVyQXNFbGVtZW50IiwicmVuZGVyU2ltcGxlVGVtcGxhdGUiLCJTSEFSRV9QUk9WSURFUl9MT0NBTElaRURfU1RSSU5HX0lEIiwiQU1QX1NUT1JZX1NIQVJJTkdfUFJPVklERVJfTkFNRV9TWVNURU0iLCJBTVBfU1RPUllfU0hBUklOR19QUk9WSURFUl9OQU1FX0VNQUlMIiwiQU1QX1NUT1JZX1NIQVJJTkdfUFJPVklERVJfTkFNRV9GQUNFQk9PSyIsIkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfTElORSIsIkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfTElOS0VESU4iLCJBTVBfU1RPUllfU0hBUklOR19QUk9WSURFUl9OQU1FX1BJTlRFUkVTVCIsIkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfR09PR0xFX1BMVVMiLCJBTVBfU1RPUllfU0hBUklOR19QUk9WSURFUl9OQU1FX1RVTUJMUiIsIkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfVFdJVFRFUiIsIkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfV0hBVFNBUFAiLCJBTVBfU1RPUllfU0hBUklOR19QUk9WSURFUl9OQU1FX1NNUyIsIlNIQVJFX1BST1ZJREVSU19LRVkiLCJERVBSRUNBVEVEX1NIQVJFX1BST1ZJREVSU19LRVkiLCJURU1QTEFURSIsInRhZyIsImF0dHJzIiwiY2hpbGRyZW4iLCJTSEFSRV9JVEVNX1RFTVBMQVRFIiwiYnVpbGRMaW5rU2hhcmVJdGVtVGVtcGxhdGUiLCJlbCIsImdldExvY2FsaXplZFN0cmluZyIsIkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfTElOSyIsImxvY2FsaXplZFN0cmluZ0lkIiwiYnVpbGRQcm92aWRlclBhcmFtcyIsIm9wdF9wYXJhbXMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImZpZWxkIiwiYnVpbGRQcm92aWRlciIsImRvYyIsInNoYXJlVHlwZSIsInNoYXJlUHJvdmlkZXJMb2NhbGl6ZWRTdHJpbmdJZCIsImFzc2lnbiIsImJ1aWxkQ29weVN1Y2Nlc3NmdWxUb2FzdCIsInVybCIsIkFNUF9TVE9SWV9TSEFSSU5HX0NMSVBCT0FSRF9TVUNDRVNTX1RFWFQiLCJ1bmxvY2FsaXplZFN0cmluZyIsIlNoYXJlV2lkZ2V0Iiwid2luIiwic3RvcnlFbCIsImFtcGRvY18iLCJyb290IiwicmVxdWVzdFNlcnZpY2VfIiwiYW1wZG9jIiwiZG9jdW1lbnQiLCJsb2FkUHJvdmlkZXJzIiwibWF5YmVBZGRMaW5rU2hhcmVCdXR0b25fIiwibWF5YmVBZGRTeXN0ZW1TaGFyZUJ1dHRvbl8iLCJsaW5rU2hhcmVCdXR0b24iLCJhZGRfIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY29weVVybFRvQ2xpcGJvYXJkXyIsImNvZGUiLCJjaGFyQ29kZSIsImtleUNvZGUiLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJnZXRBbXBEb2NfIiwiY2Fub25pY2FsVXJsIiwibG9jYWxpemF0aW9uU2VydmljZSIsImZhaWx1cmVTdHJpbmciLCJBTVBfU1RPUllfU0hBUklOR19DTElQQk9BUkRfRkFJTFVSRV9URVhUIiwic2hvdyIsImFzc2VydFN0cmluZyIsImlzU3lzdGVtU2hhcmVTdXBwb3J0ZWQiLCJjb250YWluZXIiLCJhc3NlcnRFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImxvYWRSZXF1aXJlZEV4dGVuc2lvbnMiLCJhcHBlbmRDaGlsZCIsInZpZXdlciIsInZpZXdlckZvckRvYyIsInBsYXRmb3JtIiwicGxhdGZvcm1Gb3IiLCJpc0Nocm9tZVdlYnZpZXciLCJpc1dlYnZpZXdFbWJlZGRlZCIsImlzQ2hyb21lIiwibmF2aWdhdG9yIiwibG9hZFNoYXJlQ29uZmlnIiwidGhlbiIsImNvbmZpZyIsInByb3ZpZGVycyIsInNldFByb3ZpZGVyc18iLCJwcm92aWRlciIsIndhcm4iLCJleHRlbnNpb25zRm9yIiwiaW5zdGFsbEV4dGVuc2lvbkZvckRvYyIsIm5vZGUiLCJsaXN0IiwibGFzdEVsZW1lbnRDaGlsZCIsIml0ZW0iLCJpbnNlcnRCZWZvcmUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLGlCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLEtBQVI7QUFDQSxTQUNFQyxtQkFERixFQUVFQyw2QkFGRjtBQUlBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYixFQUF3QkMsSUFBeEI7QUFDQSxTQUFRQyxJQUFSLEVBQWNDLEdBQWQ7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLGlCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLE1BQVI7QUFDQSxTQUFRQyxlQUFSLEVBQXlCQyxvQkFBekI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsa0NBQWtDLEdBQUdQLEdBQUcsQ0FBQztBQUM3QyxZQUFVVCxpQkFBaUIsQ0FBQ2lCLHNDQURpQjtBQUU3QyxXQUFTakIsaUJBQWlCLENBQUNrQixxQ0FGa0I7QUFHN0MsY0FBWWxCLGlCQUFpQixDQUFDbUIsd0NBSGU7QUFJN0MsVUFBUW5CLGlCQUFpQixDQUFDb0Isb0NBSm1CO0FBSzdDLGNBQVlwQixpQkFBaUIsQ0FBQ3FCLHdDQUxlO0FBTTdDLGVBQWFyQixpQkFBaUIsQ0FBQ3NCLHlDQU5jO0FBTzdDLFdBQVN0QixpQkFBaUIsQ0FBQ3VCLDJDQVBrQjtBQVE3QyxZQUFV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LHNCQUFqQyxDQUNFM0MsTUFERixFQUVFLGtCQUZGO0FBSUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUExTUE7QUFBQTtBQUFBLFdBMk1FLGNBQUs0QyxJQUFMLEVBQVc7QUFDVCxVQUFNQyxJQUFJLEdBQUdwRyxTQUFTLENBQUMsS0FBS3FELElBQU4sQ0FBVCxDQUFxQmdELGdCQUFsQztBQUNBLFVBQU1DLElBQUksR0FBRzlGLGVBQWUsQ0FBQyxLQUFLMEMsR0FBTCxDQUFTTSxRQUFWLEVBQW9CNUIsbUJBQXBCLENBQTVCO0FBRUEwRSxNQUFBQSxJQUFJLENBQUNyQixXQUFMLENBQWlCa0IsSUFBakI7QUFFQTtBQUNBO0FBQ0FDLE1BQUFBLElBQUksQ0FBQ0csWUFBTCxDQUFrQkQsSUFBbEIsRUFBd0JGLElBQUksQ0FBQ0MsZ0JBQTdCO0FBQ0Q7QUFwTkg7QUFBQTtBQUFBLFdBMkJFLGdCQUFjbkQsR0FBZCxFQUFtQkMsT0FBbkIsRUFBNEI7QUFDMUIsYUFBTyxJQUFJRixXQUFKLENBQWdCQyxHQUFoQixFQUFxQkMsT0FBckIsQ0FBUDtBQUNEO0FBN0JIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7VG9hc3R9IGZyb20gJy4vdG9hc3QnO1xuaW1wb3J0IHtcbiAgY29weVRleHRUb0NsaXBib2FyZCxcbiAgaXNDb3B5aW5nVG9DbGlwYm9hcmRTdXBwb3J0ZWQsXG59IGZyb20gJyNjb3JlL3dpbmRvdy9jbGlwYm9hcmQnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3QsIG1hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7Z2V0TG9jYWxpemF0aW9uU2VydmljZX0gZnJvbSAnLi9hbXAtc3RvcnktbG9jYWxpemF0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHtnZXRSZXF1ZXN0U2VydmljZX0gZnJvbSAnLi9hbXAtc3RvcnktcmVxdWVzdC1zZXJ2aWNlJztcbmltcG9ydCB7aXNPYmplY3R9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7bGlzdGVufSBmcm9tICcuLi8uLi8uLi9zcmMvZXZlbnQtaGVscGVyJztcbmltcG9ydCB7cmVuZGVyQXNFbGVtZW50LCByZW5kZXJTaW1wbGVUZW1wbGF0ZX0gZnJvbSAnLi9zaW1wbGUtdGVtcGxhdGUnO1xuXG4vKipcbiAqIE1hcHMgc2hhcmUgcHJvdmlkZXIgdHlwZSB0byB2aXNpYmxlIG5hbWUuXG4gKiBJZiB0aGUgbmFtZSBvbmx5IG5lZWRzIHRvIGJlIGNhcGl0YWxpemVkIChlLmcuIGBmYWNlYm9va2AgdG8gYEZhY2Vib29rYCkgaXRcbiAqIGRvZXMgbm90IG5lZWQgdG8gYmUgaW5jbHVkZWQgaGVyZS5cbiAqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsICFMb2NhbGl6ZWRTdHJpbmdJZD59XG4gKi9cbmNvbnN0IFNIQVJFX1BST1ZJREVSX0xPQ0FMSVpFRF9TVFJJTkdfSUQgPSBtYXAoe1xuICAnc3lzdGVtJzogTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX1NIQVJJTkdfUFJPVklERVJfTkFNRV9TWVNURU0sXG4gICdlbWFpbCc6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfRU1BSUwsXG4gICdmYWNlYm9vayc6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfRkFDRUJPT0ssXG4gICdsaW5lJzogTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX1NIQVJJTkdfUFJPVklERVJfTkFNRV9MSU5FLFxuICAnbGlua2VkaW4nOiBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfU0hBUklOR19QUk9WSURFUl9OQU1FX0xJTktFRElOLFxuICAncGludGVyZXN0JzogTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX1NIQVJJTkdfUFJPVklERVJfTkFNRV9QSU5URVJFU1QsXG4gICdncGx1cyc6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfR09PR0xFX1BMVVMsXG4gICd0dW1ibHInOiBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfU0hBUklOR19QUk9WSURFUl9OQU1FX1RVTUJMUixcbiAgJ3R3aXR0ZXInOiBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfU0hBUklOR19QUk9WSURFUl9OQU1FX1RXSVRURVIsXG4gICd3aGF0c2FwcCc6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfV0hBVFNBUFAsXG4gICdzbXMnOiBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfU0hBUklOR19QUk9WSURFUl9OQU1FX1NNUyxcbn0pO1xuXG4vKipcbiAqIEtleSBmb3Igc2hhcmUgcHJvdmlkZXJzIGluIGNvbmZpZy5cbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBUkVfUFJPVklERVJTX0tFWSA9ICdzaGFyZVByb3ZpZGVycyc7XG5cbi8qKlxuICogRGVwcmVjYXRlZCBrZXkgZm9yIHNoYXJlIHByb3ZpZGVycyBpbiBjb25maWcuXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IERFUFJFQ0FURURfU0hBUkVfUFJPVklERVJTX0tFWSA9ICdzaGFyZS1wcm92aWRlcnMnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHshLi9zaW1wbGUtdGVtcGxhdGUuRWxlbWVudERlZn0gKi9cbmNvbnN0IFRFTVBMQVRFID0ge1xuICB0YWc6ICdkaXYnLFxuICBhdHRyczogZGljdCh7J2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1zaGFyZS13aWRnZXQnfSksXG4gIGNoaWxkcmVuOiBbXG4gICAge1xuICAgICAgdGFnOiAndWwnLFxuICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc2hhcmUtbGlzdCd9KSxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdsaScsXG4gICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc2hhcmUtc3lzdGVtJ30pLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdLFxufTtcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vc2ltcGxlLXRlbXBsYXRlLkVsZW1lbnREZWZ9ICovXG5jb25zdCBTSEFSRV9JVEVNX1RFTVBMQVRFID0ge1xuICB0YWc6ICdsaScsXG4gIGF0dHJzOiBkaWN0KHsnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LXNoYXJlLWl0ZW0nfSksXG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICogQHJldHVybiB7Li9zaW1wbGUtdGVtcGxhdGUtRWxlbWVudERlZn1cbiAqL1xuZnVuY3Rpb24gYnVpbGRMaW5rU2hhcmVJdGVtVGVtcGxhdGUoZWwpIHtcbiAgcmV0dXJuIHtcbiAgICB0YWc6ICdkaXYnLFxuICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICdjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc2hhcmUtaWNvbiBpLWFtcGh0bWwtc3Rvcnktc2hhcmUtaWNvbi1saW5rJyxcbiAgICAgICd0YWJpbmRleCc6IDAsXG4gICAgICAncm9sZSc6ICdidXR0b24nLFxuICAgICAgJ2FyaWEtbGFiZWwnOiBnZXRMb2NhbGl6YXRpb25TZXJ2aWNlKGVsKS5nZXRMb2NhbGl6ZWRTdHJpbmcoXG4gICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfTElOS1xuICAgICAgKSxcbiAgICB9KSxcbiAgICBjaGlsZHJlbjogW1xuICAgICAge1xuICAgICAgICB0YWc6ICdzcGFuJyxcbiAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc2hhcmUtbGFiZWwnfSksXG4gICAgICAgIGxvY2FsaXplZFN0cmluZ0lkOlxuICAgICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSEFSSU5HX1BST1ZJREVSX05BTUVfTElOSyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFKc29uT2JqZWN0PX0gb3B0X3BhcmFtc1xuICogQHJldHVybiB7IUpzb25PYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGJ1aWxkUHJvdmlkZXJQYXJhbXMob3B0X3BhcmFtcykge1xuICBjb25zdCBhdHRycyA9IGRpY3QoKTtcblxuICBpZiAob3B0X3BhcmFtcykge1xuICAgIE9iamVjdC5rZXlzKG9wdF9wYXJhbXMpLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICBpZiAoZmllbGQgPT09ICdwcm92aWRlcicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXR0cnNbYGRhdGEtcGFyYW0tJHtmaWVsZH1gXSA9IG9wdF9wYXJhbXNbZmllbGRdO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGF0dHJzO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaGFyZVR5cGVcbiAqIEBwYXJhbSB7IUpzb25PYmplY3Q9fSBvcHRfcGFyYW1zXG4gKiBAcmV0dXJuIHshTm9kZX1cbiAqL1xuZnVuY3Rpb24gYnVpbGRQcm92aWRlcihkb2MsIHNoYXJlVHlwZSwgb3B0X3BhcmFtcykge1xuICBjb25zdCBzaGFyZVByb3ZpZGVyTG9jYWxpemVkU3RyaW5nSWQgPSBkZXZBc3NlcnQoXG4gICAgU0hBUkVfUFJPVklERVJfTE9DQUxJWkVEX1NUUklOR19JRFtzaGFyZVR5cGVdLFxuICAgIGBObyBsb2NhbGl6ZWQgc3RyaW5nIHRvIGRpc3BsYXkgbmFtZSBmb3Igc2hhcmUgdHlwZSAke3NoYXJlVHlwZX0uYFxuICApO1xuXG4gIHJldHVybiByZW5kZXJTaW1wbGVUZW1wbGF0ZShcbiAgICBkb2MsXG4gICAgLyoqIEB0eXBlIHshQXJyYXk8IS4vc2ltcGxlLXRlbXBsYXRlLkVsZW1lbnREZWY+fSAqLyAoW1xuICAgICAge1xuICAgICAgICB0YWc6ICdhbXAtc29jaWFsLXNoYXJlJyxcbiAgICAgICAgYXR0cnM6IC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovIChcbiAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgZGljdCh7XG4gICAgICAgICAgICAgICd3aWR0aCc6IDQ4LFxuICAgICAgICAgICAgICAnaGVpZ2h0JzogNDgsXG4gICAgICAgICAgICAgICdjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc2hhcmUtaWNvbicsXG4gICAgICAgICAgICAgICd0eXBlJzogc2hhcmVUeXBlLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBidWlsZFByb3ZpZGVyUGFyYW1zKG9wdF9wYXJhbXMpXG4gICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRhZzogJ3NwYW4nLFxuICAgICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc2hhcmUtbGFiZWwnfSksXG4gICAgICAgICAgICBsb2NhbGl6ZWRTdHJpbmdJZDogc2hhcmVQcm92aWRlckxvY2FsaXplZFN0cmluZ0lkLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0pXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY1xuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIGJ1aWxkQ29weVN1Y2Nlc3NmdWxUb2FzdChkb2MsIHVybCkge1xuICByZXR1cm4gcmVuZGVyQXNFbGVtZW50KFxuICAgIGRvYyxcbiAgICAvKiogQHR5cGUgeyEuL3NpbXBsZS10ZW1wbGF0ZS5FbGVtZW50RGVmfSAqLyAoe1xuICAgICAgdGFnOiAnZGl2JyxcbiAgICAgIGF0dHJzOiBkaWN0KHsnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LWNvcHktc3VjY2Vzc2Z1bCd9KSxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgIGxvY2FsaXplZFN0cmluZ0lkOlxuICAgICAgICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX1NIQVJJTkdfQ0xJUEJPQVJEX1NVQ0NFU1NfVEVYVCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktY29weS11cmwnfSksXG4gICAgICAgICAgdW5sb2NhbGl6ZWRTdHJpbmc6IHVybCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSlcbiAgKTtcbn1cblxuLyoqXG4gKiBTb2NpYWwgc2hhcmUgd2lkZ2V0IGZvciB0aGUgc3lzdGVtIGJ1dHRvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFNoYXJlV2lkZ2V0IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHN0b3J5RWxcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgc3RvcnlFbCkge1xuICAgIC8qKiBAcHJpdmF0ZSB7Py4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvY18gPSBudWxsO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gd2luO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLnN0b3J5RWwgPSBzdG9yeUVsO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez9FbGVtZW50fSAqL1xuICAgIHRoaXMucm9vdCA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9hbXAtc3RvcnktcmVxdWVzdC1zZXJ2aWNlLkFtcFN0b3J5UmVxdWVzdFNlcnZpY2V9ICovXG4gICAgdGhpcy5yZXF1ZXN0U2VydmljZV8gPSBnZXRSZXF1ZXN0U2VydmljZSh0aGlzLndpbiwgc3RvcnlFbCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gc3RvcnlFbFxuICAgKiBAcmV0dXJuIHshU2hhcmVXaWRnZXR9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlKHdpbiwgc3RvcnlFbCkge1xuICAgIHJldHVybiBuZXcgU2hhcmVXaWRnZXQod2luLCBzdG9yeUVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICovXG4gIGJ1aWxkKGFtcGRvYykge1xuICAgIGRldkFzc2VydCghdGhpcy5yb290LCAnQWxyZWFkeSBidWlsdC4nKTtcblxuICAgIHRoaXMuYW1wZG9jXyA9IGFtcGRvYztcblxuICAgIHRoaXMucm9vdCA9IHJlbmRlckFzRWxlbWVudCh0aGlzLndpbi5kb2N1bWVudCwgVEVNUExBVEUpO1xuXG4gICAgdGhpcy5sb2FkUHJvdmlkZXJzKCk7XG4gICAgdGhpcy5tYXliZUFkZExpbmtTaGFyZUJ1dHRvbl8oKTtcbiAgICB0aGlzLm1heWJlQWRkU3lzdGVtU2hhcmVCdXR0b25fKCk7XG5cbiAgICByZXR1cm4gdGhpcy5yb290O1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRBbXBEb2NfKCkge1xuICAgIHJldHVybiBkZXZBc3NlcnQodGhpcy5hbXBkb2NfKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBtYXliZUFkZExpbmtTaGFyZUJ1dHRvbl8oKSB7XG4gICAgaWYgKCFpc0NvcHlpbmdUb0NsaXBib2FyZFN1cHBvcnRlZCh0aGlzLndpbi5kb2N1bWVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5rU2hhcmVCdXR0b24gPSByZW5kZXJBc0VsZW1lbnQoXG4gICAgICB0aGlzLndpbi5kb2N1bWVudCxcbiAgICAgIGJ1aWxkTGlua1NoYXJlSXRlbVRlbXBsYXRlKHRoaXMuc3RvcnlFbClcbiAgICApO1xuXG4gICAgdGhpcy5hZGRfKGxpbmtTaGFyZUJ1dHRvbik7XG5cbiAgICBsaXN0ZW4obGlua1NoYXJlQnV0dG9uLCAnY2xpY2snLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5jb3B5VXJsVG9DbGlwYm9hcmRfKCk7XG4gICAgfSk7XG4gICAgbGlzdGVuKGxpbmtTaGFyZUJ1dHRvbiwgJ2tleXVwJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IGNvZGUgPSBlLmNoYXJDb2RlIHx8IGUua2V5Q29kZTtcbiAgICAgIC8vIENoZWNrIGlmIHByZXNzZWQgU3BhY2Ugb3IgRW50ZXIgdG8gdHJpZ2dlciBidXR0b24uXG4gICAgICBpZiAoY29kZSA9PT0gMzIgfHwgY29kZSA9PT0gMTMpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmNvcHlVcmxUb0NsaXBib2FyZF8oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY29weVVybFRvQ2xpcGJvYXJkXygpIHtcbiAgICBjb25zdCB1cmwgPSBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2ModGhpcy5nZXRBbXBEb2NfKCkpLmNhbm9uaWNhbFVybDtcblxuICAgIGlmICghY29weVRleHRUb0NsaXBib2FyZCh0aGlzLndpbiwgdXJsKSkge1xuICAgICAgY29uc3QgbG9jYWxpemF0aW9uU2VydmljZSA9IGdldExvY2FsaXphdGlvblNlcnZpY2UodGhpcy5zdG9yeUVsKTtcbiAgICAgIGRldkFzc2VydChsb2NhbGl6YXRpb25TZXJ2aWNlLCAnQ291bGQgbm90IHJldHJpZXZlIExvY2FsaXphdGlvblNlcnZpY2UuJyk7XG4gICAgICBjb25zdCBmYWlsdXJlU3RyaW5nID0gbG9jYWxpemF0aW9uU2VydmljZS5nZXRMb2NhbGl6ZWRTdHJpbmcoXG4gICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSEFSSU5HX0NMSVBCT0FSRF9GQUlMVVJFX1RFWFRcbiAgICAgICk7XG4gICAgICBUb2FzdC5zaG93KHRoaXMuc3RvcnlFbCwgZGV2KCkuYXNzZXJ0U3RyaW5nKGZhaWx1cmVTdHJpbmcpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBUb2FzdC5zaG93KHRoaXMuc3RvcnlFbCwgYnVpbGRDb3B5U3VjY2Vzc2Z1bFRvYXN0KHRoaXMud2luLmRvY3VtZW50LCB1cmwpKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBtYXliZUFkZFN5c3RlbVNoYXJlQnV0dG9uXygpIHtcbiAgICBpZiAoIXRoaXMuaXNTeXN0ZW1TaGFyZVN1cHBvcnRlZCgpKSB7XG4gICAgICAvLyBgYW1wLXNvY2lhbC1zaGFyZWAgd2lsbCBoaWRlIGBzeXN0ZW1gIGJ1dHRvbnMgd2hlbiBub3Qgc3VwcG9ydGVkLCBidXRcbiAgICAgIC8vIHdlIGFsc28gbmVlZCB0byBhdm9pZCBhZGRpbmcgaXQgZm9yIHJlbmRlcmluZyByZWFzb25zLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRldigpXG4gICAgICAuYXNzZXJ0RWxlbWVudCh0aGlzLnJvb3QpXG4gICAgICAucXVlcnlTZWxlY3RvcignLmktYW1waHRtbC1zdG9yeS1zaGFyZS1zeXN0ZW0nKTtcblxuICAgIHRoaXMubG9hZFJlcXVpcmVkRXh0ZW5zaW9ucygpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1aWxkUHJvdmlkZXIodGhpcy53aW4uZG9jdW1lbnQsICdzeXN0ZW0nKSk7XG4gIH1cblxuICAvKipcbiAgICogTk9URShhbGFub3JvemNvKTogVGhpcyBpcyBhIGR1cGxpY2F0ZSBvZiB0aGUgbG9naWMgaW4gdGhlXG4gICAqIGBhbXAtc29jaWFsLXNoYXJlYCBjb21wb25lbnQuXG4gICAqIEBwYXJhbSAgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2M9fSAgYW1wZG9jXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgbmF0aXZlIHN5c3RlbSBzaGFyaW5nLlxuICAgKi9cbiAgaXNTeXN0ZW1TaGFyZVN1cHBvcnRlZChhbXBkb2MgPSB0aGlzLmdldEFtcERvY18oKSkge1xuICAgIGNvbnN0IHZpZXdlciA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhhbXBkb2MpO1xuXG4gICAgY29uc3QgcGxhdGZvcm0gPSBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0aGlzLndpbik7XG5cbiAgICAvLyBDaHJvbWUgZXhwb3J0cyBuYXZpZ2F0b3Iuc2hhcmUgaW4gV2ViVmlldyBidXQgZG9lcyBub3QgaW1wbGVtZW50IGl0LlxuICAgIC8vIFNlZSBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD03NjU5MjNcbiAgICBjb25zdCBpc0Nocm9tZVdlYnZpZXcgPSB2aWV3ZXIuaXNXZWJ2aWV3RW1iZWRkZWQoKSAmJiBwbGF0Zm9ybS5pc0Nocm9tZSgpO1xuXG4gICAgcmV0dXJuICdzaGFyZScgaW4gbmF2aWdhdG9yICYmICFpc0Nocm9tZVdlYnZpZXc7XG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgYW5kIGFwcGxpZXMgdGhlIHNoYXJlIHByb3ZpZGVycyBjb25maWd1cmVkIGJ5IHRoZSBwdWJsaXNoZXIuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGxvYWRQcm92aWRlcnMoKSB7XG4gICAgdGhpcy5sb2FkUmVxdWlyZWRFeHRlbnNpb25zKCk7XG5cbiAgICB0aGlzLnJlcXVlc3RTZXJ2aWNlXy5sb2FkU2hhcmVDb25maWcoKS50aGVuKChjb25maWcpID0+IHtcbiAgICAgIGNvbnN0IHByb3ZpZGVycyA9XG4gICAgICAgIGNvbmZpZyAmJlxuICAgICAgICAoY29uZmlnW1NIQVJFX1BST1ZJREVSU19LRVldIHx8IGNvbmZpZ1tERVBSRUNBVEVEX1NIQVJFX1BST1ZJREVSU19LRVldKTtcbiAgICAgIGlmICghcHJvdmlkZXJzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJvdmlkZXJzXyhwcm92aWRlcnMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7KCFPYmplY3Q8c3RyaW5nLCAoIUpzb25PYmplY3R8Ym9vbGVhbik+IHwgIUFycmF5PCFPYmplY3R8c3RyaW5nPil9IHByb3ZpZGVyc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBUT0RPKGFsYW5vcm96Y28pOiBTZXQgc3RvcnkgbWV0YWRhdGEgaW4gc2hhcmUgY29uZmlnLlxuICAgKi9cbiAgc2V0UHJvdmlkZXJzXyhwcm92aWRlcnMpIHtcbiAgICAvKiogQHR5cGUgeyFBcnJheX0gKi8gKHByb3ZpZGVycykuZm9yRWFjaCgocHJvdmlkZXIpID0+IHtcbiAgICAgIGlmIChpc09iamVjdChwcm92aWRlcikpIHtcbiAgICAgICAgdGhpcy5hZGRfKFxuICAgICAgICAgIGJ1aWxkUHJvdmlkZXIoXG4gICAgICAgICAgICB0aGlzLndpbi5kb2N1bWVudCxcbiAgICAgICAgICAgIHByb3ZpZGVyWydwcm92aWRlciddLFxuICAgICAgICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHByb3ZpZGVyKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvdmlkZXIgPT0gJ3N5c3RlbScpIHtcbiAgICAgICAgdXNlcigpLndhcm4oXG4gICAgICAgICAgJ0FNUC1TVE9SWScsXG4gICAgICAgICAgJ2BzeXN0ZW1gIGlzIG5vdCBhIHZhbGlkIHNoYXJlIHByb3ZpZGVyIHR5cGUuIE5hdGl2ZSBzaGFyaW5nIGlzICcgK1xuICAgICAgICAgICAgJ2VuYWJsZWQgYnkgZGVmYXVsdCBhbmQgY2Fubm90IGJlIHR1cm5lZCBvZmYuJyxcbiAgICAgICAgICBwcm92aWRlclxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmFkZF8oXG4gICAgICAgIGJ1aWxkUHJvdmlkZXIodGhpcy53aW4uZG9jdW1lbnQsIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAocHJvdmlkZXIpKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2M9fSBhbXBkb2NcbiAgICovXG4gIGxvYWRSZXF1aXJlZEV4dGVuc2lvbnMoYW1wZG9jID0gdGhpcy5nZXRBbXBEb2NfKCkpIHtcbiAgICBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKHRoaXMud2luKS5pbnN0YWxsRXh0ZW5zaW9uRm9yRG9jKFxuICAgICAgYW1wZG9jLFxuICAgICAgJ2FtcC1zb2NpYWwtc2hhcmUnXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhZGRfKG5vZGUpIHtcbiAgICBjb25zdCBsaXN0ID0gZGV2QXNzZXJ0KHRoaXMucm9vdCkubGFzdEVsZW1lbnRDaGlsZDtcbiAgICBjb25zdCBpdGVtID0gcmVuZGVyQXNFbGVtZW50KHRoaXMud2luLmRvY3VtZW50LCBTSEFSRV9JVEVNX1RFTVBMQVRFKTtcblxuICAgIGl0ZW0uYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICAvLyBgbGFzdEVsZW1lbnRDaGlsZGAgaXMgdGhlIHN5c3RlbSBzaGFyZSBidXR0b24gY29udGFpbmVyLCB3aGljaCBzaG91bGRcbiAgICAvLyBhbHdheXMgYmUgbGFzdCBpbiBsaXN0XG4gICAgbGlzdC5pbnNlcnRCZWZvcmUoaXRlbSwgbGlzdC5sYXN0RWxlbWVudENoaWxkKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-share.js