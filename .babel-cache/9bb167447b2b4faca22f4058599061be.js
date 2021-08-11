function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { PriorityQueue } from "../core/data-structures/priority-queue";
import { isIframed, tryFocus } from "../core/dom";
import { escapeCssSelectorIdent } from "../core/dom/css-selectors";
import { closestAncestorElementBySelector } from "../core/dom/query";
import { dict } from "../core/types/object";
import { toWin } from "../core/window";
import { Services } from "./";
import { getExtraParamsUrl, shouldAppendExtraParams } from "../impression";
import { dev, user, userAssert } from "../log";
import { getMode } from "../mode";
import { openWindowDialog } from "../open-window-dialog";
import { registerServiceBuilderForDoc } from "../service-helpers";
import { isLocalhostOrigin } from "../url";
var TAG = 'navigation';

/** @private @const {string} */
var EVENT_TYPE_CLICK = 'click';

/** @private @const {string} */
var EVENT_TYPE_CONTEXT_MENU = 'contextmenu';
var VALID_TARGETS = ['_top', '_blank'];

/** @private @const {string} */
var ORIG_HREF_ATTRIBUTE = 'data-a4a-orig-href';

/**
 * Key used for retargeting event target originating from shadow DOM.
 * @const {string}
 */
var AMP_CUSTOM_LINKER_TARGET = '__AMP_CUSTOM_LINKER_TARGET__';

/**
 * @enum {number} Priority reserved for extensions in anchor mutations.
 * The higher the priority, the sooner it's invoked.
 */
export var Priority = {
  LINK_REWRITER_MANAGER: 0,
  ANALYTICS_LINKER: 2
};

/**
 * Install navigation service for ampdoc, which handles navigations from anchor
 * tag clicks and other runtime features like AMP.navigateTo().
 *
 * Immediately instantiates the service.
 *
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installGlobalNavigationHandlerForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, TAG, Navigation,
  /* opt_instantiate */
  true);
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Event} e
 * @visibleForTesting
 */
export function maybeExpandUrlParamsForTesting(ampdoc, e) {
  maybeExpandUrlParams(ampdoc, e);
}

/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 * @visibleForTesting
 */
