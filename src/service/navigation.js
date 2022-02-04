import {PriorityQueue} from '#core/data-structures/priority-queue';
import {isIframed} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {getWin} from '#core/window';

import {Services} from '#service';

import {dev, user, userAssert} from '#utils/log';

import {getExtraParamsUrl, shouldAppendExtraParams} from '../impression';
import {getMode} from '../mode';
import {openWindowDialog} from '../open-window-dialog';
import {registerServiceBuilderForDoc} from '../service-helpers';
import {isLocalhostOrigin} from '../url';

const TAG = 'navigation';

/** @private @const {string} */
const EVENT_TYPE_CLICK = 'click';

/** @private @const {string} */
const EVENT_TYPE_CONTEXT_MENU = 'contextmenu';

const VALID_TARGETS = ['_top', '_blank'];

/** @private @const {string} */
const ORIG_HREF_ATTRIBUTE = 'data-a4a-orig-href';

/**
 * Key used for retargeting event target originating from shadow DOM.
 * @const {string}
 */
const AMP_CUSTOM_LINKER_TARGET = '__AMP_CUSTOM_LINKER_TARGET__';

/**
 * @enum {number} Priority reserved for extensions in anchor mutations.
 * The higher the priority, the sooner it's invoked.
 */
export const Priority_Enum = {
  LINK_REWRITER_MANAGER: 0,
  ANALYTICS_LINKER: 2,
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
  registerServiceBuilderForDoc(
    ampdoc,
    TAG,
    Navigation,
    /* opt_instantiate */ true
  );
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
export class Navigation {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
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
    this.isIframed_ =
      isIframed(this.ampdoc.win) && this.viewer_.isOvertakeHistory();

    /** @private @const {boolean} */
    this.isEmbed_ =
      this.rootNode_ != this.ampdoc.getRootNode() || !!this.ampdoc.getParent();

    /** @private @const {boolean} */
    this.isInABox_ = getMode(this.ampdoc.win).runtime == 'inabox';

    /**
     * Must use URL parsing scoped to `rootNode_` for correct FIE behavior.
     * @private @const {!Element|!ShadowRoot}
     */
    this.serviceContext_ = /** @type {!Element|!ShadowRoot} */ (
      this.rootNode_.nodeType == Node.DOCUMENT_NODE
        ? this.rootNode_.documentElement
        : this.rootNode_
    );

    /** @private @const {!function(!Event)|undefined} */
    this.boundHandle_ = this.handle_.bind(this);
    this.rootNode_.addEventListener(EVENT_TYPE_CLICK, this.boundHandle_);
    this.rootNode_.addEventListener(EVENT_TYPE_CONTEXT_MENU, this.boundHandle_);
    /** @private {boolean} */
    this.appendExtraParams_ = false;
    shouldAppendExtraParams(this.ampdoc).then((res) => {
      this.appendExtraParams_ = res;
    });

    /** @private {boolean} */
    this.isTrustedViewer_ = false;
    /** @private {boolean} */
    this.isLocalViewer_ = false;
    Promise.all([
      this.viewer_.isTrustedViewer(),
      this.viewer_.getViewerOrigin(),
    ]).then((values) => {
      this.isTrustedViewer_ = values[0];
      this.isLocalViewer_ = isLocalhostOrigin(values[1]);
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
  static installAnchorClickInterceptor(ampdoc, win) {
    win.document.documentElement.addEventListener(
      'click',
      maybeExpandUrlParams.bind(null, ampdoc),
      /* capture */ true
    );
  }

  /**
   * Removes all event listeners.
   */
  cleanup() {
    if (this.boundHandle_) {
      this.rootNode_.removeEventListener(EVENT_TYPE_CLICK, this.boundHandle_);
      this.rootNode_.removeEventListener(
        EVENT_TYPE_CONTEXT_MENU,
        this.boundHandle_
      );
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
  openWindow(win, url, target, opener) {
    let options = '';
    // We don't pass noopener for Chrome since it opens a new window without
    // tabs. Instead, we remove the opener property from the newly opened
    // window.
    // Note: for Safari, we need to use noopener instead of clearing the opener
    // property.
    if ((this.platform_.isIos() || !this.platform_.isChrome()) && !opener) {
      options += 'noopener';
    }

    const newWin = openWindowDialog(win, url, target, options);
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
  navigateTo(win, url, opt_requestedBy, options = {}) {
    const {opener = false, target = '_top'} = options;
    url = this.applyNavigateToMutators_(url);
    const urlService = Services.urlForDoc(this.serviceContext_);
    if (!urlService.isProtocolValid(url)) {
      user().error(TAG, 'Cannot navigate to invalid protocol: ' + url);
      return;
    }

    userAssert(
      VALID_TARGETS.includes(target),
      `Target '${target}' not supported.`
    );

    // If we're on cache, resolve relative URLs to the publisher (non-cache) origin.
    const sourceUrl = urlService.getSourceUrl(win.location);
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
  navigateToAmpUrl(url, requestedBy) {
    if (this.viewer_.hasCapability('a2a')) {
      this.viewer_.sendMessage('a2aNavigate', {
        'url': url,
        'requestedBy': requestedBy,
      });
      return true;
    }
    return false;
  }

  /**
   * @return {!Array<string>}
   * @private
   */
  queryA2AFeatures_() {
    const meta = this.rootNode_.querySelector(
      'meta[name="amp-to-amp-navigation"]'
    );
    if (meta && meta.hasAttribute('content')) {
      return meta
        .getAttribute('content')
        .split(',')
        .map((s) => s.trim());
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
  handle_(e) {
    if (e.defaultPrevented) {
      return;
    }
    const element = dev().assertElement(
      e[AMP_CUSTOM_LINKER_TARGET] || e.target
    );
    const target = closestAncestorElementBySelector(element, 'A');
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
  handleClick_(element, e) {
    this.expandVarsForAnchor_(element);

    let toLocation = this.parseUrl_(element.href);

    // Handle AMP-to-AMP navigation and early-outs, if rel=amphtml.
    if (this.handleA2AClick_(e, element, toLocation)) {
      return;
    }

    // Handle navigating to custom protocol and early-outs, if applicable.
    if (this.handleCustomProtocolClick_(e, element, toLocation)) {
      return;
    }

    const fromLocation = this.getLocation_();
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
  handleContextMenuClick_(element, e) {
    // TODO(wg-performance): Handle A2A, custom link protocols, and ITP 2.3 mitigation.
    this.expandVarsForAnchor_(element);
    this.applyAnchorMutators_(element, e);
  }

  /**
   * Apply anchor transformations.
   * @param {!Element} element
   * @param {!Event} e
   */
  applyAnchorMutators_(element, e) {
    this.anchorMutators_.forEach((anchorMutator) => {
      anchorMutator(element, e);
    });
  }

  /**
   * Apply URL transformations for AMP.navigateTo.
   * @param {string} url
   * @return {string}
   */
  applyNavigateToMutators_(url) {
    this.navigateToMutators_.forEach((mutator) => {
      url = mutator(url);
    });
    return url;
  }

  /**
   * @param {!Element} el
   * @private
   */
  expandVarsForAnchor_(el) {
    // First check if need to handle external link decoration.
    let defaultExpandParamsUrl = null;
    if (this.appendExtraParams_ && !this.isEmbed_) {
      // Only decorate outgoing link when needed to and is not in FIE.
      defaultExpandParamsUrl = getExtraParamsUrl(this.ampdoc.win, el);
    }

    const urlReplacements = Services.urlReplacementsForDoc(el);
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
  handleCustomProtocolClick_(e, element, location) {
    // Handle custom protocols only if the document is iframed.
    if (!this.isIframed_) {
      return false;
    }

    /** @const {!Window} */
    const win = getWin(element);
    const url = element.href;
    const {protocol} = location;

    // On Safari iOS, custom protocol links will fail to open apps when the
    // document is iframed - in order to go around this, we set the top.location
    // to the custom protocol href.
    const isFTP = protocol == 'ftp:';

    // In case of FTP Links in embedded documents always open then in _blank.
    if (isFTP) {
      openWindowDialog(win, url, '_blank');
      e.preventDefault();
      return true;
    }

    const isNormalProtocol = /^(https?|mailto):$/.test(protocol);
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
  handleA2AClick_(e, element, location) {
    if (!element.hasAttribute('rel')) {
      return false;
    }
    const relations = element
      .getAttribute('rel')
      .split(' ')
      .map((s) => s.trim());
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
  handleNavigation_(e, element, toLocation, fromLocation) {
    const to = getHrefMinusHash(toLocation);
    const from = getHrefMinusHash(fromLocation);

    // Handle same-page (hash) navigation separately.
    if (toLocation.hash && to == from) {
      this.handleHashNavigation_(e, toLocation, fromLocation);
    } else {
      // Otherwise, this is an other-page (external) navigation.
      let target = (element.getAttribute('target') || '').toLowerCase();

      if (this.isEmbed_ || this.isInABox_) {
        // Target in the embed must be either _top or _blank (default).
        if (target != '_top' && target != '_blank') {
          target = '_blank';
          element.setAttribute('target', target);
        }
      }

      // ITP 2.3 mitigation. See https://github.com/ampproject/amphtml/issues/25179.
      const {win} = this.ampdoc;
      const platform = Services.platformFor(win);
      const viewer = Services.viewerForDoc(element);
      if (
        fromLocation.search &&
        platform.isSafari() &&
        platform.getMajorVersion() >= 13 &&
        viewer.isProxyOrigin() &&
        viewer.isEmbedded()
      ) {
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
  removeViewerQueryBeforeNavigation_(win, fromLocation, target) {
    dev().info(
      TAG,
      'Removing iframe query string before navigation:',
      fromLocation.search
    );
    const original = fromLocation.href;
    const noQuery = `${fromLocation.origin}${fromLocation.pathname}${fromLocation.hash}`;
    win.history.replaceState(null, '', noQuery);

    const restoreQuery = () => {
      const currentHref = win.location.href;
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
  handleHashNavigation_(e, toLocation, fromLocation) {
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
    const hash = toLocation.hash.slice(1);
    let el = null;
    if (hash) {
      const escapedHash = escapeCssSelectorIdent(hash);
      el =
        this.rootNode_.getElementById(hash) ||
        // Fallback to anchor[name] if element with id is not found.
        // Linking to an anchor element with name is obsolete in html5.
        this.rootNode_./*OK*/ querySelector(`a[name="${escapedHash}"]`);
    }

    // If possible do update the URL with the hash. As explained above
    // we do `replace` to avoid messing with the container's history.
    if (toLocation.hash != fromLocation.hash) {
      this.history_.replaceStateForTarget(toLocation.hash).then(() => {
        this.scrollToElement_(el, hash);
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
  registerAnchorMutator(callback, priority) {
    this.anchorMutators_.enqueue(callback, priority);
  }

  /**
   * @param {function(string)} callback
   * @param {number} priority
   */
  registerNavigateToMutator(callback, priority) {
    this.navigateToMutators_.enqueue(callback, priority);
  }

  /**
   * Scrolls the page to the given element.
   * @param {?Element} elem
   * @param {string} hash
   * @private
   */
  scrollToElement_(elem, hash) {
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
      this.viewport_./*OK*/ scrollIntoView(elem);
      Services.timerFor(this.ampdoc.win).delay(
        () => this.viewport_./*OK*/ scrollIntoView(dev().assertElement(elem)),
        1
      );
    } else {
      dev().warn(
        TAG,
        `failed to find element with id=${hash} or a[name=${hash}]`
      );
    }
  }

  /**
   * @param {string} url
   * @return {!Location}
   * @private
   */
  parseUrl_(url) {
    return Services.urlForDoc(this.serviceContext_).parse(url);
  }

  /**
   * @return {!Location}
   * @private
   */
  getLocation_() {
    // In test mode, we're not able to properly fix the anchor tag's base URL.
    // So, we have to use the (mocked) window's location instead.
    const baseHref =
      getMode().test && !this.isEmbed_ ? this.ampdoc.win.location.href : '';
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
  viewerInterceptsNavigation(url, requestedBy) {
    const viewerHasCapability = this.viewer_.hasCapability(
      'interceptNavigation'
    );
    const docOptedIn =
      this.ampdoc.isSingleDoc() &&
      this.ampdoc
        .getRootNode()
        .documentElement.hasAttribute('allow-navigation-interception');

    if (
      !viewerHasCapability ||
      !docOptedIn ||
      !(this.isTrustedViewer_ || this.isLocalViewer_)
    ) {
      return false;
    }

    this.viewer_.sendMessage('navigateTo', {
      'url': url,
      'requestedBy': requestedBy,
    });
    return true;
  }
}

/**
 * Handle click on links and replace variables in the click URL.
 * The function changes the actual href value and stores the
 * template in the ORIGINAL_HREF_ATTRIBUTE attribute
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Event} e
 */
function maybeExpandUrlParams(ampdoc, e) {
  const target = closestAncestorElementBySelector(
    dev().assertElement(e.target),
    'A'
  );
  if (!target || !target.href) {
    // Not a click on a link.
    return;
  }
  const hrefToExpand =
    target.getAttribute(ORIG_HREF_ATTRIBUTE) || target.getAttribute('href');
  if (!hrefToExpand) {
    return;
  }
  const vars = {
    'CLICK_X': () => {
      return e.pageX;
    },
    'CLICK_Y': () => {
      return e.pageY;
    },
  };
  const newHref = Services.urlReplacementsForDoc(target).expandUrlSync(
    hrefToExpand,
    vars,
    /* opt_allowlist */ {
      // For now we only allow to replace the click location vars
      // and nothing else.
      // NOTE: Addition to this allowlist requires additional review.
      'CLICK_X': true,
      'CLICK_Y': true,
    }
  );
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
  return `${location.origin}${location.pathname}${location.search}`;
}