export var Navigation = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function Navigation(ampdoc) {
    var _this = this;

    _classCallCheck(this, Navigation);

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!Document|!ShadowRoot} */
    this.rootNode_ = ampdoc.getRootNode();

    /** @private @const {!./viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private @const {!./viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc);

    /** @private @const {!./history-impl.History} */
    this.history_ = Services.historyForDoc(this.ampdoc);

    /** @private @const {!./platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.ampdoc.win);

    /** @private @const {boolean} */
    this.isIosSafari_ = this.platform_.isIos() && this.platform_.isSafari();

    /** @private @const {boolean} */
    this.isIframed_ = isIframed(this.ampdoc.win) && this.viewer_.isOvertakeHistory();

    /** @private @const {boolean} */
    this.isEmbed_ = this.rootNode_ != this.ampdoc.getRootNode() || !!this.ampdoc.getParent();

    /** @private @const {boolean} */
    this.isInABox_ = getMode(this.ampdoc.win).runtime == 'inabox';

    /**
     * Must use URL parsing scoped to `rootNode_` for correct FIE behavior.
     * @private @const {!Element|!ShadowRoot}
     */
    this.serviceContext_ =
    /** @type {!Element|!ShadowRoot} */
    this.rootNode_.nodeType == Node.DOCUMENT_NODE ? this.rootNode_.documentElement : this.rootNode_;

    /** @private @const {!function(!Event)|undefined} */
    this.boundHandle_ = this.handle_.bind(this);
    this.rootNode_.addEventListener(EVENT_TYPE_CLICK, this.boundHandle_);
    this.rootNode_.addEventListener(EVENT_TYPE_CONTEXT_MENU, this.boundHandle_);

    /** @private {boolean} */
    this.appendExtraParams_ = false;
    shouldAppendExtraParams(this.ampdoc).then(function (res) {
      _this.appendExtraParams_ = res;
    });

    /** @private {boolean} */
    this.isTrustedViewer_ = false;

    /** @private {boolean} */
    this.isLocalViewer_ = false;
    Promise.all([this.viewer_.isTrustedViewer(), this.viewer_.getViewerOrigin()]).then(function (values) {
      _this.isTrustedViewer_ = values[0];
      _this.isLocalViewer_ = isLocalhostOrigin(values[1]);
    });

    /**
     * Lazy-generated list of A2A-enabled navigation features.
     * @private {?Array<string>}
     */
    this.a2aFeatures_ = null;

    /**
     * @type {!PriorityQueue<function(!Element, !Event)>}
     * @private
     * @const
     */
    this.anchorMutators_ = new PriorityQueue();

    /**
     * @type {!PriorityQueue<function(string)>}
     * @private
     * @const
     */
    this.navigateToMutators_ = new PriorityQueue();
  }

  /**
   * Registers a handler that performs URL replacement on the href
   * of an ad click.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!Window} win
   */
  _createClass(Navigation, [{
    key: "cleanup",
    value:
    /**
     * Removes all event listeners.
     */
    function cleanup() {
      if (this.boundHandle_) {
        this.rootNode_.removeEventListener(EVENT_TYPE_CLICK, this.boundHandle_);
        this.rootNode_.removeEventListener(EVENT_TYPE_CONTEXT_MENU, this.boundHandle_);
      }
    }
    /**
     * Opens a new window with the specified target.
     *
     * @param {!Window} win A window to use to open a new window.
     * @param {string} url THe URL to open.
     * @param {string} target The target for the newly opened window.
     * @param {boolean} opener Whether or not the new window should have acccess
     *   to the opener (win).
     */

  }, {
    key: "openWindow",
    value: function openWindow(win, url, target, opener) {
      var options = '';

      // We don't pass noopener for Chrome since it opens a new window without
      // tabs. Instead, we remove the opener property from the newly opened
      // window.
      // Note: for Safari, we need to use noopener instead of clearing the opener
      // property.
      if ((this.platform_.isIos() || !this.platform_.isChrome()) && !opener) {
        options += 'noopener';
      }

      var newWin = openWindowDialog(win, url, target, options);

      // For Chrome, since we cannot use noopener.
      if (newWin && !opener) {
        newWin.opener = null;
      }
    }
    /**
     * Navigates a window to a URL.
     *
     * If opt_requestedBy matches a feature name in a <meta> tag with attribute
     * name="amp-to-amp-navigation", then treats the URL as an AMP URL (A2A).
     *
     * @param {!Window} win
     * @param {string} url
     * @param {string=} opt_requestedBy
     * @param {!{
     *   target: (string|undefined),
     *   opener: (boolean|undefined),
     * }=} options
     */

  }, {
    key: "navigateTo",
    value: function navigateTo(win, url, opt_requestedBy, options) {
      if (options === void 0) {
        options = {};
      }

      var _options = options,
          _options$opener = _options.opener,
          opener = _options$opener === void 0 ? false : _options$opener,
          _options$target = _options.target,
          target = _options$target === void 0 ? '_top' : _options$target;
      url = this.applyNavigateToMutators_(url);
      var urlService = Services.urlForDoc(this.serviceContext_);

      if (!urlService.isProtocolValid(url)) {
        user().error(TAG, 'Cannot navigate to invalid protocol: ' + url);
        return;
      }

      userAssert(VALID_TARGETS.includes(target), "Target '" + target + "' not supported.");
      // If we're on cache, resolve relative URLs to the publisher (non-cache) origin.
      var sourceUrl = urlService.getSourceUrl(win.location);
      url = urlService.resolveRelativeUrl(url, sourceUrl);

      // If we have a target of "_blank", we will want to open a new window. A
      // target of "_top" should behave like it would on an anchor tag and
      // update the URL.
      if (target == '_blank') {
        this.openWindow(win, url, target, opener);
        return;
      }

      // If this redirect was requested by a feature that opted into A2A,
      // try to ask the viewer to navigate this AMP URL.
      if (opt_requestedBy) {
        if (!this.a2aFeatures_) {
          this.a2aFeatures_ = this.queryA2AFeatures_();
        }

        if (this.a2aFeatures_.includes(opt_requestedBy)) {
          if (this.navigateToAmpUrl(url, opt_requestedBy)) {
            return;
          }
        }
      }

      // Otherwise, perform normal behavior of navigating the top frame.
      win.top.location.href = url;
    }
    /**
     * Requests A2A navigation to the given destination. If the viewer does
     * not support this operation, does nothing.
     * The URL is assumed to be in AMP Cache format already.
     * @param {string} url An AMP article URL.
     * @param {string} requestedBy Informational string about the entity that
     *     requested the navigation.
     * @return {boolean} Returns true if navigation message was sent to viewer.
     *     Otherwise, returns false.
     */

  }, {
    key: "navigateToAmpUrl",
    value: function navigateToAmpUrl(url, requestedBy) {
      if (this.viewer_.hasCapability('a2a')) {
        this.viewer_.sendMessage('a2aNavigate', dict({
          'url': url,
          'requestedBy': requestedBy
        }));
        return true;
      }

      return false;
    }
    /**
     * @return {!Array<string>}
     * @private
     */

  }, {
    key: "queryA2AFeatures_",
    value: function queryA2AFeatures_() {
      var meta = this.rootNode_.querySelector('meta[name="amp-to-amp-navigation"]');

      if (meta && meta.hasAttribute('content')) {
        return meta.getAttribute('content').split(',').map(function (s) {
          return s.trim();
        });
      }

      return [];
    }
    /**
     * Intercept any click on the current document and prevent any
     * linking to an identifier from pushing into the history stack.
     *
     * This also handles custom protocols (e.g. whatsapp://) when iframed
     * on iOS Safari.
     *
     * @param {!Event} e
     * @private
     */

  }, {
    key: "handle_",
    value: function handle_(e) {
      if (e.defaultPrevented) {
        return;
      }

      var element = dev().assertElement(e[AMP_CUSTOM_LINKER_TARGET] || e.target);
      var target = closestAncestorElementBySelector(element, 'A');

      if (!target || !target.href) {
        return;
      }

      if (e.type == EVENT_TYPE_CLICK) {
        this.handleClick_(target, e);
      } else if (e.type == EVENT_TYPE_CONTEXT_MENU) {
        this.handleContextMenuClick_(target, e);
      }
    }
    /**
     * @param {!Element} element
     * @param {!Event} e
     * @private
     */

  }, {
    key: "handleClick_",
    value: function handleClick_(element, e) {
      this.expandVarsForAnchor_(element);
      var toLocation = this.parseUrl_(element.href);

      // Handle AMP-to-AMP navigation and early-outs, if rel=amphtml.
      if (this.handleA2AClick_(e, element, toLocation)) {
        return;
      }

      // Handle navigating to custom protocol and early-outs, if applicable.
      if (this.handleCustomProtocolClick_(e, element, toLocation)) {
        return;
      }

      var fromLocation = this.getLocation_();

      // Only apply anchor mutator if this is an external navigation.
      // Note that anchor mutators may theoretically change the navigation
      // from external to internal, so we re-parse the new targetLocation
      // in handleNavigation_().
      if (getHrefMinusHash(toLocation) != getHrefMinusHash(fromLocation)) {
        this.applyAnchorMutators_(element, e);
        toLocation = this.parseUrl_(element.href);
      }

      // Finally, handle normal click-navigation behavior.
      this.handleNavigation_(e, element, toLocation, fromLocation);
    }
    /**
     * Handles "contextmenu" event e.g. right mouse button click.
     * @param {!Element} element
     * @param {!Event} e
     * @private
     */

  }, {
    key: "handleContextMenuClick_",
    value: function handleContextMenuClick_(element, e) {
      // TODO(wg-performance): Handle A2A, custom link protocols, and ITP 2.3 mitigation.
      this.expandVarsForAnchor_(element);
      this.applyAnchorMutators_(element, e);
    }
    /**
     * Apply anchor transformations.
     * @param {!Element} element
     * @param {!Event} e
     */

  }, {
    key: "applyAnchorMutators_",
    value: function applyAnchorMutators_(element, e) {
      this.anchorMutators_.forEach(function (anchorMutator) {
        anchorMutator(element, e);
      });
    }
    /**
     * Apply URL transformations for AMP.navigateTo.
     * @param {string} url
     * @return {string}
     */

  }, {
    key: "applyNavigateToMutators_",
    value: function applyNavigateToMutators_(url) {
      this.navigateToMutators_.forEach(function (mutator) {
        url = mutator(url);
      });
      return url;
    }
    /**
     * @param {!Element} el
     * @private
     */

  }, {
    key: "expandVarsForAnchor_",
    value: function expandVarsForAnchor_(el) {
      // First check if need to handle external link decoration.
      var defaultExpandParamsUrl = null;

      if (this.appendExtraParams_ && !this.isEmbed_) {
        // Only decorate outgoing link when needed to and is not in FIE.
        defaultExpandParamsUrl = getExtraParamsUrl(this.ampdoc.win, el);
      }

      var urlReplacements = Services.urlReplacementsForDoc(el);
      urlReplacements.maybeExpandLink(el, defaultExpandParamsUrl);
    }
    /**
     * Handles clicking on a custom protocol link.
     * Returns true if the navigation was handled. Otherwise, returns false.
     * @param {!Event} e
     * @param {!Element} element
     * @param {!Location} location
     * @return {boolean}
     * @private
     */

  }, {
    key: "handleCustomProtocolClick_",
    value: function handleCustomProtocolClick_(e, element, location) {
      // Handle custom protocols only if the document is iframed.
      if (!this.isIframed_) {
        return false;
      }

      /** @const {!Window} */
      var win = toWin(element.ownerDocument.defaultView);
      var url = element.href;
      var protocol = location.protocol;
      // On Safari iOS, custom protocol links will fail to open apps when the
      // document is iframed - in order to go around this, we set the top.location
      // to the custom protocol href.
      var isFTP = protocol == 'ftp:';

      // In case of FTP Links in embedded documents always open then in _blank.
      if (isFTP) {
        openWindowDialog(win, url, '_blank');
        e.preventDefault();
        return true;
      }

      var isNormalProtocol = /^(https?|mailto):$/.test(protocol);

      if (this.isIosSafari_ && !isNormalProtocol) {
        openWindowDialog(win, url, '_top');
        // Without preventing default the page would should an alert error twice
        // in the case where there's no app to handle the custom protocol.
        e.preventDefault();
        return true;
      }

      return false;
    }
    /**
     * Handles clicking on an AMP link.
     * Returns true if the navigation was handled. Otherwise, returns false.
     * @param {!Event} e
     * @param {!Element} element
     * @param {!Location} location
     * @return {boolean}
     * @private
     */

  }, {
    key: "handleA2AClick_",
    value: function handleA2AClick_(e, element, location) {
      if (!element.hasAttribute('rel')) {
        return false;
      }

      var relations = element.getAttribute('rel').split(' ').map(function (s) {
        return s.trim();
      });

      if (!relations.includes('amphtml')) {
        return false;
      }

      // The viewer may not support the capability for navigating AMP links.
      if (this.navigateToAmpUrl(location.href, '<a rel=amphtml>')) {
        e.preventDefault();
        return true;
      }

      return false;
    }
    /**
     * Handles click-navigation on a non-A2A, standard-protocol link.
     * @param {!Event} e
     * @param {!Element} element
     * @param {!Location} toLocation
     * @param {!Location} fromLocation
     * @private
     */

  }, {
    key: "handleNavigation_",
    value: function handleNavigation_(e, element, toLocation, fromLocation) {
      var to = getHrefMinusHash(toLocation);
      var from = getHrefMinusHash(fromLocation);

      // Handle same-page (hash) navigation separately.
      if (toLocation.hash && to == from) {
        this.handleHashNavigation_(e, toLocation, fromLocation);
      } else {
        // Otherwise, this is an other-page (external) navigation.
        var target = (element.getAttribute('target') || '').toLowerCase();

        if (this.isEmbed_ || this.isInABox_) {
          // Target in the embed must be either _top or _blank (default).
          if (target != '_top' && target != '_blank') {
            target = '_blank';
            element.setAttribute('target', target);
          }
        }

        // ITP 2.3 mitigation. See https://github.com/ampproject/amphtml/issues/25179.
        var win = this.ampdoc.win;
        var platform = Services.platformFor(win);
        var viewer = Services.viewerForDoc(element);

        if (fromLocation.search && platform.isSafari() && platform.getMajorVersion() >= 13 && viewer.isProxyOrigin() && viewer.isEmbedded()) {
          this.removeViewerQueryBeforeNavigation_(win, fromLocation, target);
        }

        if (this.viewerInterceptsNavigation(to, 'intercept_click')) {
          e.preventDefault();
        }
      }
    }
    /**
     * Temporarily remove viewer query params from iframe (e.g. amp_js_v, usqp)
     * to prevent document.referrer from being reduced to eTLD+1 (e.g. ampproject.org).
     * @param {!Window} win
     * @param {!Location} fromLocation
     * @param {string} target
     * @private
     */

  }, {
    key: "removeViewerQueryBeforeNavigation_",
    value: function removeViewerQueryBeforeNavigation_(win, fromLocation, target) {
      dev().info(TAG, 'Removing iframe query string before navigation:', fromLocation.search);
      var original = fromLocation.href;
      var noQuery = "" + fromLocation.origin + fromLocation.pathname + fromLocation.hash;
      win.history.replaceState(null, '', noQuery);

      var restoreQuery = function restoreQuery() {
        var currentHref = win.location.href;

        if (currentHref == noQuery) {
          dev().info(TAG, 'Restored iframe URL with query string:', original);
          win.history.replaceState(null, '', original);
        } else {
          dev().error(TAG, 'Unexpected iframe URL change:', currentHref, noQuery);
        }
      };

      // For blank_, restore query params after the new page opens.
      if (target === '_blank') {
        win.setTimeout(restoreQuery, 0);
      } else {
        // For _top etc., wait until page is restored from page cache (bfcache).
        // https://webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
        win.addEventListener('pageshow', function onPageShow(e) {
          if (e.persisted) {
            restoreQuery();
            win.removeEventListener('pageshow', onPageShow);
          }
        });
      }
    }
    /**
     * Handles clicking on an internal link
     * @param {!Event} e
     * @param {!Location} toLocation
     * @param {!Location} fromLocation
     * @private
     */

  }, {
    key: "handleHashNavigation_",
    value: function handleHashNavigation_(e, toLocation, fromLocation) {
      var _this2 = this;

      // Anchor navigation in IE doesn't change input focus, which can result in
      // confusing behavior e.g. when pressing "tab" button.
      // @see https://humanwhocodes.com/blog/2013/01/15/fixing-skip-to-content-links/
      // @see https://github.com/ampproject/amphtml/issues/18671
      if (!false && Services.platformFor(this.ampdoc.win).isIe()) {
        var id = toLocation.hash.substring(1);
        var elementWithId = this.ampdoc.getElementById(id);

        if (elementWithId) {
          if (!/^(?:a|select|input|button|textarea)$/i.test(elementWithId.tagName)) {
            elementWithId.tabIndex = -1;
          }

          tryFocus(elementWithId);
        }
      }

      // We prevent default so that the current click does not push
      // into the history stack as this messes up the external documents
      // history which contains the amp document.
      e.preventDefault();

      // For an embed, do not perform scrolling or global history push - both have
      // significant UX and browser problems.
      if (this.isEmbed_) {
        return;
      }

      // Look for the referenced element.
      var hash = toLocation.hash.slice(1);
      var el = null;

      if (hash) {
        var escapedHash = escapeCssSelectorIdent(hash);
        el = this.rootNode_.getElementById(hash) || // Fallback to anchor[name] if element with id is not found.
        // Linking to an anchor element with name is obsolete in html5.
        this.rootNode_.
        /*OK*/
        querySelector("a[name=\"" + escapedHash + "\"]");
      }

      // If possible do update the URL with the hash. As explained above
      // we do `replace` to avoid messing with the container's history.
      if (toLocation.hash != fromLocation.hash) {
        this.history_.replaceStateForTarget(toLocation.hash).then(function () {
          _this2.scrollToElement_(el, hash);
        });
      } else {
        // If the hash did not update just scroll to the element.
        this.scrollToElement_(el, hash);
      }
    }
    /**
     * @param {function(!Element, !Event)} callback
     * @param {number} priority
     */

  }, {
    key: "registerAnchorMutator",
    value: function registerAnchorMutator(callback, priority) {
      this.anchorMutators_.enqueue(callback, priority);
    }
    /**
     * @param {function(string)} callback
     * @param {number} priority
     */

  }, {
    key: "registerNavigateToMutator",
    value: function registerNavigateToMutator(callback, priority) {
      this.navigateToMutators_.enqueue(callback, priority);
    }
    /**
     * Scrolls the page to the given element.
     * @param {?Element} elem
     * @param {string} hash
     * @private
     */

  }, {
    key: "scrollToElement_",
    value: function scrollToElement_(elem, hash) {
      var _this3 = this;

      // Scroll to the element if found.
      if (elem) {
        // The first call to scrollIntoView overrides browsers' default scrolling
        // behavior. The second call insides setTimeout allows us to scroll to
        // that element properly. Without doing this, the viewport will not catch
        // the updated scroll position on iOS Safari and hence calculate the wrong
        // scrollTop for the scrollbar jumping the user back to the top for
        // failing to calculate the new jumped offset. Without the first call
        // there will be a visual jump due to browser scroll. See
        // https://github.com/ampproject/amphtml/issues/5334 for more details.
        this.viewport_.
        /*OK*/
        scrollIntoView(elem);
        Services.timerFor(this.ampdoc.win).delay(function () {
          return _this3.viewport_.
          /*OK*/
          scrollIntoView(dev().assertElement(elem));
        }, 1);
      } else {
        dev().warn(TAG, "failed to find element with id=" + hash + " or a[name=" + hash + "]");
      }
    }
    /**
     * @param {string} url
     * @return {!Location}
     * @private
     */

  }, {
    key: "parseUrl_",
    value: function parseUrl_(url) {
      return Services.urlForDoc(this.serviceContext_).parse(url);
    }
    /**
     * @return {!Location}
     * @private
     */

  }, {
    key: "getLocation_",
    value: function getLocation_() {
      // In test mode, we're not able to properly fix the anchor tag's base URL.
      // So, we have to use the (mocked) window's location instead.
      var baseHref = getMode().test && !this.isEmbed_ ? this.ampdoc.win.location.href : '';
      return this.parseUrl_(baseHref);
    }
    /**
     * Requests navigation through a Viewer to the given destination.
     *
     * This function only proceeds if:
     * 1. The viewer supports the 'interceptNavigation' capability.
     * 2. The contained AMP doc has 'opted in' via including the 'allow-navigation-interception'
     * attribute on the <html> tag.
     * 3. The viewer is trusted or from localhost.
     *
     * @param {string} url A URL.
     * @param {string} requestedBy Informational string about the entity that
     *     requested the navigation.
     * @return {boolean} Returns true if navigation message was sent to viewer.
     *     Otherwise, returns false.
     */

  }, {
    key: "viewerInterceptsNavigation",
    value: function viewerInterceptsNavigation(url, requestedBy) {
      var viewerHasCapability = this.viewer_.hasCapability('interceptNavigation');
      var docOptedIn = this.ampdoc.isSingleDoc() && this.ampdoc.getRootNode().documentElement.hasAttribute('allow-navigation-interception');

      if (!viewerHasCapability || !docOptedIn || !(this.isTrustedViewer_ || this.isLocalViewer_)) {
        return false;
      }

      this.viewer_.sendMessage('navigateTo', dict({
        'url': url,
        'requestedBy': requestedBy
      }));
      return true;
    }
  }], [{
    key: "installAnchorClickInterceptor",
    value: function installAnchorClickInterceptor(ampdoc, win) {
      win.document.documentElement.addEventListener('click', maybeExpandUrlParams.bind(null, ampdoc),
      /* capture */
      true);
    }
  }]);

  return Navigation;
}();

/**
 * Handle click on links and replace variables in the click URL.
 * The function changes the actual href value and stores the
 * template in the ORIGINAL_HREF_ATTRIBUTE attribute
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Event} e
 */
function maybeExpandUrlParams(ampdoc, e) {
  var target = closestAncestorElementBySelector(dev().assertElement(e.target), 'A');

  if (!target || !target.href) {
    // Not a click on a link.
    return;
  }

  var hrefToExpand = target.getAttribute(ORIG_HREF_ATTRIBUTE) || target.getAttribute('href');

  if (!hrefToExpand) {
    return;
  }

  var vars = {
    'CLICK_X': function CLICK_X() {
      return e.pageX;
    },
    'CLICK_Y': function CLICK_Y() {
      return e.pageY;
    }
  };
  var newHref = Services.urlReplacementsForDoc(target).expandUrlSync(hrefToExpand, vars,
  /* opt_allowlist */
  {
    // For now we only allow to replace the click location vars
    // and nothing else.
    // NOTE: Addition to this allowlist requires additional review.
    'CLICK_X': true,
    'CLICK_Y': true
  });

  if (newHref != hrefToExpand) {
    // Store original value so that later clicks can be processed with
    // freshest values.
    if (!target.getAttribute(ORIG_HREF_ATTRIBUTE)) {
      target.setAttribute(ORIG_HREF_ATTRIBUTE, hrefToExpand);
    }

    target.setAttribute('href', newHref);
  }
}

/**
 * Returns href without hash.
 * @param {!Location} location
 * @return {string}
 */
function getHrefMinusHash(location) {
  return "" + location.origin + location.pathname + location.search;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5hdmlnYXRpb24uanMiXSwibmFtZXMiOlsiUHJpb3JpdHlRdWV1ZSIsImlzSWZyYW1lZCIsInRyeUZvY3VzIiwiZXNjYXBlQ3NzU2VsZWN0b3JJZGVudCIsImNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yIiwiZGljdCIsInRvV2luIiwiU2VydmljZXMiLCJnZXRFeHRyYVBhcmFtc1VybCIsInNob3VsZEFwcGVuZEV4dHJhUGFyYW1zIiwiZGV2IiwidXNlciIsInVzZXJBc3NlcnQiLCJnZXRNb2RlIiwib3BlbldpbmRvd0RpYWxvZyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJpc0xvY2FsaG9zdE9yaWdpbiIsIlRBRyIsIkVWRU5UX1RZUEVfQ0xJQ0siLCJFVkVOVF9UWVBFX0NPTlRFWFRfTUVOVSIsIlZBTElEX1RBUkdFVFMiLCJPUklHX0hSRUZfQVRUUklCVVRFIiwiQU1QX0NVU1RPTV9MSU5LRVJfVEFSR0VUIiwiUHJpb3JpdHkiLCJMSU5LX1JFV1JJVEVSX01BTkFHRVIiLCJBTkFMWVRJQ1NfTElOS0VSIiwiaW5zdGFsbEdsb2JhbE5hdmlnYXRpb25IYW5kbGVyRm9yRG9jIiwiYW1wZG9jIiwiTmF2aWdhdGlvbiIsIm1heWJlRXhwYW5kVXJsUGFyYW1zRm9yVGVzdGluZyIsImUiLCJtYXliZUV4cGFuZFVybFBhcmFtcyIsInJvb3ROb2RlXyIsImdldFJvb3ROb2RlIiwidmlld3BvcnRfIiwidmlld3BvcnRGb3JEb2MiLCJ2aWV3ZXJfIiwidmlld2VyRm9yRG9jIiwiaGlzdG9yeV8iLCJoaXN0b3J5Rm9yRG9jIiwicGxhdGZvcm1fIiwicGxhdGZvcm1Gb3IiLCJ3aW4iLCJpc0lvc1NhZmFyaV8iLCJpc0lvcyIsImlzU2FmYXJpIiwiaXNJZnJhbWVkXyIsImlzT3ZlcnRha2VIaXN0b3J5IiwiaXNFbWJlZF8iLCJnZXRQYXJlbnQiLCJpc0luQUJveF8iLCJydW50aW1lIiwic2VydmljZUNvbnRleHRfIiwibm9kZVR5cGUiLCJOb2RlIiwiRE9DVU1FTlRfTk9ERSIsImRvY3VtZW50RWxlbWVudCIsImJvdW5kSGFuZGxlXyIsImhhbmRsZV8iLCJiaW5kIiwiYWRkRXZlbnRMaXN0ZW5lciIsImFwcGVuZEV4dHJhUGFyYW1zXyIsInRoZW4iLCJyZXMiLCJpc1RydXN0ZWRWaWV3ZXJfIiwiaXNMb2NhbFZpZXdlcl8iLCJQcm9taXNlIiwiYWxsIiwiaXNUcnVzdGVkVmlld2VyIiwiZ2V0Vmlld2VyT3JpZ2luIiwidmFsdWVzIiwiYTJhRmVhdHVyZXNfIiwiYW5jaG9yTXV0YXRvcnNfIiwibmF2aWdhdGVUb011dGF0b3JzXyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ1cmwiLCJ0YXJnZXQiLCJvcGVuZXIiLCJvcHRpb25zIiwiaXNDaHJvbWUiLCJuZXdXaW4iLCJvcHRfcmVxdWVzdGVkQnkiLCJhcHBseU5hdmlnYXRlVG9NdXRhdG9yc18iLCJ1cmxTZXJ2aWNlIiwidXJsRm9yRG9jIiwiaXNQcm90b2NvbFZhbGlkIiwiZXJyb3IiLCJpbmNsdWRlcyIsInNvdXJjZVVybCIsImdldFNvdXJjZVVybCIsImxvY2F0aW9uIiwicmVzb2x2ZVJlbGF0aXZlVXJsIiwib3BlbldpbmRvdyIsInF1ZXJ5QTJBRmVhdHVyZXNfIiwibmF2aWdhdGVUb0FtcFVybCIsInRvcCIsImhyZWYiLCJyZXF1ZXN0ZWRCeSIsImhhc0NhcGFiaWxpdHkiLCJzZW5kTWVzc2FnZSIsIm1ldGEiLCJxdWVyeVNlbGVjdG9yIiwiaGFzQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwic3BsaXQiLCJtYXAiLCJzIiwidHJpbSIsImRlZmF1bHRQcmV2ZW50ZWQiLCJlbGVtZW50IiwiYXNzZXJ0RWxlbWVudCIsInR5cGUiLCJoYW5kbGVDbGlja18iLCJoYW5kbGVDb250ZXh0TWVudUNsaWNrXyIsImV4cGFuZFZhcnNGb3JBbmNob3JfIiwidG9Mb2NhdGlvbiIsInBhcnNlVXJsXyIsImhhbmRsZUEyQUNsaWNrXyIsImhhbmRsZUN1c3RvbVByb3RvY29sQ2xpY2tfIiwiZnJvbUxvY2F0aW9uIiwiZ2V0TG9jYXRpb25fIiwiZ2V0SHJlZk1pbnVzSGFzaCIsImFwcGx5QW5jaG9yTXV0YXRvcnNfIiwiaGFuZGxlTmF2aWdhdGlvbl8iLCJmb3JFYWNoIiwiYW5jaG9yTXV0YXRvciIsIm11dGF0b3IiLCJlbCIsImRlZmF1bHRFeHBhbmRQYXJhbXNVcmwiLCJ1cmxSZXBsYWNlbWVudHMiLCJ1cmxSZXBsYWNlbWVudHNGb3JEb2MiLCJtYXliZUV4cGFuZExpbmsiLCJvd25lckRvY3VtZW50IiwiZGVmYXVsdFZpZXciLCJwcm90b2NvbCIsImlzRlRQIiwicHJldmVudERlZmF1bHQiLCJpc05vcm1hbFByb3RvY29sIiwidGVzdCIsInJlbGF0aW9ucyIsInRvIiwiZnJvbSIsImhhc2giLCJoYW5kbGVIYXNoTmF2aWdhdGlvbl8iLCJ0b0xvd2VyQ2FzZSIsInNldEF0dHJpYnV0ZSIsInBsYXRmb3JtIiwidmlld2VyIiwic2VhcmNoIiwiZ2V0TWFqb3JWZXJzaW9uIiwiaXNQcm94eU9yaWdpbiIsImlzRW1iZWRkZWQiLCJyZW1vdmVWaWV3ZXJRdWVyeUJlZm9yZU5hdmlnYXRpb25fIiwidmlld2VySW50ZXJjZXB0c05hdmlnYXRpb24iLCJpbmZvIiwib3JpZ2luYWwiLCJub1F1ZXJ5Iiwib3JpZ2luIiwicGF0aG5hbWUiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwicmVzdG9yZVF1ZXJ5IiwiY3VycmVudEhyZWYiLCJzZXRUaW1lb3V0Iiwib25QYWdlU2hvdyIsInBlcnNpc3RlZCIsImlzSWUiLCJpZCIsInN1YnN0cmluZyIsImVsZW1lbnRXaXRoSWQiLCJnZXRFbGVtZW50QnlJZCIsInRhZ05hbWUiLCJ0YWJJbmRleCIsInNsaWNlIiwiZXNjYXBlZEhhc2giLCJyZXBsYWNlU3RhdGVGb3JUYXJnZXQiLCJzY3JvbGxUb0VsZW1lbnRfIiwiY2FsbGJhY2siLCJwcmlvcml0eSIsImVucXVldWUiLCJlbGVtIiwic2Nyb2xsSW50b1ZpZXciLCJ0aW1lckZvciIsImRlbGF5Iiwid2FybiIsInBhcnNlIiwiYmFzZUhyZWYiLCJ2aWV3ZXJIYXNDYXBhYmlsaXR5IiwiZG9jT3B0ZWRJbiIsImlzU2luZ2xlRG9jIiwiZG9jdW1lbnQiLCJocmVmVG9FeHBhbmQiLCJ2YXJzIiwicGFnZVgiLCJwYWdlWSIsIm5ld0hyZWYiLCJleHBhbmRVcmxTeW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxhQUFSO0FBQ0EsU0FBUUMsU0FBUixFQUFtQkMsUUFBbkI7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLGdDQUFSO0FBQ0EsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLEtBQVI7QUFFQSxTQUFRQyxRQUFSO0FBRUEsU0FBUUMsaUJBQVIsRUFBMkJDLHVCQUEzQjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsSUFBYixFQUFtQkMsVUFBbkI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsZ0JBQVI7QUFDQSxTQUFRQyw0QkFBUjtBQUNBLFNBQVFDLGlCQUFSO0FBRUEsSUFBTUMsR0FBRyxHQUFHLFlBQVo7O0FBRUE7QUFDQSxJQUFNQyxnQkFBZ0IsR0FBRyxPQUF6Qjs7QUFFQTtBQUNBLElBQU1DLHVCQUF1QixHQUFHLGFBQWhDO0FBRUEsSUFBTUMsYUFBYSxHQUFHLENBQUMsTUFBRCxFQUFTLFFBQVQsQ0FBdEI7O0FBRUE7QUFDQSxJQUFNQyxtQkFBbUIsR0FBRyxvQkFBNUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyx3QkFBd0IsR0FBRyw4QkFBakM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLFFBQVEsR0FBRztBQUN0QkMsRUFBQUEscUJBQXFCLEVBQUUsQ0FERDtBQUV0QkMsRUFBQUEsZ0JBQWdCLEVBQUU7QUFGSSxDQUFqQjs7QUFLUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxvQ0FB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RUFBdUN3SCxhQUF2QyxDQUNkTCxZQURjLEVBRWRDLElBRmM7QUFHZDtBQUFvQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQSxlQUFXLElBSk87QUFLbEIsZUFBVztBQUxPLEdBSE4sQ0FBaEI7O0FBV0EsTUFBSUcsT0FBTyxJQUFJSixZQUFmLEVBQTZCO0FBQzNCO0FBQ0E7QUFDQSxRQUFJLENBQUNuSCxNQUFNLENBQUMyQixZQUFQLENBQW9CbEYsbUJBQXBCLENBQUwsRUFBK0M7QUFDN0N1RCxNQUFBQSxNQUFNLENBQUNxRSxZQUFQLENBQW9CNUgsbUJBQXBCLEVBQXlDMEssWUFBekM7QUFDRDs7QUFDRG5ILElBQUFBLE1BQU0sQ0FBQ3FFLFlBQVAsQ0FBb0IsTUFBcEIsRUFBNEJrRCxPQUE1QjtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMxRSxnQkFBVCxDQUEwQi9CLFFBQTFCLEVBQW9DO0FBQ2xDLGNBQVVBLFFBQVEsQ0FBQ21FLE1BQW5CLEdBQTRCbkUsUUFBUSxDQUFDb0UsUUFBckMsR0FBZ0RwRSxRQUFRLENBQUMwRCxNQUF6RDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7UHJpb3JpdHlRdWV1ZX0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3ByaW9yaXR5LXF1ZXVlJztcbmltcG9ydCB7aXNJZnJhbWVkLCB0cnlGb2N1c30gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7ZXNjYXBlQ3NzU2VsZWN0b3JJZGVudH0gZnJvbSAnI2NvcmUvZG9tL2Nzcy1zZWxlY3RvcnMnO1xuaW1wb3J0IHtjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3Rvcn0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7ZGljdH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7dG9XaW59IGZyb20gJyNjb3JlL3dpbmRvdyc7XG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcblxuaW1wb3J0IHtnZXRFeHRyYVBhcmFtc1VybCwgc2hvdWxkQXBwZW5kRXh0cmFQYXJhbXN9IGZyb20gJy4uL2ltcHJlc3Npb24nO1xuaW1wb3J0IHtkZXYsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4uL21vZGUnO1xuaW1wb3J0IHtvcGVuV2luZG93RGlhbG9nfSBmcm9tICcuLi9vcGVuLXdpbmRvdy1kaWFsb2cnO1xuaW1wb3J0IHtyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jfSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtpc0xvY2FsaG9zdE9yaWdpbn0gZnJvbSAnLi4vdXJsJztcblxuY29uc3QgVEFHID0gJ25hdmlnYXRpb24nO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBFVkVOVF9UWVBFX0NMSUNLID0gJ2NsaWNrJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgRVZFTlRfVFlQRV9DT05URVhUX01FTlUgPSAnY29udGV4dG1lbnUnO1xuXG5jb25zdCBWQUxJRF9UQVJHRVRTID0gWydfdG9wJywgJ19ibGFuayddO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBPUklHX0hSRUZfQVRUUklCVVRFID0gJ2RhdGEtYTRhLW9yaWctaHJlZic7XG5cbi8qKlxuICogS2V5IHVzZWQgZm9yIHJldGFyZ2V0aW5nIGV2ZW50IHRhcmdldCBvcmlnaW5hdGluZyBmcm9tIHNoYWRvdyBET00uXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgQU1QX0NVU1RPTV9MSU5LRVJfVEFSR0VUID0gJ19fQU1QX0NVU1RPTV9MSU5LRVJfVEFSR0VUX18nO1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9IFByaW9yaXR5IHJlc2VydmVkIGZvciBleHRlbnNpb25zIGluIGFuY2hvciBtdXRhdGlvbnMuXG4gKiBUaGUgaGlnaGVyIHRoZSBwcmlvcml0eSwgdGhlIHNvb25lciBpdCdzIGludm9rZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBQcmlvcml0eSA9IHtcbiAgTElOS19SRVdSSVRFUl9NQU5BR0VSOiAwLFxuICBBTkFMWVRJQ1NfTElOS0VSOiAyLFxufTtcblxuLyoqXG4gKiBJbnN0YWxsIG5hdmlnYXRpb24gc2VydmljZSBmb3IgYW1wZG9jLCB3aGljaCBoYW5kbGVzIG5hdmlnYXRpb25zIGZyb20gYW5jaG9yXG4gKiB0YWcgY2xpY2tzIGFuZCBvdGhlciBydW50aW1lIGZlYXR1cmVzIGxpa2UgQU1QLm5hdmlnYXRlVG8oKS5cbiAqXG4gKiBJbW1lZGlhdGVseSBpbnN0YW50aWF0ZXMgdGhlIHNlcnZpY2UuXG4gKlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbEdsb2JhbE5hdmlnYXRpb25IYW5kbGVyRm9yRG9jKGFtcGRvYykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jKFxuICAgIGFtcGRvYyxcbiAgICBUQUcsXG4gICAgTmF2aWdhdGlvbixcbiAgICAvKiBvcHRfaW5zdGFudGlhdGUgKi8gdHJ1ZVxuICApO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEBwYXJhbSB7IUV2ZW50fSBlXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heWJlRXhwYW5kVXJsUGFyYW1zRm9yVGVzdGluZyhhbXBkb2MsIGUpIHtcbiAgbWF5YmVFeHBhbmRVcmxQYXJhbXMoYW1wZG9jLCBlKTtcbn1cblxuLyoqXG4gKiBJbnRlcmNlcHQgYW55IGNsaWNrIG9uIHRoZSBjdXJyZW50IGRvY3VtZW50IGFuZCBwcmV2ZW50IGFueVxuICogbGlua2luZyB0byBhbiBpZGVudGlmaWVyIGZyb20gcHVzaGluZyBpbnRvIHRoZSBoaXN0b3J5IHN0YWNrLlxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAY29uc3QgeyEuL2FtcGRvYy1pbXBsLkFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvYyA9IGFtcGRvYztcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFEb2N1bWVudHwhU2hhZG93Um9vdH0gKi9cbiAgICB0aGlzLnJvb3ROb2RlXyA9IGFtcGRvYy5nZXRSb290Tm9kZSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vdmlld3BvcnQvdmlld3BvcnQtaW50ZXJmYWNlLlZpZXdwb3J0SW50ZXJmYWNlfSAqL1xuICAgIHRoaXMudmlld3BvcnRfID0gU2VydmljZXMudmlld3BvcnRGb3JEb2ModGhpcy5hbXBkb2MpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9ICovXG4gICAgdGhpcy52aWV3ZXJfID0gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuYW1wZG9jKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2hpc3RvcnktaW1wbC5IaXN0b3J5fSAqL1xuICAgIHRoaXMuaGlzdG9yeV8gPSBTZXJ2aWNlcy5oaXN0b3J5Rm9yRG9jKHRoaXMuYW1wZG9jKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3BsYXRmb3JtLWltcGwuUGxhdGZvcm19ICovXG4gICAgdGhpcy5wbGF0Zm9ybV8gPSBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0aGlzLmFtcGRvYy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzSW9zU2FmYXJpXyA9IHRoaXMucGxhdGZvcm1fLmlzSW9zKCkgJiYgdGhpcy5wbGF0Zm9ybV8uaXNTYWZhcmkoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0lmcmFtZWRfID1cbiAgICAgIGlzSWZyYW1lZCh0aGlzLmFtcGRvYy53aW4pICYmIHRoaXMudmlld2VyXy5pc092ZXJ0YWtlSGlzdG9yeSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzRW1iZWRfID1cbiAgICAgIHRoaXMucm9vdE5vZGVfICE9IHRoaXMuYW1wZG9jLmdldFJvb3ROb2RlKCkgfHwgISF0aGlzLmFtcGRvYy5nZXRQYXJlbnQoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0luQUJveF8gPSBnZXRNb2RlKHRoaXMuYW1wZG9jLndpbikucnVudGltZSA9PSAnaW5hYm94JztcblxuICAgIC8qKlxuICAgICAqIE11c3QgdXNlIFVSTCBwYXJzaW5nIHNjb3BlZCB0byBgcm9vdE5vZGVfYCBmb3IgY29ycmVjdCBGSUUgYmVoYXZpb3IuXG4gICAgICogQHByaXZhdGUgQGNvbnN0IHshRWxlbWVudHwhU2hhZG93Um9vdH1cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZpY2VDb250ZXh0XyA9IC8qKiBAdHlwZSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9ICovIChcbiAgICAgIHRoaXMucm9vdE5vZGVfLm5vZGVUeXBlID09IE5vZGUuRE9DVU1FTlRfTk9ERVxuICAgICAgICA/IHRoaXMucm9vdE5vZGVfLmRvY3VtZW50RWxlbWVudFxuICAgICAgICA6IHRoaXMucm9vdE5vZGVfXG4gICAgKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFmdW5jdGlvbighRXZlbnQpfHVuZGVmaW5lZH0gKi9cbiAgICB0aGlzLmJvdW5kSGFuZGxlXyA9IHRoaXMuaGFuZGxlXy5iaW5kKHRoaXMpO1xuICAgIHRoaXMucm9vdE5vZGVfLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlRfVFlQRV9DTElDSywgdGhpcy5ib3VuZEhhbmRsZV8pO1xuICAgIHRoaXMucm9vdE5vZGVfLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlRfVFlQRV9DT05URVhUX01FTlUsIHRoaXMuYm91bmRIYW5kbGVfKTtcbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5hcHBlbmRFeHRyYVBhcmFtc18gPSBmYWxzZTtcbiAgICBzaG91bGRBcHBlbmRFeHRyYVBhcmFtcyh0aGlzLmFtcGRvYykudGhlbigocmVzKSA9PiB7XG4gICAgICB0aGlzLmFwcGVuZEV4dHJhUGFyYW1zXyA9IHJlcztcbiAgICB9KTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzVHJ1c3RlZFZpZXdlcl8gPSBmYWxzZTtcbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0xvY2FsVmlld2VyXyA9IGZhbHNlO1xuICAgIFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMudmlld2VyXy5pc1RydXN0ZWRWaWV3ZXIoKSxcbiAgICAgIHRoaXMudmlld2VyXy5nZXRWaWV3ZXJPcmlnaW4oKSxcbiAgICBdKS50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgIHRoaXMuaXNUcnVzdGVkVmlld2VyXyA9IHZhbHVlc1swXTtcbiAgICAgIHRoaXMuaXNMb2NhbFZpZXdlcl8gPSBpc0xvY2FsaG9zdE9yaWdpbih2YWx1ZXNbMV0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogTGF6eS1nZW5lcmF0ZWQgbGlzdCBvZiBBMkEtZW5hYmxlZCBuYXZpZ2F0aW9uIGZlYXR1cmVzLlxuICAgICAqIEBwcml2YXRlIHs/QXJyYXk8c3RyaW5nPn1cbiAgICAgKi9cbiAgICB0aGlzLmEyYUZlYXR1cmVzXyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7IVByaW9yaXR5UXVldWU8ZnVuY3Rpb24oIUVsZW1lbnQsICFFdmVudCk+fVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGNvbnN0XG4gICAgICovXG4gICAgdGhpcy5hbmNob3JNdXRhdG9yc18gPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUgeyFQcmlvcml0eVF1ZXVlPGZ1bmN0aW9uKHN0cmluZyk+fVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGNvbnN0XG4gICAgICovXG4gICAgdGhpcy5uYXZpZ2F0ZVRvTXV0YXRvcnNfID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBoYW5kbGVyIHRoYXQgcGVyZm9ybXMgVVJMIHJlcGxhY2VtZW50IG9uIHRoZSBocmVmXG4gICAqIG9mIGFuIGFkIGNsaWNrLlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBzdGF0aWMgaW5zdGFsbEFuY2hvckNsaWNrSW50ZXJjZXB0b3IoYW1wZG9jLCB3aW4pIHtcbiAgICB3aW4uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnY2xpY2snLFxuICAgICAgbWF5YmVFeHBhbmRVcmxQYXJhbXMuYmluZChudWxsLCBhbXBkb2MpLFxuICAgICAgLyogY2FwdHVyZSAqLyB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMuXG4gICAqL1xuICBjbGVhbnVwKCkge1xuICAgIGlmICh0aGlzLmJvdW5kSGFuZGxlXykge1xuICAgICAgdGhpcy5yb290Tm9kZV8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihFVkVOVF9UWVBFX0NMSUNLLCB0aGlzLmJvdW5kSGFuZGxlXyk7XG4gICAgICB0aGlzLnJvb3ROb2RlXy5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICBFVkVOVF9UWVBFX0NPTlRFWFRfTUVOVSxcbiAgICAgICAgdGhpcy5ib3VuZEhhbmRsZV9cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgbmV3IHdpbmRvdyB3aXRoIHRoZSBzcGVjaWZpZWQgdGFyZ2V0LlxuICAgKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpbiBBIHdpbmRvdyB0byB1c2UgdG8gb3BlbiBhIG5ldyB3aW5kb3cuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVEhlIFVSTCB0byBvcGVuLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0IFRoZSB0YXJnZXQgZm9yIHRoZSBuZXdseSBvcGVuZWQgd2luZG93LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9wZW5lciBXaGV0aGVyIG9yIG5vdCB0aGUgbmV3IHdpbmRvdyBzaG91bGQgaGF2ZSBhY2NjZXNzXG4gICAqICAgdG8gdGhlIG9wZW5lciAod2luKS5cbiAgICovXG4gIG9wZW5XaW5kb3cod2luLCB1cmwsIHRhcmdldCwgb3BlbmVyKSB7XG4gICAgbGV0IG9wdGlvbnMgPSAnJztcbiAgICAvLyBXZSBkb24ndCBwYXNzIG5vb3BlbmVyIGZvciBDaHJvbWUgc2luY2UgaXQgb3BlbnMgYSBuZXcgd2luZG93IHdpdGhvdXRcbiAgICAvLyB0YWJzLiBJbnN0ZWFkLCB3ZSByZW1vdmUgdGhlIG9wZW5lciBwcm9wZXJ0eSBmcm9tIHRoZSBuZXdseSBvcGVuZWRcbiAgICAvLyB3aW5kb3cuXG4gICAgLy8gTm90ZTogZm9yIFNhZmFyaSwgd2UgbmVlZCB0byB1c2Ugbm9vcGVuZXIgaW5zdGVhZCBvZiBjbGVhcmluZyB0aGUgb3BlbmVyXG4gICAgLy8gcHJvcGVydHkuXG4gICAgaWYgKCh0aGlzLnBsYXRmb3JtXy5pc0lvcygpIHx8ICF0aGlzLnBsYXRmb3JtXy5pc0Nocm9tZSgpKSAmJiAhb3BlbmVyKSB7XG4gICAgICBvcHRpb25zICs9ICdub29wZW5lcic7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3V2luID0gb3BlbldpbmRvd0RpYWxvZyh3aW4sIHVybCwgdGFyZ2V0LCBvcHRpb25zKTtcbiAgICAvLyBGb3IgQ2hyb21lLCBzaW5jZSB3ZSBjYW5ub3QgdXNlIG5vb3BlbmVyLlxuICAgIGlmIChuZXdXaW4gJiYgIW9wZW5lcikge1xuICAgICAgbmV3V2luLm9wZW5lciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBhIHdpbmRvdyB0byBhIFVSTC5cbiAgICpcbiAgICogSWYgb3B0X3JlcXVlc3RlZEJ5IG1hdGNoZXMgYSBmZWF0dXJlIG5hbWUgaW4gYSA8bWV0YT4gdGFnIHdpdGggYXR0cmlidXRlXG4gICAqIG5hbWU9XCJhbXAtdG8tYW1wLW5hdmlnYXRpb25cIiwgdGhlbiB0cmVhdHMgdGhlIFVSTCBhcyBhbiBBTVAgVVJMIChBMkEpLlxuICAgKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3JlcXVlc3RlZEJ5XG4gICAqIEBwYXJhbSB7IXtcbiAgICogICB0YXJnZXQ6IChzdHJpbmd8dW5kZWZpbmVkKSxcbiAgICogICBvcGVuZXI6IChib29sZWFufHVuZGVmaW5lZCksXG4gICAqIH09fSBvcHRpb25zXG4gICAqL1xuICBuYXZpZ2F0ZVRvKHdpbiwgdXJsLCBvcHRfcmVxdWVzdGVkQnksIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHtvcGVuZXIgPSBmYWxzZSwgdGFyZ2V0ID0gJ190b3AnfSA9IG9wdGlvbnM7XG4gICAgdXJsID0gdGhpcy5hcHBseU5hdmlnYXRlVG9NdXRhdG9yc18odXJsKTtcbiAgICBjb25zdCB1cmxTZXJ2aWNlID0gU2VydmljZXMudXJsRm9yRG9jKHRoaXMuc2VydmljZUNvbnRleHRfKTtcbiAgICBpZiAoIXVybFNlcnZpY2UuaXNQcm90b2NvbFZhbGlkKHVybCkpIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdDYW5ub3QgbmF2aWdhdGUgdG8gaW52YWxpZCBwcm90b2NvbDogJyArIHVybCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdXNlckFzc2VydChcbiAgICAgIFZBTElEX1RBUkdFVFMuaW5jbHVkZXModGFyZ2V0KSxcbiAgICAgIGBUYXJnZXQgJyR7dGFyZ2V0fScgbm90IHN1cHBvcnRlZC5gXG4gICAgKTtcblxuICAgIC8vIElmIHdlJ3JlIG9uIGNhY2hlLCByZXNvbHZlIHJlbGF0aXZlIFVSTHMgdG8gdGhlIHB1Ymxpc2hlciAobm9uLWNhY2hlKSBvcmlnaW4uXG4gICAgY29uc3Qgc291cmNlVXJsID0gdXJsU2VydmljZS5nZXRTb3VyY2VVcmwod2luLmxvY2F0aW9uKTtcbiAgICB1cmwgPSB1cmxTZXJ2aWNlLnJlc29sdmVSZWxhdGl2ZVVybCh1cmwsIHNvdXJjZVVybCk7XG5cbiAgICAvLyBJZiB3ZSBoYXZlIGEgdGFyZ2V0IG9mIFwiX2JsYW5rXCIsIHdlIHdpbGwgd2FudCB0byBvcGVuIGEgbmV3IHdpbmRvdy4gQVxuICAgIC8vIHRhcmdldCBvZiBcIl90b3BcIiBzaG91bGQgYmVoYXZlIGxpa2UgaXQgd291bGQgb24gYW4gYW5jaG9yIHRhZyBhbmRcbiAgICAvLyB1cGRhdGUgdGhlIFVSTC5cbiAgICBpZiAodGFyZ2V0ID09ICdfYmxhbmsnKSB7XG4gICAgICB0aGlzLm9wZW5XaW5kb3cod2luLCB1cmwsIHRhcmdldCwgb3BlbmVyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGlzIHJlZGlyZWN0IHdhcyByZXF1ZXN0ZWQgYnkgYSBmZWF0dXJlIHRoYXQgb3B0ZWQgaW50byBBMkEsXG4gICAgLy8gdHJ5IHRvIGFzayB0aGUgdmlld2VyIHRvIG5hdmlnYXRlIHRoaXMgQU1QIFVSTC5cbiAgICBpZiAob3B0X3JlcXVlc3RlZEJ5KSB7XG4gICAgICBpZiAoIXRoaXMuYTJhRmVhdHVyZXNfKSB7XG4gICAgICAgIHRoaXMuYTJhRmVhdHVyZXNfID0gdGhpcy5xdWVyeUEyQUZlYXR1cmVzXygpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYTJhRmVhdHVyZXNfLmluY2x1ZGVzKG9wdF9yZXF1ZXN0ZWRCeSkpIHtcbiAgICAgICAgaWYgKHRoaXMubmF2aWdhdGVUb0FtcFVybCh1cmwsIG9wdF9yZXF1ZXN0ZWRCeSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIHBlcmZvcm0gbm9ybWFsIGJlaGF2aW9yIG9mIG5hdmlnYXRpbmcgdGhlIHRvcCBmcmFtZS5cbiAgICB3aW4udG9wLmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdHMgQTJBIG5hdmlnYXRpb24gdG8gdGhlIGdpdmVuIGRlc3RpbmF0aW9uLiBJZiB0aGUgdmlld2VyIGRvZXNcbiAgICogbm90IHN1cHBvcnQgdGhpcyBvcGVyYXRpb24sIGRvZXMgbm90aGluZy5cbiAgICogVGhlIFVSTCBpcyBhc3N1bWVkIHRvIGJlIGluIEFNUCBDYWNoZSBmb3JtYXQgYWxyZWFkeS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybCBBbiBBTVAgYXJ0aWNsZSBVUkwuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRCeSBJbmZvcm1hdGlvbmFsIHN0cmluZyBhYm91dCB0aGUgZW50aXR5IHRoYXRcbiAgICogICAgIHJlcXVlc3RlZCB0aGUgbmF2aWdhdGlvbi5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIG5hdmlnYXRpb24gbWVzc2FnZSB3YXMgc2VudCB0byB2aWV3ZXIuXG4gICAqICAgICBPdGhlcndpc2UsIHJldHVybnMgZmFsc2UuXG4gICAqL1xuICBuYXZpZ2F0ZVRvQW1wVXJsKHVybCwgcmVxdWVzdGVkQnkpIHtcbiAgICBpZiAodGhpcy52aWV3ZXJfLmhhc0NhcGFiaWxpdHkoJ2EyYScpKSB7XG4gICAgICB0aGlzLnZpZXdlcl8uc2VuZE1lc3NhZ2UoXG4gICAgICAgICdhMmFOYXZpZ2F0ZScsXG4gICAgICAgIGRpY3Qoe1xuICAgICAgICAgICd1cmwnOiB1cmwsXG4gICAgICAgICAgJ3JlcXVlc3RlZEJ5JzogcmVxdWVzdGVkQnksXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshQXJyYXk8c3RyaW5nPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHF1ZXJ5QTJBRmVhdHVyZXNfKCkge1xuICAgIGNvbnN0IG1ldGEgPSB0aGlzLnJvb3ROb2RlXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJ21ldGFbbmFtZT1cImFtcC10by1hbXAtbmF2aWdhdGlvblwiXSdcbiAgICApO1xuICAgIGlmIChtZXRhICYmIG1ldGEuaGFzQXR0cmlidXRlKCdjb250ZW50JykpIHtcbiAgICAgIHJldHVybiBtZXRhXG4gICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKVxuICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAubWFwKChzKSA9PiBzLnRyaW0oKSk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcmNlcHQgYW55IGNsaWNrIG9uIHRoZSBjdXJyZW50IGRvY3VtZW50IGFuZCBwcmV2ZW50IGFueVxuICAgKiBsaW5raW5nIHRvIGFuIGlkZW50aWZpZXIgZnJvbSBwdXNoaW5nIGludG8gdGhlIGhpc3Rvcnkgc3RhY2suXG4gICAqXG4gICAqIFRoaXMgYWxzbyBoYW5kbGVzIGN1c3RvbSBwcm90b2NvbHMgKGUuZy4gd2hhdHNhcHA6Ly8pIHdoZW4gaWZyYW1lZFxuICAgKiBvbiBpT1MgU2FmYXJpLlxuICAgKlxuICAgKiBAcGFyYW0geyFFdmVudH0gZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlXyhlKSB7XG4gICAgaWYgKGUuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBlbGVtZW50ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChcbiAgICAgIGVbQU1QX0NVU1RPTV9MSU5LRVJfVEFSR0VUXSB8fCBlLnRhcmdldFxuICAgICk7XG4gICAgY29uc3QgdGFyZ2V0ID0gY2xvc2VzdEFuY2VzdG9yRWxlbWVudEJ5U2VsZWN0b3IoZWxlbWVudCwgJ0EnKTtcbiAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LmhyZWYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGUudHlwZSA9PSBFVkVOVF9UWVBFX0NMSUNLKSB7XG4gICAgICB0aGlzLmhhbmRsZUNsaWNrXyh0YXJnZXQsIGUpO1xuICAgIH0gZWxzZSBpZiAoZS50eXBlID09IEVWRU5UX1RZUEVfQ09OVEVYVF9NRU5VKSB7XG4gICAgICB0aGlzLmhhbmRsZUNvbnRleHRNZW51Q2xpY2tfKHRhcmdldCwgZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHshRXZlbnR9IGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZUNsaWNrXyhlbGVtZW50LCBlKSB7XG4gICAgdGhpcy5leHBhbmRWYXJzRm9yQW5jaG9yXyhlbGVtZW50KTtcblxuICAgIGxldCB0b0xvY2F0aW9uID0gdGhpcy5wYXJzZVVybF8oZWxlbWVudC5ocmVmKTtcblxuICAgIC8vIEhhbmRsZSBBTVAtdG8tQU1QIG5hdmlnYXRpb24gYW5kIGVhcmx5LW91dHMsIGlmIHJlbD1hbXBodG1sLlxuICAgIGlmICh0aGlzLmhhbmRsZUEyQUNsaWNrXyhlLCBlbGVtZW50LCB0b0xvY2F0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBuYXZpZ2F0aW5nIHRvIGN1c3RvbSBwcm90b2NvbCBhbmQgZWFybHktb3V0cywgaWYgYXBwbGljYWJsZS5cbiAgICBpZiAodGhpcy5oYW5kbGVDdXN0b21Qcm90b2NvbENsaWNrXyhlLCBlbGVtZW50LCB0b0xvY2F0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZyb21Mb2NhdGlvbiA9IHRoaXMuZ2V0TG9jYXRpb25fKCk7XG4gICAgLy8gT25seSBhcHBseSBhbmNob3IgbXV0YXRvciBpZiB0aGlzIGlzIGFuIGV4dGVybmFsIG5hdmlnYXRpb24uXG4gICAgLy8gTm90ZSB0aGF0IGFuY2hvciBtdXRhdG9ycyBtYXkgdGhlb3JldGljYWxseSBjaGFuZ2UgdGhlIG5hdmlnYXRpb25cbiAgICAvLyBmcm9tIGV4dGVybmFsIHRvIGludGVybmFsLCBzbyB3ZSByZS1wYXJzZSB0aGUgbmV3IHRhcmdldExvY2F0aW9uXG4gICAgLy8gaW4gaGFuZGxlTmF2aWdhdGlvbl8oKS5cbiAgICBpZiAoZ2V0SHJlZk1pbnVzSGFzaCh0b0xvY2F0aW9uKSAhPSBnZXRIcmVmTWludXNIYXNoKGZyb21Mb2NhdGlvbikpIHtcbiAgICAgIHRoaXMuYXBwbHlBbmNob3JNdXRhdG9yc18oZWxlbWVudCwgZSk7XG4gICAgICB0b0xvY2F0aW9uID0gdGhpcy5wYXJzZVVybF8oZWxlbWVudC5ocmVmKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5LCBoYW5kbGUgbm9ybWFsIGNsaWNrLW5hdmlnYXRpb24gYmVoYXZpb3IuXG4gICAgdGhpcy5oYW5kbGVOYXZpZ2F0aW9uXyhlLCBlbGVtZW50LCB0b0xvY2F0aW9uLCBmcm9tTG9jYXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgXCJjb250ZXh0bWVudVwiIGV2ZW50IGUuZy4gcmlnaHQgbW91c2UgYnV0dG9uIGNsaWNrLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IUV2ZW50fSBlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVDb250ZXh0TWVudUNsaWNrXyhlbGVtZW50LCBlKSB7XG4gICAgLy8gVE9ETyh3Zy1wZXJmb3JtYW5jZSk6IEhhbmRsZSBBMkEsIGN1c3RvbSBsaW5rIHByb3RvY29scywgYW5kIElUUCAyLjMgbWl0aWdhdGlvbi5cbiAgICB0aGlzLmV4cGFuZFZhcnNGb3JBbmNob3JfKGVsZW1lbnQpO1xuICAgIHRoaXMuYXBwbHlBbmNob3JNdXRhdG9yc18oZWxlbWVudCwgZSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgYW5jaG9yIHRyYW5zZm9ybWF0aW9ucy5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFFdmVudH0gZVxuICAgKi9cbiAgYXBwbHlBbmNob3JNdXRhdG9yc18oZWxlbWVudCwgZSkge1xuICAgIHRoaXMuYW5jaG9yTXV0YXRvcnNfLmZvckVhY2goKGFuY2hvck11dGF0b3IpID0+IHtcbiAgICAgIGFuY2hvck11dGF0b3IoZWxlbWVudCwgZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgVVJMIHRyYW5zZm9ybWF0aW9ucyBmb3IgQU1QLm5hdmlnYXRlVG8uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgYXBwbHlOYXZpZ2F0ZVRvTXV0YXRvcnNfKHVybCkge1xuICAgIHRoaXMubmF2aWdhdGVUb011dGF0b3JzXy5mb3JFYWNoKChtdXRhdG9yKSA9PiB7XG4gICAgICB1cmwgPSBtdXRhdG9yKHVybCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZXhwYW5kVmFyc0ZvckFuY2hvcl8oZWwpIHtcbiAgICAvLyBGaXJzdCBjaGVjayBpZiBuZWVkIHRvIGhhbmRsZSBleHRlcm5hbCBsaW5rIGRlY29yYXRpb24uXG4gICAgbGV0IGRlZmF1bHRFeHBhbmRQYXJhbXNVcmwgPSBudWxsO1xuICAgIGlmICh0aGlzLmFwcGVuZEV4dHJhUGFyYW1zXyAmJiAhdGhpcy5pc0VtYmVkXykge1xuICAgICAgLy8gT25seSBkZWNvcmF0ZSBvdXRnb2luZyBsaW5rIHdoZW4gbmVlZGVkIHRvIGFuZCBpcyBub3QgaW4gRklFLlxuICAgICAgZGVmYXVsdEV4cGFuZFBhcmFtc1VybCA9IGdldEV4dHJhUGFyYW1zVXJsKHRoaXMuYW1wZG9jLndpbiwgZWwpO1xuICAgIH1cblxuICAgIGNvbnN0IHVybFJlcGxhY2VtZW50cyA9IFNlcnZpY2VzLnVybFJlcGxhY2VtZW50c0ZvckRvYyhlbCk7XG4gICAgdXJsUmVwbGFjZW1lbnRzLm1heWJlRXhwYW5kTGluayhlbCwgZGVmYXVsdEV4cGFuZFBhcmFtc1VybCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBjbGlja2luZyBvbiBhIGN1c3RvbSBwcm90b2NvbCBsaW5rLlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG5hdmlnYXRpb24gd2FzIGhhbmRsZWQuIE90aGVyd2lzZSwgcmV0dXJucyBmYWxzZS5cbiAgICogQHBhcmFtIHshRXZlbnR9IGVcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyFMb2NhdGlvbn0gbG9jYXRpb25cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZUN1c3RvbVByb3RvY29sQ2xpY2tfKGUsIGVsZW1lbnQsIGxvY2F0aW9uKSB7XG4gICAgLy8gSGFuZGxlIGN1c3RvbSBwcm90b2NvbHMgb25seSBpZiB0aGUgZG9jdW1lbnQgaXMgaWZyYW1lZC5cbiAgICBpZiAoIXRoaXMuaXNJZnJhbWVkXykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgY29uc3Qgd2luID0gdG9XaW4oZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KTtcbiAgICBjb25zdCB1cmwgPSBlbGVtZW50LmhyZWY7XG4gICAgY29uc3Qge3Byb3RvY29sfSA9IGxvY2F0aW9uO1xuXG4gICAgLy8gT24gU2FmYXJpIGlPUywgY3VzdG9tIHByb3RvY29sIGxpbmtzIHdpbGwgZmFpbCB0byBvcGVuIGFwcHMgd2hlbiB0aGVcbiAgICAvLyBkb2N1bWVudCBpcyBpZnJhbWVkIC0gaW4gb3JkZXIgdG8gZ28gYXJvdW5kIHRoaXMsIHdlIHNldCB0aGUgdG9wLmxvY2F0aW9uXG4gICAgLy8gdG8gdGhlIGN1c3RvbSBwcm90b2NvbCBocmVmLlxuICAgIGNvbnN0IGlzRlRQID0gcHJvdG9jb2wgPT0gJ2Z0cDonO1xuXG4gICAgLy8gSW4gY2FzZSBvZiBGVFAgTGlua3MgaW4gZW1iZWRkZWQgZG9jdW1lbnRzIGFsd2F5cyBvcGVuIHRoZW4gaW4gX2JsYW5rLlxuICAgIGlmIChpc0ZUUCkge1xuICAgICAgb3BlbldpbmRvd0RpYWxvZyh3aW4sIHVybCwgJ19ibGFuaycpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgaXNOb3JtYWxQcm90b2NvbCA9IC9eKGh0dHBzP3xtYWlsdG8pOiQvLnRlc3QocHJvdG9jb2wpO1xuICAgIGlmICh0aGlzLmlzSW9zU2FmYXJpXyAmJiAhaXNOb3JtYWxQcm90b2NvbCkge1xuICAgICAgb3BlbldpbmRvd0RpYWxvZyh3aW4sIHVybCwgJ190b3AnKTtcbiAgICAgIC8vIFdpdGhvdXQgcHJldmVudGluZyBkZWZhdWx0IHRoZSBwYWdlIHdvdWxkIHNob3VsZCBhbiBhbGVydCBlcnJvciB0d2ljZVxuICAgICAgLy8gaW4gdGhlIGNhc2Ugd2hlcmUgdGhlcmUncyBubyBhcHAgdG8gaGFuZGxlIHRoZSBjdXN0b20gcHJvdG9jb2wuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBjbGlja2luZyBvbiBhbiBBTVAgbGluay5cbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBuYXZpZ2F0aW9uIHdhcyBoYW5kbGVkLiBPdGhlcndpc2UsIHJldHVybnMgZmFsc2UuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBlXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHshTG9jYXRpb259IGxvY2F0aW9uXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVBMkFDbGlja18oZSwgZWxlbWVudCwgbG9jYXRpb24pIHtcbiAgICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKCdyZWwnKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCByZWxhdGlvbnMgPSBlbGVtZW50XG4gICAgICAuZ2V0QXR0cmlidXRlKCdyZWwnKVxuICAgICAgLnNwbGl0KCcgJylcbiAgICAgIC5tYXAoKHMpID0+IHMudHJpbSgpKTtcbiAgICBpZiAoIXJlbGF0aW9ucy5pbmNsdWRlcygnYW1waHRtbCcpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFRoZSB2aWV3ZXIgbWF5IG5vdCBzdXBwb3J0IHRoZSBjYXBhYmlsaXR5IGZvciBuYXZpZ2F0aW5nIEFNUCBsaW5rcy5cbiAgICBpZiAodGhpcy5uYXZpZ2F0ZVRvQW1wVXJsKGxvY2F0aW9uLmhyZWYsICc8YSByZWw9YW1waHRtbD4nKSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGNsaWNrLW5hdmlnYXRpb24gb24gYSBub24tQTJBLCBzdGFuZGFyZC1wcm90b2NvbCBsaW5rLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZVxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IUxvY2F0aW9ufSB0b0xvY2F0aW9uXG4gICAqIEBwYXJhbSB7IUxvY2F0aW9ufSBmcm9tTG9jYXRpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZU5hdmlnYXRpb25fKGUsIGVsZW1lbnQsIHRvTG9jYXRpb24sIGZyb21Mb2NhdGlvbikge1xuICAgIGNvbnN0IHRvID0gZ2V0SHJlZk1pbnVzSGFzaCh0b0xvY2F0aW9uKTtcbiAgICBjb25zdCBmcm9tID0gZ2V0SHJlZk1pbnVzSGFzaChmcm9tTG9jYXRpb24pO1xuXG4gICAgLy8gSGFuZGxlIHNhbWUtcGFnZSAoaGFzaCkgbmF2aWdhdGlvbiBzZXBhcmF0ZWx5LlxuICAgIGlmICh0b0xvY2F0aW9uLmhhc2ggJiYgdG8gPT0gZnJvbSkge1xuICAgICAgdGhpcy5oYW5kbGVIYXNoTmF2aWdhdGlvbl8oZSwgdG9Mb2NhdGlvbiwgZnJvbUxvY2F0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT3RoZXJ3aXNlLCB0aGlzIGlzIGFuIG90aGVyLXBhZ2UgKGV4dGVybmFsKSBuYXZpZ2F0aW9uLlxuICAgICAgbGV0IHRhcmdldCA9IChlbGVtZW50LmdldEF0dHJpYnV0ZSgndGFyZ2V0JykgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIGlmICh0aGlzLmlzRW1iZWRfIHx8IHRoaXMuaXNJbkFCb3hfKSB7XG4gICAgICAgIC8vIFRhcmdldCBpbiB0aGUgZW1iZWQgbXVzdCBiZSBlaXRoZXIgX3RvcCBvciBfYmxhbmsgKGRlZmF1bHQpLlxuICAgICAgICBpZiAodGFyZ2V0ICE9ICdfdG9wJyAmJiB0YXJnZXQgIT0gJ19ibGFuaycpIHtcbiAgICAgICAgICB0YXJnZXQgPSAnX2JsYW5rJztcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgdGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJVFAgMi4zIG1pdGlnYXRpb24uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy8yNTE3OS5cbiAgICAgIGNvbnN0IHt3aW59ID0gdGhpcy5hbXBkb2M7XG4gICAgICBjb25zdCBwbGF0Zm9ybSA9IFNlcnZpY2VzLnBsYXRmb3JtRm9yKHdpbik7XG4gICAgICBjb25zdCB2aWV3ZXIgPSBTZXJ2aWNlcy52aWV3ZXJGb3JEb2MoZWxlbWVudCk7XG4gICAgICBpZiAoXG4gICAgICAgIGZyb21Mb2NhdGlvbi5zZWFyY2ggJiZcbiAgICAgICAgcGxhdGZvcm0uaXNTYWZhcmkoKSAmJlxuICAgICAgICBwbGF0Zm9ybS5nZXRNYWpvclZlcnNpb24oKSA+PSAxMyAmJlxuICAgICAgICB2aWV3ZXIuaXNQcm94eU9yaWdpbigpICYmXG4gICAgICAgIHZpZXdlci5pc0VtYmVkZGVkKClcbiAgICAgICkge1xuICAgICAgICB0aGlzLnJlbW92ZVZpZXdlclF1ZXJ5QmVmb3JlTmF2aWdhdGlvbl8od2luLCBmcm9tTG9jYXRpb24sIHRhcmdldCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnZpZXdlckludGVyY2VwdHNOYXZpZ2F0aW9uKHRvLCAnaW50ZXJjZXB0X2NsaWNrJykpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUZW1wb3JhcmlseSByZW1vdmUgdmlld2VyIHF1ZXJ5IHBhcmFtcyBmcm9tIGlmcmFtZSAoZS5nLiBhbXBfanNfdiwgdXNxcClcbiAgICogdG8gcHJldmVudCBkb2N1bWVudC5yZWZlcnJlciBmcm9tIGJlaW5nIHJlZHVjZWQgdG8gZVRMRCsxIChlLmcuIGFtcHByb2plY3Qub3JnKS5cbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshTG9jYXRpb259IGZyb21Mb2NhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW1vdmVWaWV3ZXJRdWVyeUJlZm9yZU5hdmlnYXRpb25fKHdpbiwgZnJvbUxvY2F0aW9uLCB0YXJnZXQpIHtcbiAgICBkZXYoKS5pbmZvKFxuICAgICAgVEFHLFxuICAgICAgJ1JlbW92aW5nIGlmcmFtZSBxdWVyeSBzdHJpbmcgYmVmb3JlIG5hdmlnYXRpb246JyxcbiAgICAgIGZyb21Mb2NhdGlvbi5zZWFyY2hcbiAgICApO1xuICAgIGNvbnN0IG9yaWdpbmFsID0gZnJvbUxvY2F0aW9uLmhyZWY7XG4gICAgY29uc3Qgbm9RdWVyeSA9IGAke2Zyb21Mb2NhdGlvbi5vcmlnaW59JHtmcm9tTG9jYXRpb24ucGF0aG5hbWV9JHtmcm9tTG9jYXRpb24uaGFzaH1gO1xuICAgIHdpbi5oaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCAnJywgbm9RdWVyeSk7XG5cbiAgICBjb25zdCByZXN0b3JlUXVlcnkgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50SHJlZiA9IHdpbi5sb2NhdGlvbi5ocmVmO1xuICAgICAgaWYgKGN1cnJlbnRIcmVmID09IG5vUXVlcnkpIHtcbiAgICAgICAgZGV2KCkuaW5mbyhUQUcsICdSZXN0b3JlZCBpZnJhbWUgVVJMIHdpdGggcXVlcnkgc3RyaW5nOicsIG9yaWdpbmFsKTtcbiAgICAgICAgd2luLmhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsICcnLCBvcmlnaW5hbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXYoKS5lcnJvcihUQUcsICdVbmV4cGVjdGVkIGlmcmFtZSBVUkwgY2hhbmdlOicsIGN1cnJlbnRIcmVmLCBub1F1ZXJ5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRm9yIGJsYW5rXywgcmVzdG9yZSBxdWVyeSBwYXJhbXMgYWZ0ZXIgdGhlIG5ldyBwYWdlIG9wZW5zLlxuICAgIGlmICh0YXJnZXQgPT09ICdfYmxhbmsnKSB7XG4gICAgICB3aW4uc2V0VGltZW91dChyZXN0b3JlUXVlcnksIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGb3IgX3RvcCBldGMuLCB3YWl0IHVudGlsIHBhZ2UgaXMgcmVzdG9yZWQgZnJvbSBwYWdlIGNhY2hlIChiZmNhY2hlKS5cbiAgICAgIC8vIGh0dHBzOi8vd2Via2l0Lm9yZy9ibG9nLzUxNi93ZWJraXQtcGFnZS1jYWNoZS1paS10aGUtdW5sb2FkLWV2ZW50L1xuICAgICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ3BhZ2VzaG93JywgZnVuY3Rpb24gb25QYWdlU2hvdyhlKSB7XG4gICAgICAgIGlmIChlLnBlcnNpc3RlZCkge1xuICAgICAgICAgIHJlc3RvcmVRdWVyeSgpO1xuICAgICAgICAgIHdpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdwYWdlc2hvdycsIG9uUGFnZVNob3cpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBjbGlja2luZyBvbiBhbiBpbnRlcm5hbCBsaW5rXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBlXG4gICAqIEBwYXJhbSB7IUxvY2F0aW9ufSB0b0xvY2F0aW9uXG4gICAqIEBwYXJhbSB7IUxvY2F0aW9ufSBmcm9tTG9jYXRpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZUhhc2hOYXZpZ2F0aW9uXyhlLCB0b0xvY2F0aW9uLCBmcm9tTG9jYXRpb24pIHtcbiAgICAvLyBBbmNob3IgbmF2aWdhdGlvbiBpbiBJRSBkb2Vzbid0IGNoYW5nZSBpbnB1dCBmb2N1cywgd2hpY2ggY2FuIHJlc3VsdCBpblxuICAgIC8vIGNvbmZ1c2luZyBiZWhhdmlvciBlLmcuIHdoZW4gcHJlc3NpbmcgXCJ0YWJcIiBidXR0b24uXG4gICAgLy8gQHNlZSBodHRwczovL2h1bWFud2hvY29kZXMuY29tL2Jsb2cvMjAxMy8wMS8xNS9maXhpbmctc2tpcC10by1jb250ZW50LWxpbmtzL1xuICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvYW1waHRtbC9pc3N1ZXMvMTg2NzFcbiAgICBpZiAoIUlTX0VTTSAmJiBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0aGlzLmFtcGRvYy53aW4pLmlzSWUoKSkge1xuICAgICAgY29uc3QgaWQgPSB0b0xvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpO1xuICAgICAgY29uc3QgZWxlbWVudFdpdGhJZCA9IHRoaXMuYW1wZG9jLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgIGlmIChlbGVtZW50V2l0aElkKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhL14oPzphfHNlbGVjdHxpbnB1dHxidXR0b258dGV4dGFyZWEpJC9pLnRlc3QoZWxlbWVudFdpdGhJZC50YWdOYW1lKVxuICAgICAgICApIHtcbiAgICAgICAgICBlbGVtZW50V2l0aElkLnRhYkluZGV4ID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5Rm9jdXMoZWxlbWVudFdpdGhJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2UgcHJldmVudCBkZWZhdWx0IHNvIHRoYXQgdGhlIGN1cnJlbnQgY2xpY2sgZG9lcyBub3QgcHVzaFxuICAgIC8vIGludG8gdGhlIGhpc3Rvcnkgc3RhY2sgYXMgdGhpcyBtZXNzZXMgdXAgdGhlIGV4dGVybmFsIGRvY3VtZW50c1xuICAgIC8vIGhpc3Rvcnkgd2hpY2ggY29udGFpbnMgdGhlIGFtcCBkb2N1bWVudC5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBGb3IgYW4gZW1iZWQsIGRvIG5vdCBwZXJmb3JtIHNjcm9sbGluZyBvciBnbG9iYWwgaGlzdG9yeSBwdXNoIC0gYm90aCBoYXZlXG4gICAgLy8gc2lnbmlmaWNhbnQgVVggYW5kIGJyb3dzZXIgcHJvYmxlbXMuXG4gICAgaWYgKHRoaXMuaXNFbWJlZF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBMb29rIGZvciB0aGUgcmVmZXJlbmNlZCBlbGVtZW50LlxuICAgIGNvbnN0IGhhc2ggPSB0b0xvY2F0aW9uLmhhc2guc2xpY2UoMSk7XG4gICAgbGV0IGVsID0gbnVsbDtcbiAgICBpZiAoaGFzaCkge1xuICAgICAgY29uc3QgZXNjYXBlZEhhc2ggPSBlc2NhcGVDc3NTZWxlY3RvcklkZW50KGhhc2gpO1xuICAgICAgZWwgPVxuICAgICAgICB0aGlzLnJvb3ROb2RlXy5nZXRFbGVtZW50QnlJZChoYXNoKSB8fFxuICAgICAgICAvLyBGYWxsYmFjayB0byBhbmNob3JbbmFtZV0gaWYgZWxlbWVudCB3aXRoIGlkIGlzIG5vdCBmb3VuZC5cbiAgICAgICAgLy8gTGlua2luZyB0byBhbiBhbmNob3IgZWxlbWVudCB3aXRoIG5hbWUgaXMgb2Jzb2xldGUgaW4gaHRtbDUuXG4gICAgICAgIHRoaXMucm9vdE5vZGVfLi8qT0sqLyBxdWVyeVNlbGVjdG9yKGBhW25hbWU9XCIke2VzY2FwZWRIYXNofVwiXWApO1xuICAgIH1cblxuICAgIC8vIElmIHBvc3NpYmxlIGRvIHVwZGF0ZSB0aGUgVVJMIHdpdGggdGhlIGhhc2guIEFzIGV4cGxhaW5lZCBhYm92ZVxuICAgIC8vIHdlIGRvIGByZXBsYWNlYCB0byBhdm9pZCBtZXNzaW5nIHdpdGggdGhlIGNvbnRhaW5lcidzIGhpc3RvcnkuXG4gICAgaWYgKHRvTG9jYXRpb24uaGFzaCAhPSBmcm9tTG9jYXRpb24uaGFzaCkge1xuICAgICAgdGhpcy5oaXN0b3J5Xy5yZXBsYWNlU3RhdGVGb3JUYXJnZXQodG9Mb2NhdGlvbi5oYXNoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb0VsZW1lbnRfKGVsLCBoYXNoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGUgaGFzaCBkaWQgbm90IHVwZGF0ZSBqdXN0IHNjcm9sbCB0byB0aGUgZWxlbWVudC5cbiAgICAgIHRoaXMuc2Nyb2xsVG9FbGVtZW50XyhlbCwgaGFzaCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUVsZW1lbnQsICFFdmVudCl9IGNhbGxiYWNrXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcmlvcml0eVxuICAgKi9cbiAgcmVnaXN0ZXJBbmNob3JNdXRhdG9yKGNhbGxiYWNrLCBwcmlvcml0eSkge1xuICAgIHRoaXMuYW5jaG9yTXV0YXRvcnNfLmVucXVldWUoY2FsbGJhY2ssIHByaW9yaXR5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZyl9IGNhbGxiYWNrXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcmlvcml0eVxuICAgKi9cbiAgcmVnaXN0ZXJOYXZpZ2F0ZVRvTXV0YXRvcihjYWxsYmFjaywgcHJpb3JpdHkpIHtcbiAgICB0aGlzLm5hdmlnYXRlVG9NdXRhdG9yc18uZW5xdWV1ZShjYWxsYmFjaywgcHJpb3JpdHkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdGhlIHBhZ2UgdG8gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7P0VsZW1lbnR9IGVsZW1cbiAgICogQHBhcmFtIHtzdHJpbmd9IGhhc2hcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNjcm9sbFRvRWxlbWVudF8oZWxlbSwgaGFzaCkge1xuICAgIC8vIFNjcm9sbCB0byB0aGUgZWxlbWVudCBpZiBmb3VuZC5cbiAgICBpZiAoZWxlbSkge1xuICAgICAgLy8gVGhlIGZpcnN0IGNhbGwgdG8gc2Nyb2xsSW50b1ZpZXcgb3ZlcnJpZGVzIGJyb3dzZXJzJyBkZWZhdWx0IHNjcm9sbGluZ1xuICAgICAgLy8gYmVoYXZpb3IuIFRoZSBzZWNvbmQgY2FsbCBpbnNpZGVzIHNldFRpbWVvdXQgYWxsb3dzIHVzIHRvIHNjcm9sbCB0b1xuICAgICAgLy8gdGhhdCBlbGVtZW50IHByb3Blcmx5LiBXaXRob3V0IGRvaW5nIHRoaXMsIHRoZSB2aWV3cG9ydCB3aWxsIG5vdCBjYXRjaFxuICAgICAgLy8gdGhlIHVwZGF0ZWQgc2Nyb2xsIHBvc2l0aW9uIG9uIGlPUyBTYWZhcmkgYW5kIGhlbmNlIGNhbGN1bGF0ZSB0aGUgd3JvbmdcbiAgICAgIC8vIHNjcm9sbFRvcCBmb3IgdGhlIHNjcm9sbGJhciBqdW1waW5nIHRoZSB1c2VyIGJhY2sgdG8gdGhlIHRvcCBmb3JcbiAgICAgIC8vIGZhaWxpbmcgdG8gY2FsY3VsYXRlIHRoZSBuZXcganVtcGVkIG9mZnNldC4gV2l0aG91dCB0aGUgZmlyc3QgY2FsbFxuICAgICAgLy8gdGhlcmUgd2lsbCBiZSBhIHZpc3VhbCBqdW1wIGR1ZSB0byBicm93c2VyIHNjcm9sbC4gU2VlXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy81MzM0IGZvciBtb3JlIGRldGFpbHMuXG4gICAgICB0aGlzLnZpZXdwb3J0Xy4vKk9LKi8gc2Nyb2xsSW50b1ZpZXcoZWxlbSk7XG4gICAgICBTZXJ2aWNlcy50aW1lckZvcih0aGlzLmFtcGRvYy53aW4pLmRlbGF5KFxuICAgICAgICAoKSA9PiB0aGlzLnZpZXdwb3J0Xy4vKk9LKi8gc2Nyb2xsSW50b1ZpZXcoZGV2KCkuYXNzZXJ0RWxlbWVudChlbGVtKSksXG4gICAgICAgIDFcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRldigpLndhcm4oXG4gICAgICAgIFRBRyxcbiAgICAgICAgYGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBpZD0ke2hhc2h9IG9yIGFbbmFtZT0ke2hhc2h9XWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHJldHVybiB7IUxvY2F0aW9ufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGFyc2VVcmxfKHVybCkge1xuICAgIHJldHVybiBTZXJ2aWNlcy51cmxGb3JEb2ModGhpcy5zZXJ2aWNlQ29udGV4dF8pLnBhcnNlKHVybCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUxvY2F0aW9ufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0TG9jYXRpb25fKCkge1xuICAgIC8vIEluIHRlc3QgbW9kZSwgd2UncmUgbm90IGFibGUgdG8gcHJvcGVybHkgZml4IHRoZSBhbmNob3IgdGFnJ3MgYmFzZSBVUkwuXG4gICAgLy8gU28sIHdlIGhhdmUgdG8gdXNlIHRoZSAobW9ja2VkKSB3aW5kb3cncyBsb2NhdGlvbiBpbnN0ZWFkLlxuICAgIGNvbnN0IGJhc2VIcmVmID1cbiAgICAgIGdldE1vZGUoKS50ZXN0ICYmICF0aGlzLmlzRW1iZWRfID8gdGhpcy5hbXBkb2Mud2luLmxvY2F0aW9uLmhyZWYgOiAnJztcbiAgICByZXR1cm4gdGhpcy5wYXJzZVVybF8oYmFzZUhyZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIG5hdmlnYXRpb24gdGhyb3VnaCBhIFZpZXdlciB0byB0aGUgZ2l2ZW4gZGVzdGluYXRpb24uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gb25seSBwcm9jZWVkcyBpZjpcbiAgICogMS4gVGhlIHZpZXdlciBzdXBwb3J0cyB0aGUgJ2ludGVyY2VwdE5hdmlnYXRpb24nIGNhcGFiaWxpdHkuXG4gICAqIDIuIFRoZSBjb250YWluZWQgQU1QIGRvYyBoYXMgJ29wdGVkIGluJyB2aWEgaW5jbHVkaW5nIHRoZSAnYWxsb3ctbmF2aWdhdGlvbi1pbnRlcmNlcHRpb24nXG4gICAqIGF0dHJpYnV0ZSBvbiB0aGUgPGh0bWw+IHRhZy5cbiAgICogMy4gVGhlIHZpZXdlciBpcyB0cnVzdGVkIG9yIGZyb20gbG9jYWxob3N0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIEEgVVJMLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkQnkgSW5mb3JtYXRpb25hbCBzdHJpbmcgYWJvdXQgdGhlIGVudGl0eSB0aGF0XG4gICAqICAgICByZXF1ZXN0ZWQgdGhlIG5hdmlnYXRpb24uXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBuYXZpZ2F0aW9uIG1lc3NhZ2Ugd2FzIHNlbnQgdG8gdmlld2VyLlxuICAgKiAgICAgT3RoZXJ3aXNlLCByZXR1cm5zIGZhbHNlLlxuICAgKi9cbiAgdmlld2VySW50ZXJjZXB0c05hdmlnYXRpb24odXJsLCByZXF1ZXN0ZWRCeSkge1xuICAgIGNvbnN0IHZpZXdlckhhc0NhcGFiaWxpdHkgPSB0aGlzLnZpZXdlcl8uaGFzQ2FwYWJpbGl0eShcbiAgICAgICdpbnRlcmNlcHROYXZpZ2F0aW9uJ1xuICAgICk7XG4gICAgY29uc3QgZG9jT3B0ZWRJbiA9XG4gICAgICB0aGlzLmFtcGRvYy5pc1NpbmdsZURvYygpICYmXG4gICAgICB0aGlzLmFtcGRvY1xuICAgICAgICAuZ2V0Um9vdE5vZGUoKVxuICAgICAgICAuZG9jdW1lbnRFbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYWxsb3ctbmF2aWdhdGlvbi1pbnRlcmNlcHRpb24nKTtcblxuICAgIGlmIChcbiAgICAgICF2aWV3ZXJIYXNDYXBhYmlsaXR5IHx8XG4gICAgICAhZG9jT3B0ZWRJbiB8fFxuICAgICAgISh0aGlzLmlzVHJ1c3RlZFZpZXdlcl8gfHwgdGhpcy5pc0xvY2FsVmlld2VyXylcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnZpZXdlcl8uc2VuZE1lc3NhZ2UoXG4gICAgICAnbmF2aWdhdGVUbycsXG4gICAgICBkaWN0KHtcbiAgICAgICAgJ3VybCc6IHVybCxcbiAgICAgICAgJ3JlcXVlc3RlZEJ5JzogcmVxdWVzdGVkQnksXG4gICAgICB9KVxuICAgICk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGUgY2xpY2sgb24gbGlua3MgYW5kIHJlcGxhY2UgdmFyaWFibGVzIGluIHRoZSBjbGljayBVUkwuXG4gKiBUaGUgZnVuY3Rpb24gY2hhbmdlcyB0aGUgYWN0dWFsIGhyZWYgdmFsdWUgYW5kIHN0b3JlcyB0aGVcbiAqIHRlbXBsYXRlIGluIHRoZSBPUklHSU5BTF9IUkVGX0FUVFJJQlVURSBhdHRyaWJ1dGVcbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEBwYXJhbSB7IUV2ZW50fSBlXG4gKi9cbmZ1bmN0aW9uIG1heWJlRXhwYW5kVXJsUGFyYW1zKGFtcGRvYywgZSkge1xuICBjb25zdCB0YXJnZXQgPSBjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvcihcbiAgICBkZXYoKS5hc3NlcnRFbGVtZW50KGUudGFyZ2V0KSxcbiAgICAnQSdcbiAgKTtcbiAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5ocmVmKSB7XG4gICAgLy8gTm90IGEgY2xpY2sgb24gYSBsaW5rLlxuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBocmVmVG9FeHBhbmQgPVxuICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoT1JJR19IUkVGX0FUVFJJQlVURSkgfHwgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICBpZiAoIWhyZWZUb0V4cGFuZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB2YXJzID0ge1xuICAgICdDTElDS19YJzogKCkgPT4ge1xuICAgICAgcmV0dXJuIGUucGFnZVg7XG4gICAgfSxcbiAgICAnQ0xJQ0tfWSc6ICgpID0+IHtcbiAgICAgIHJldHVybiBlLnBhZ2VZO1xuICAgIH0sXG4gIH07XG4gIGNvbnN0IG5ld0hyZWYgPSBTZXJ2aWNlcy51cmxSZXBsYWNlbWVudHNGb3JEb2ModGFyZ2V0KS5leHBhbmRVcmxTeW5jKFxuICAgIGhyZWZUb0V4cGFuZCxcbiAgICB2YXJzLFxuICAgIC8qIG9wdF9hbGxvd2xpc3QgKi8ge1xuICAgICAgLy8gRm9yIG5vdyB3ZSBvbmx5IGFsbG93IHRvIHJlcGxhY2UgdGhlIGNsaWNrIGxvY2F0aW9uIHZhcnNcbiAgICAgIC8vIGFuZCBub3RoaW5nIGVsc2UuXG4gICAgICAvLyBOT1RFOiBBZGRpdGlvbiB0byB0aGlzIGFsbG93bGlzdCByZXF1aXJlcyBhZGRpdGlvbmFsIHJldmlldy5cbiAgICAgICdDTElDS19YJzogdHJ1ZSxcbiAgICAgICdDTElDS19ZJzogdHJ1ZSxcbiAgICB9XG4gICk7XG4gIGlmIChuZXdIcmVmICE9IGhyZWZUb0V4cGFuZCkge1xuICAgIC8vIFN0b3JlIG9yaWdpbmFsIHZhbHVlIHNvIHRoYXQgbGF0ZXIgY2xpY2tzIGNhbiBiZSBwcm9jZXNzZWQgd2l0aFxuICAgIC8vIGZyZXNoZXN0IHZhbHVlcy5cbiAgICBpZiAoIXRhcmdldC5nZXRBdHRyaWJ1dGUoT1JJR19IUkVGX0FUVFJJQlVURSkpIHtcbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoT1JJR19IUkVGX0FUVFJJQlVURSwgaHJlZlRvRXhwYW5kKTtcbiAgICB9XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnaHJlZicsIG5ld0hyZWYpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBocmVmIHdpdGhvdXQgaGFzaC5cbiAqIEBwYXJhbSB7IUxvY2F0aW9ufSBsb2NhdGlvblxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRIcmVmTWludXNIYXNoKGxvY2F0aW9uKSB7XG4gIHJldHVybiBgJHtsb2NhdGlvbi5vcmlnaW59JHtsb2NhdGlvbi5wYXRobmFtZX0ke2xvY2F0aW9uLnNlYXJjaH1gO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/navigation.js