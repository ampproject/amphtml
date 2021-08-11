function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { Services } from "../../../src/service";
import { ancestorElementsByTag } from "../../../src/core/dom/query";
import { createElementWithAttributes, removeElement } from "../../../src/core/dom";
import { devAssert, user, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getAdContainer } from "../../../src/ad-helper";
import { listen } from "../../../src/event-helper";
import { setStyle, setStyles } from "../../../src/core/dom/style";
var TAG = 'amp-ad-ui';
var STICKY_AD_MAX_SIZE_LIMIT = 0.2;
var STICKY_AD_MAX_HEIGHT_LIMIT = 0.5;
var TOP_STICKY_AD_CLOSE_THRESHOLD = 50;
var TOP_STICKY_AD_TRIGGER_THRESHOLD = 200;

/**
 * Permissible sticky ad options.
 * @const @enum {string}
 */
var StickyAdPositions = {
  TOP: 'top',
  BOTTOM: 'bottom',
  BOTTOM_RIGHT: 'bottom-right'
};
var STICKY_AD_PROP = 'sticky';
export var AmpAdUIHandler = /*#__PURE__*/function () {
  /**
   * @param {!AMP.BaseElement} baseInstance
   */
  function AmpAdUIHandler(baseInstance) {
    _classCallCheck(this, AmpAdUIHandler);

    /** @private {!AMP.BaseElement} */
    this.baseInstance_ = baseInstance;

    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private @const {!Document} */
    this.doc_ = baseInstance.win.document;
    this.containerElement_ = null;

    /**
     * If this is a sticky ad unit, the sticky position option.
     * @private {?StickyAdPositions}
     */
    this.stickyAdPosition_ = null;

    if (this.element_.hasAttribute(STICKY_AD_PROP)) {
      // TODO(powerivq@) Kargo is currently running an experiment using empty sticky attribute, so
      // we default the position to bottom right. Remove this default afterwards.
      if (!this.element_.getAttribute(STICKY_AD_PROP)) {
        user().error(TAG, 'amp-ad sticky is deprecating empty attribute value, please use <amp-ad sticky="bottom" instead');
      }

      this.stickyAdPosition_ = this.element_.getAttribute(STICKY_AD_PROP) || StickyAdPositions.BOTTOM_RIGHT;
      this.element_.setAttribute(STICKY_AD_PROP, this.stickyAdPosition_);
    }

    /**
     * Whether the close button has been rendered for a sticky ad unit.
     */
    this.closeButtonRendered_ = false;

    /**
     * For top sticky ads, we close the ads when scrolled to the top.
     * @private {!Function}
     */
    this.topStickyAdScrollListener_ = undefined;

    /**
     * For top sticky ads, we waited until scrolling down before activating
     * the closing ads listener.
     * @private {boolean}
     */
    this.topStickyAdCloserAcitve_ = false;

    /**
     * Unlisteners to be unsubscribed after destroying.
     * @private {!Array<!Function>}
     */
    this.unlisteners_ = [];

    if (this.element_.hasAttribute('data-ad-container-id')) {
      var id = this.element_.getAttribute('data-ad-container-id');
      var container = this.doc_.getElementById(id);

      if (container && container.tagName == 'AMP-LAYOUT' && container.contains(this.element_)) {
        // Parent <amp-layout> component with reference id can serve as the
        // ad container
        this.containerElement_ = container;
      }
    }

    if (!baseInstance.getFallback()) {
      var fallback = this.addDefaultUiComponent_('fallback');

      if (fallback) {
        this.baseInstance_.element.appendChild(fallback);
      }
    }
  }

  /**
   * Apply UI for laid out ad with no-content
   * Order: try collapse -> apply provided fallback -> apply default fallback
   */
  _createClass(AmpAdUIHandler, [{
    key: "applyNoContentUI",
    value: function applyNoContentUI() {
      var _this = this;

      if (getAdContainer(this.element_) === 'AMP-STICKY-AD') {
        // Special case: force collapse sticky-ad if no content.
        this.baseInstance_.
        /*OK*/
        collapse();
        return;
      }

      if (getAdContainer(this.element_) === 'AMP-FX-FLYING-CARPET') {
        /**
         * Special case: Force collapse the ad if it is the,
         * only and direct child of a flying carpet.
         * Also, this will not handle
         * the amp-layout case for now, as it could be
         * inefficient. And we have not seen an amp-layout
         * used with flying carpet and ads yet.
         */
        var flyingCarpetElements = ancestorElementsByTag(this.element_, 'amp-fx-flying-carpet');
        var flyingCarpetElement = flyingCarpetElements[0];
        flyingCarpetElement.getImpl().then(function (implementation) {
          var children = implementation.getChildren();

          if (children.length === 1 && children[0] === _this.element_) {
            _this.baseInstance_.
            /*OK*/
            collapse();
          }
        });
        return;
      }

      var attemptCollapsePromise;

      if (this.containerElement_) {
        // Collapse the container element if there's one
        attemptCollapsePromise = Services.mutatorForDoc(this.element_.getAmpDoc()).attemptCollapse(this.containerElement_);
        attemptCollapsePromise.then(function () {});
      } else {
        attemptCollapsePromise = this.baseInstance_.attemptCollapse();
      }

      // The order here is collapse > user provided fallback > default fallback
      attemptCollapsePromise.catch(function () {
        _this.baseInstance_.mutateElement(function () {
          _this.baseInstance_.togglePlaceholder(false);

          _this.baseInstance_.toggleFallback(true);
        });
      });
    }
    /**
     * Apply UI for unlaid out ad: Hide fallback.
     * Note: No need to togglePlaceholder here, unlayout show it by default.
     */

  }, {
    key: "applyUnlayoutUI",
    value: function applyUnlayoutUI() {
      var _this2 = this;

      this.baseInstance_.mutateElement(function () {
        _this2.baseInstance_.toggleFallback(false);
      });
    }
    /**
     * @param {string} name
     * @return {?Element}
     * @private
     */

  }, {
    key: "addDefaultUiComponent_",
    value: function addDefaultUiComponent_(name) {
      if (this.element_.tagName == 'AMP-EMBED') {
        // Do nothing for amp-embed element;
        return null;
      }

      var uiComponent = this.doc_.createElement('div');
      uiComponent.setAttribute(name, '');
      var content = this.doc_.createElement('div');
      content.classList.add('i-amphtml-ad-default-holder');
      // TODO(aghassemi, #4146) i18n
      content.setAttribute('data-ad-holder-text', 'Ad');
      uiComponent.appendChild(content);
      return uiComponent;
    }
    /**
     * Verify that the limits for sticky ads are not exceeded
     */

  }, {
    key: "validateStickyAd",
    value: function validateStickyAd() {
      userAssert(this.doc_.querySelectorAll('amp-sticky-ad.i-amphtml-built, amp-ad[sticky].i-amphtml-built').length <= 1, 'At most one sticky ad can be loaded per page');
    }
    /**
     * @return {boolean}
     */

  }, {
    key: "isStickyAd",
    value: function isStickyAd() {
      return this.stickyAdPosition_ !== null;
    }
    /**
     * Initialize sticky ad related features
     */

  }, {
    key: "maybeInitStickyAd",
    value: function maybeInitStickyAd() {
      if (this.isStickyAd()) {
        setStyle(this.element_, 'visibility', 'visible');

        if (this.stickyAdPosition_ == StickyAdPositions.TOP) {
          // Let the top sticky ad be below the viewer top.
          var paddingTop = Services.viewportForDoc(this.element_.getAmpDoc()).getPaddingTop();
          setStyle(this.element_, 'top', paddingTop + "px");
        }

        if (this.stickyAdPosition_ == StickyAdPositions.BOTTOM) {
          var paddingBar = this.doc_.createElement('amp-ad-sticky-padding');
          this.element_.insertBefore(paddingBar, devAssert(this.element_.firstChild, 'amp-ad should have been expanded.'));
        }

        if (!this.closeButtonRendered_) {
          this.addCloseButton_();
          this.closeButtonRendered_ = true;
        }
      }
    }
    /**
     * Scroll promise for sticky ad
     * @return {Promise}
     */

  }, {
    key: "getScrollPromiseForStickyAd",
    value: function getScrollPromiseForStickyAd() {
      var _this3 = this;

      if (this.isStickyAd()) {
        return new Promise(function (resolve) {
          var unlisten = Services.viewportForDoc(_this3.element_.getAmpDoc()).onScroll(function () {
            resolve();
            unlisten();
          });
        });
      }

      return Promise.resolve(null);
    }
    /**
     * When a sticky ad is shown, the close button should be rendered at the same time.
     */

  }, {
    key: "onResizeSuccess",
    value: function onResizeSuccess() {
      var _this4 = this;

      if (this.isStickyAd() && !this.topStickyAdScrollListener_) {
        var doc = this.element_.getAmpDoc();
        this.topStickyAdScrollListener_ = Services.viewportForDoc(doc).onScroll(function () {
          var scrollPos = doc.win.
          /*OK*/
          scrollY;

          if (scrollPos > TOP_STICKY_AD_TRIGGER_THRESHOLD) {
            _this4.topStickyAdCloserAcitve_ = true;
          }

          // When the scroll position is close to the top, we close the
          // top sticky ad in order not to have the ads overlap the
          // content.
          if (_this4.topStickyAdCloserAcitve_ && scrollPos < TOP_STICKY_AD_CLOSE_THRESHOLD) {
            _this4.closeStickyAd_();
          }
        });
        this.unlisteners_.push(this.topStickyAdScrollListener_);
      }
    }
    /**
     * Close the sticky ad
     */

  }, {
    key: "closeStickyAd_",
    value: function closeStickyAd_() {
      var _this5 = this;

      Services.vsyncFor(this.baseInstance_.win).mutate(function () {
        var viewport = Services.viewportForDoc(_this5.element_.getAmpDoc());
        viewport.removeFromFixedLayer(_this5.element);
        removeElement(_this5.element_);
        viewport.updatePaddingBottom(0);
      });

      if (this.topStickyAdScrollListener_) {
        this.topStickyAdScrollListener_();
      }
    }
    /**
     * The function that add a close button to sticky ad
     */

  }, {
    key: "addCloseButton_",
    value: function addCloseButton_() {
      var closeButton = createElementWithAttributes(
      /** @type {!Document} */
      this.element_.ownerDocument, 'button', dict({
        'aria-label': this.element_.getAttribute('data-close-button-aria-label') || 'Close this ad'
      }));
      this.unlisteners_.push(listen(closeButton, 'click', this.closeStickyAd_.bind(this)));
      closeButton.classList.add('amp-ad-close-button');
      this.element_.appendChild(closeButton);
    }
    /**
     * @param {number|string|undefined} height
     * @param {number|string|undefined} width
     * @param {number} iframeHeight
     * @param {number} iframeWidth
     * @param {!MessageEvent} event
     * @return {!Promise<!Object>}
     */

  }, {
    key: "updateSize",
    value: function updateSize(height, width, iframeHeight, iframeWidth, event) {
      var _this6 = this;

      // Calculate new width and height of the container to include the padding.
      // If padding is negative, just use the requested width and height directly.
      var newHeight, newWidth;
      height = parseInt(height, 10);

      if (!isNaN(height)) {
        newHeight = Math.max(this.element_.
        /*OK*/
        offsetHeight + height - iframeHeight, height);
      }

      width = parseInt(width, 10);

      if (!isNaN(width)) {
        newWidth = Math.max(this.element_.
        /*OK*/
        offsetWidth + width - iframeWidth, width);
      }

      /** @type {!Object<boolean, number|undefined, number|undefined>} */
      var resizeInfo = {
        success: true,
        newWidth: newWidth,
        newHeight: newHeight
      };

      if (!newHeight && !newWidth) {
        return Promise.reject(new Error('undefined width and height'));
      }

      if (getAdContainer(this.element_) == 'AMP-STICKY-AD') {
        // Special case: force collapse sticky-ad if no content.
        resizeInfo.success = false;
        return Promise.resolve(resizeInfo);
      }

      // Special case: for sticky ads, we enforce 20% size limit and 50% height limit
      if (this.isStickyAd()) {
        var viewport = this.baseInstance_.getViewport();

        if (height * width > STICKY_AD_MAX_SIZE_LIMIT * viewport.getHeight() * viewport.getWidth() || newHeight > STICKY_AD_MAX_HEIGHT_LIMIT * viewport.getHeight()) {
          resizeInfo.success = false;
          return Promise.resolve(resizeInfo);
        }
      }

      return this.baseInstance_.attemptChangeSize(newHeight, newWidth, event).then(function () {
        _this6.setSize_(_this6.element_.querySelector('iframe'), height, width);

        return resizeInfo;
      }, function () {
        resizeInfo.success = false;
        return resizeInfo;
      });
    }
    /**
     * Force set the dimensions for an element
     * @param {Any} element
     * @param {number} newHeight
     * @param {number} newWidth
     */

  }, {
    key: "setSize_",
    value: function setSize_(element, newHeight, newWidth) {
      setStyles(element, {
        'height': newHeight + "px",
        'width': newWidth + "px"
      });
    }
    /**
     * Clean up the listeners
     */

  }, {
    key: "cleanup",
    value: function cleanup() {
      this.unlisteners_.forEach(function (unlistener) {
        return unlistener();
      });
      this.unlisteners_.length = 0;
    }
  }]);

  return AmpAdUIHandler;
}();
// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdUIHandler = AmpAdUIHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hZC11aS5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsImFuY2VzdG9yRWxlbWVudHNCeVRhZyIsImNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyIsInJlbW92ZUVsZW1lbnQiLCJkZXZBc3NlcnQiLCJ1c2VyIiwidXNlckFzc2VydCIsImRpY3QiLCJnZXRBZENvbnRhaW5lciIsImxpc3RlbiIsInNldFN0eWxlIiwic2V0U3R5bGVzIiwiVEFHIiwiU1RJQ0tZX0FEX01BWF9TSVpFX0xJTUlUIiwiU1RJQ0tZX0FEX01BWF9IRUlHSFRfTElNSVQiLCJUT1BfU1RJQ0tZX0FEX0NMT1NFX1RIUkVTSE9MRCIsIlRPUF9TVElDS1lfQURfVFJJR0dFUl9USFJFU0hPTEQiLCJTdGlja3lBZFBvc2l0aW9ucyIsIlRPUCIsIkJPVFRPTSIsIkJPVFRPTV9SSUdIVCIsIlNUSUNLWV9BRF9QUk9QIiwiQW1wQWRVSUhhbmRsZXIiLCJiYXNlSW5zdGFuY2UiLCJiYXNlSW5zdGFuY2VfIiwiZWxlbWVudF8iLCJlbGVtZW50IiwiZG9jXyIsIndpbiIsImRvY3VtZW50IiwiY29udGFpbmVyRWxlbWVudF8iLCJzdGlja3lBZFBvc2l0aW9uXyIsImhhc0F0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsImVycm9yIiwic2V0QXR0cmlidXRlIiwiY2xvc2VCdXR0b25SZW5kZXJlZF8iLCJ0b3BTdGlja3lBZFNjcm9sbExpc3RlbmVyXyIsInVuZGVmaW5lZCIsInRvcFN0aWNreUFkQ2xvc2VyQWNpdHZlXyIsInVubGlzdGVuZXJzXyIsImlkIiwiY29udGFpbmVyIiwiZ2V0RWxlbWVudEJ5SWQiLCJ0YWdOYW1lIiwiY29udGFpbnMiLCJnZXRGYWxsYmFjayIsImZhbGxiYWNrIiwiYWRkRGVmYXVsdFVpQ29tcG9uZW50XyIsImFwcGVuZENoaWxkIiwiY29sbGFwc2UiLCJmbHlpbmdDYXJwZXRFbGVtZW50cyIsImZseWluZ0NhcnBldEVsZW1lbnQiLCJnZXRJbXBsIiwidGhlbiIsImltcGxlbWVudGF0aW9uIiwiY2hpbGRyZW4iLCJnZXRDaGlsZHJlbiIsImxlbmd0aCIsImF0dGVtcHRDb2xsYXBzZVByb21pc2UiLCJtdXRhdG9yRm9yRG9jIiwiZ2V0QW1wRG9jIiwiYXR0ZW1wdENvbGxhcHNlIiwiY2F0Y2giLCJtdXRhdGVFbGVtZW50IiwidG9nZ2xlUGxhY2Vob2xkZXIiLCJ0b2dnbGVGYWxsYmFjayIsIm5hbWUiLCJ1aUNvbXBvbmVudCIsImNyZWF0ZUVsZW1lbnQiLCJjb250ZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwicXVlcnlTZWxlY3RvckFsbCIsImlzU3RpY2t5QWQiLCJwYWRkaW5nVG9wIiwidmlld3BvcnRGb3JEb2MiLCJnZXRQYWRkaW5nVG9wIiwicGFkZGluZ0JhciIsImluc2VydEJlZm9yZSIsImZpcnN0Q2hpbGQiLCJhZGRDbG9zZUJ1dHRvbl8iLCJQcm9taXNlIiwicmVzb2x2ZSIsInVubGlzdGVuIiwib25TY3JvbGwiLCJkb2MiLCJzY3JvbGxQb3MiLCJzY3JvbGxZIiwiY2xvc2VTdGlja3lBZF8iLCJwdXNoIiwidnN5bmNGb3IiLCJtdXRhdGUiLCJ2aWV3cG9ydCIsInJlbW92ZUZyb21GaXhlZExheWVyIiwidXBkYXRlUGFkZGluZ0JvdHRvbSIsImNsb3NlQnV0dG9uIiwib3duZXJEb2N1bWVudCIsImJpbmQiLCJoZWlnaHQiLCJ3aWR0aCIsImlmcmFtZUhlaWdodCIsImlmcmFtZVdpZHRoIiwiZXZlbnQiLCJuZXdIZWlnaHQiLCJuZXdXaWR0aCIsInBhcnNlSW50IiwiaXNOYU4iLCJNYXRoIiwibWF4Iiwib2Zmc2V0SGVpZ2h0Iiwib2Zmc2V0V2lkdGgiLCJyZXNpemVJbmZvIiwic3VjY2VzcyIsInJlamVjdCIsIkVycm9yIiwiZ2V0Vmlld3BvcnQiLCJnZXRIZWlnaHQiLCJnZXRXaWR0aCIsImF0dGVtcHRDaGFuZ2VTaXplIiwic2V0U2l6ZV8iLCJxdWVyeVNlbGVjdG9yIiwiZm9yRWFjaCIsInVubGlzdGVuZXIiLCJBTVAiXSwibWFwcGluZ3MiOiI7Ozs7OztB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VUFBUDtBQUNELE9BTkUsRUFPSCxZQUFNO0FBQ0pBLFFBQUFBLFVBQVUsQ0FBQ0MsT0FBWCxHQUFxQixLQUFyQjtBQUNBLGVBQU9ELFVBQVA7QUFDRCxPQVZFLENBQVA7QUFZRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFsWUE7QUFBQTtBQUFBLFdBbVlFLGtCQUFTdEYsT0FBVCxFQUFrQjhFLFNBQWxCLEVBQTZCQyxRQUE3QixFQUF1QztBQUNyQzlGLE1BQUFBLFNBQVMsQ0FBQ2UsT0FBRCxFQUFVO0FBQ2pCLGtCQUFhOEUsU0FBYixPQURpQjtBQUVqQixpQkFBWUMsUUFBWjtBQUZpQixPQUFWLENBQVQ7QUFJRDtBQUVEO0FBQ0Y7QUFDQTs7QUE1WUE7QUFBQTtBQUFBLFdBNllFLG1CQUFVO0FBQ1IsV0FBS2pFLFlBQUwsQ0FBa0JrRixPQUFsQixDQUEwQixVQUFDQyxVQUFEO0FBQUEsZUFBZ0JBLFVBQVUsRUFBMUI7QUFBQSxPQUExQjtBQUNBLFdBQUtuRixZQUFMLENBQWtCa0IsTUFBbEIsR0FBMkIsQ0FBM0I7QUFDRDtBQWhaSDs7QUFBQTtBQUFBO0FBbVpBO0FBQ0E7QUFDQWtFLEdBQUcsQ0FBQ3RHLGNBQUosR0FBcUJBLGNBQXJCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7YW5jZXN0b3JFbGVtZW50c0J5VGFnfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMsIHJlbW92ZUVsZW1lbnR9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2RldkFzc2VydCwgdXNlciwgdXNlckFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbmltcG9ydCB7Z2V0QWRDb250YWluZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9hZC1oZWxwZXInO1xuaW1wb3J0IHtsaXN0ZW59IGZyb20gJy4uLy4uLy4uL3NyYy9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtzZXRTdHlsZSwgc2V0U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG5jb25zdCBUQUcgPSAnYW1wLWFkLXVpJztcblxuY29uc3QgU1RJQ0tZX0FEX01BWF9TSVpFX0xJTUlUID0gMC4yO1xuY29uc3QgU1RJQ0tZX0FEX01BWF9IRUlHSFRfTElNSVQgPSAwLjU7XG5cbmNvbnN0IFRPUF9TVElDS1lfQURfQ0xPU0VfVEhSRVNIT0xEID0gNTA7XG5jb25zdCBUT1BfU1RJQ0tZX0FEX1RSSUdHRVJfVEhSRVNIT0xEID0gMjAwO1xuXG4vKipcbiAqIFBlcm1pc3NpYmxlIHN0aWNreSBhZCBvcHRpb25zLlxuICogQGNvbnN0IEBlbnVtIHtzdHJpbmd9XG4gKi9cbmNvbnN0IFN0aWNreUFkUG9zaXRpb25zID0ge1xuICBUT1A6ICd0b3AnLFxuICBCT1RUT006ICdib3R0b20nLFxuICBCT1RUT01fUklHSFQ6ICdib3R0b20tcmlnaHQnLFxufTtcblxuY29uc3QgU1RJQ0tZX0FEX1BST1AgPSAnc3RpY2t5JztcblxuZXhwb3J0IGNsYXNzIEFtcEFkVUlIYW5kbGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFNUC5CYXNlRWxlbWVudH0gYmFzZUluc3RhbmNlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihiYXNlSW5zdGFuY2UpIHtcbiAgICAvKiogQHByaXZhdGUgeyFBTVAuQmFzZUVsZW1lbnR9ICovXG4gICAgdGhpcy5iYXNlSW5zdGFuY2VfID0gYmFzZUluc3RhbmNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmVsZW1lbnRfID0gYmFzZUluc3RhbmNlLmVsZW1lbnQ7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRG9jdW1lbnR9ICovXG4gICAgdGhpcy5kb2NfID0gYmFzZUluc3RhbmNlLndpbi5kb2N1bWVudDtcblxuICAgIHRoaXMuY29udGFpbmVyRWxlbWVudF8gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogSWYgdGhpcyBpcyBhIHN0aWNreSBhZCB1bml0LCB0aGUgc3RpY2t5IHBvc2l0aW9uIG9wdGlvbi5cbiAgICAgKiBAcHJpdmF0ZSB7P1N0aWNreUFkUG9zaXRpb25zfVxuICAgICAqL1xuICAgIHRoaXMuc3RpY2t5QWRQb3NpdGlvbl8gPSBudWxsO1xuICAgIGlmICh0aGlzLmVsZW1lbnRfLmhhc0F0dHJpYnV0ZShTVElDS1lfQURfUFJPUCkpIHtcbiAgICAgIC8vIFRPRE8ocG93ZXJpdnFAKSBLYXJnbyBpcyBjdXJyZW50bHkgcnVubmluZyBhbiBleHBlcmltZW50IHVzaW5nIGVtcHR5IHN0aWNreSBhdHRyaWJ1dGUsIHNvXG4gICAgICAvLyB3ZSBkZWZhdWx0IHRoZSBwb3NpdGlvbiB0byBib3R0b20gcmlnaHQuIFJlbW92ZSB0aGlzIGRlZmF1bHQgYWZ0ZXJ3YXJkcy5cbiAgICAgIGlmICghdGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoU1RJQ0tZX0FEX1BST1ApKSB7XG4gICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ2FtcC1hZCBzdGlja3kgaXMgZGVwcmVjYXRpbmcgZW1wdHkgYXR0cmlidXRlIHZhbHVlLCBwbGVhc2UgdXNlIDxhbXAtYWQgc3RpY2t5PVwiYm90dG9tXCIgaW5zdGVhZCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGlja3lBZFBvc2l0aW9uXyA9XG4gICAgICAgIHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKFNUSUNLWV9BRF9QUk9QKSB8fFxuICAgICAgICBTdGlja3lBZFBvc2l0aW9ucy5CT1RUT01fUklHSFQ7XG4gICAgICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZShTVElDS1lfQURfUFJPUCwgdGhpcy5zdGlja3lBZFBvc2l0aW9uXyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgY2xvc2UgYnV0dG9uIGhhcyBiZWVuIHJlbmRlcmVkIGZvciBhIHN0aWNreSBhZCB1bml0LlxuICAgICAqL1xuICAgIHRoaXMuY2xvc2VCdXR0b25SZW5kZXJlZF8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEZvciB0b3Agc3RpY2t5IGFkcywgd2UgY2xvc2UgdGhlIGFkcyB3aGVuIHNjcm9sbGVkIHRvIHRoZSB0b3AuXG4gICAgICogQHByaXZhdGUgeyFGdW5jdGlvbn1cbiAgICAgKi9cbiAgICB0aGlzLnRvcFN0aWNreUFkU2Nyb2xsTGlzdGVuZXJfID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogRm9yIHRvcCBzdGlja3kgYWRzLCB3ZSB3YWl0ZWQgdW50aWwgc2Nyb2xsaW5nIGRvd24gYmVmb3JlIGFjdGl2YXRpbmdcbiAgICAgKiB0aGUgY2xvc2luZyBhZHMgbGlzdGVuZXIuXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy50b3BTdGlja3lBZENsb3NlckFjaXR2ZV8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFVubGlzdGVuZXJzIHRvIGJlIHVuc3Vic2NyaWJlZCBhZnRlciBkZXN0cm95aW5nLlxuICAgICAqIEBwcml2YXRlIHshQXJyYXk8IUZ1bmN0aW9uPn1cbiAgICAgKi9cbiAgICB0aGlzLnVubGlzdGVuZXJzXyA9IFtdO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudF8uaGFzQXR0cmlidXRlKCdkYXRhLWFkLWNvbnRhaW5lci1pZCcpKSB7XG4gICAgICBjb25zdCBpZCA9IHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCdkYXRhLWFkLWNvbnRhaW5lci1pZCcpO1xuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5kb2NfLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgIGlmIChcbiAgICAgICAgY29udGFpbmVyICYmXG4gICAgICAgIGNvbnRhaW5lci50YWdOYW1lID09ICdBTVAtTEFZT1VUJyAmJlxuICAgICAgICBjb250YWluZXIuY29udGFpbnModGhpcy5lbGVtZW50XylcbiAgICAgICkge1xuICAgICAgICAvLyBQYXJlbnQgPGFtcC1sYXlvdXQ+IGNvbXBvbmVudCB3aXRoIHJlZmVyZW5jZSBpZCBjYW4gc2VydmUgYXMgdGhlXG4gICAgICAgIC8vIGFkIGNvbnRhaW5lclxuICAgICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnRfID0gY29udGFpbmVyO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghYmFzZUluc3RhbmNlLmdldEZhbGxiYWNrKCkpIHtcbiAgICAgIGNvbnN0IGZhbGxiYWNrID0gdGhpcy5hZGREZWZhdWx0VWlDb21wb25lbnRfKCdmYWxsYmFjaycpO1xuICAgICAgaWYgKGZhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuYmFzZUluc3RhbmNlXy5lbGVtZW50LmFwcGVuZENoaWxkKGZhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgVUkgZm9yIGxhaWQgb3V0IGFkIHdpdGggbm8tY29udGVudFxuICAgKiBPcmRlcjogdHJ5IGNvbGxhcHNlIC0+IGFwcGx5IHByb3ZpZGVkIGZhbGxiYWNrIC0+IGFwcGx5IGRlZmF1bHQgZmFsbGJhY2tcbiAgICovXG4gIGFwcGx5Tm9Db250ZW50VUkoKSB7XG4gICAgaWYgKGdldEFkQ29udGFpbmVyKHRoaXMuZWxlbWVudF8pID09PSAnQU1QLVNUSUNLWS1BRCcpIHtcbiAgICAgIC8vIFNwZWNpYWwgY2FzZTogZm9yY2UgY29sbGFwc2Ugc3RpY2t5LWFkIGlmIG5vIGNvbnRlbnQuXG4gICAgICB0aGlzLmJhc2VJbnN0YW5jZV8uLypPSyovIGNvbGxhcHNlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGdldEFkQ29udGFpbmVyKHRoaXMuZWxlbWVudF8pID09PSAnQU1QLUZYLUZMWUlORy1DQVJQRVQnKSB7XG4gICAgICAvKipcbiAgICAgICAqIFNwZWNpYWwgY2FzZTogRm9yY2UgY29sbGFwc2UgdGhlIGFkIGlmIGl0IGlzIHRoZSxcbiAgICAgICAqIG9ubHkgYW5kIGRpcmVjdCBjaGlsZCBvZiBhIGZseWluZyBjYXJwZXQuXG4gICAgICAgKiBBbHNvLCB0aGlzIHdpbGwgbm90IGhhbmRsZVxuICAgICAgICogdGhlIGFtcC1sYXlvdXQgY2FzZSBmb3Igbm93LCBhcyBpdCBjb3VsZCBiZVxuICAgICAgICogaW5lZmZpY2llbnQuIEFuZCB3ZSBoYXZlIG5vdCBzZWVuIGFuIGFtcC1sYXlvdXRcbiAgICAgICAqIHVzZWQgd2l0aCBmbHlpbmcgY2FycGV0IGFuZCBhZHMgeWV0LlxuICAgICAgICovXG5cbiAgICAgIGNvbnN0IGZseWluZ0NhcnBldEVsZW1lbnRzID0gYW5jZXN0b3JFbGVtZW50c0J5VGFnKFxuICAgICAgICB0aGlzLmVsZW1lbnRfLFxuICAgICAgICAnYW1wLWZ4LWZseWluZy1jYXJwZXQnXG4gICAgICApO1xuICAgICAgY29uc3QgZmx5aW5nQ2FycGV0RWxlbWVudCA9IGZseWluZ0NhcnBldEVsZW1lbnRzWzBdO1xuXG4gICAgICBmbHlpbmdDYXJwZXRFbGVtZW50LmdldEltcGwoKS50aGVuKChpbXBsZW1lbnRhdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGltcGxlbWVudGF0aW9uLmdldENoaWxkcmVuKCk7XG5cbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBjaGlsZHJlblswXSA9PT0gdGhpcy5lbGVtZW50Xykge1xuICAgICAgICAgIHRoaXMuYmFzZUluc3RhbmNlXy4vKk9LKi8gY29sbGFwc2UoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGF0dGVtcHRDb2xsYXBzZVByb21pc2U7XG4gICAgaWYgKHRoaXMuY29udGFpbmVyRWxlbWVudF8pIHtcbiAgICAgIC8vIENvbGxhcHNlIHRoZSBjb250YWluZXIgZWxlbWVudCBpZiB0aGVyZSdzIG9uZVxuICAgICAgYXR0ZW1wdENvbGxhcHNlUHJvbWlzZSA9IFNlcnZpY2VzLm11dGF0b3JGb3JEb2MoXG4gICAgICAgIHRoaXMuZWxlbWVudF8uZ2V0QW1wRG9jKClcbiAgICAgICkuYXR0ZW1wdENvbGxhcHNlKHRoaXMuY29udGFpbmVyRWxlbWVudF8pO1xuICAgICAgYXR0ZW1wdENvbGxhcHNlUHJvbWlzZS50aGVuKCgpID0+IHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXR0ZW1wdENvbGxhcHNlUHJvbWlzZSA9IHRoaXMuYmFzZUluc3RhbmNlXy5hdHRlbXB0Q29sbGFwc2UoKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgb3JkZXIgaGVyZSBpcyBjb2xsYXBzZSA+IHVzZXIgcHJvdmlkZWQgZmFsbGJhY2sgPiBkZWZhdWx0IGZhbGxiYWNrXG4gICAgYXR0ZW1wdENvbGxhcHNlUHJvbWlzZS5jYXRjaCgoKSA9PiB7XG4gICAgICB0aGlzLmJhc2VJbnN0YW5jZV8ubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYmFzZUluc3RhbmNlXy50b2dnbGVQbGFjZWhvbGRlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuYmFzZUluc3RhbmNlXy50b2dnbGVGYWxsYmFjayh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IFVJIGZvciB1bmxhaWQgb3V0IGFkOiBIaWRlIGZhbGxiYWNrLlxuICAgKiBOb3RlOiBObyBuZWVkIHRvIHRvZ2dsZVBsYWNlaG9sZGVyIGhlcmUsIHVubGF5b3V0IHNob3cgaXQgYnkgZGVmYXVsdC5cbiAgICovXG4gIGFwcGx5VW5sYXlvdXRVSSgpIHtcbiAgICB0aGlzLmJhc2VJbnN0YW5jZV8ubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmJhc2VJbnN0YW5jZV8udG9nZ2xlRmFsbGJhY2soZmFsc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkRGVmYXVsdFVpQ29tcG9uZW50XyhuYW1lKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8udGFnTmFtZSA9PSAnQU1QLUVNQkVEJykge1xuICAgICAgLy8gRG8gbm90aGluZyBmb3IgYW1wLWVtYmVkIGVsZW1lbnQ7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdWlDb21wb25lbnQgPSB0aGlzLmRvY18uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdWlDb21wb25lbnQuc2V0QXR0cmlidXRlKG5hbWUsICcnKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmRvY18uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtYWQtZGVmYXVsdC1ob2xkZXInKTtcblxuICAgIC8vIFRPRE8oYWdoYXNzZW1pLCAjNDE0NikgaTE4blxuICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdkYXRhLWFkLWhvbGRlci10ZXh0JywgJ0FkJyk7XG4gICAgdWlDb21wb25lbnQuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICByZXR1cm4gdWlDb21wb25lbnQ7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZ5IHRoYXQgdGhlIGxpbWl0cyBmb3Igc3RpY2t5IGFkcyBhcmUgbm90IGV4Y2VlZGVkXG4gICAqL1xuICB2YWxpZGF0ZVN0aWNreUFkKCkge1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICB0aGlzLmRvY18ucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgJ2FtcC1zdGlja3ktYWQuaS1hbXBodG1sLWJ1aWx0LCBhbXAtYWRbc3RpY2t5XS5pLWFtcGh0bWwtYnVpbHQnXG4gICAgICApLmxlbmd0aCA8PSAxLFxuICAgICAgJ0F0IG1vc3Qgb25lIHN0aWNreSBhZCBjYW4gYmUgbG9hZGVkIHBlciBwYWdlJ1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU3RpY2t5QWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RpY2t5QWRQb3NpdGlvbl8gIT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBzdGlja3kgYWQgcmVsYXRlZCBmZWF0dXJlc1xuICAgKi9cbiAgbWF5YmVJbml0U3RpY2t5QWQoKSB7XG4gICAgaWYgKHRoaXMuaXNTdGlja3lBZCgpKSB7XG4gICAgICBzZXRTdHlsZSh0aGlzLmVsZW1lbnRfLCAndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG5cbiAgICAgIGlmICh0aGlzLnN0aWNreUFkUG9zaXRpb25fID09IFN0aWNreUFkUG9zaXRpb25zLlRPUCkge1xuICAgICAgICAvLyBMZXQgdGhlIHRvcCBzdGlja3kgYWQgYmUgYmVsb3cgdGhlIHZpZXdlciB0b3AuXG4gICAgICAgIGNvbnN0IHBhZGRpbmdUb3AgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyhcbiAgICAgICAgICB0aGlzLmVsZW1lbnRfLmdldEFtcERvYygpXG4gICAgICAgICkuZ2V0UGFkZGluZ1RvcCgpO1xuICAgICAgICBzZXRTdHlsZSh0aGlzLmVsZW1lbnRfLCAndG9wJywgYCR7cGFkZGluZ1RvcH1weGApO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zdGlja3lBZFBvc2l0aW9uXyA9PSBTdGlja3lBZFBvc2l0aW9ucy5CT1RUT00pIHtcbiAgICAgICAgY29uc3QgcGFkZGluZ0JhciA9IHRoaXMuZG9jXy5jcmVhdGVFbGVtZW50KCdhbXAtYWQtc3RpY2t5LXBhZGRpbmcnKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgcGFkZGluZ0JhcixcbiAgICAgICAgICBkZXZBc3NlcnQoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmZpcnN0Q2hpbGQsXG4gICAgICAgICAgICAnYW1wLWFkIHNob3VsZCBoYXZlIGJlZW4gZXhwYW5kZWQuJ1xuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmNsb3NlQnV0dG9uUmVuZGVyZWRfKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xvc2VCdXR0b25fKCk7XG4gICAgICAgIHRoaXMuY2xvc2VCdXR0b25SZW5kZXJlZF8gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGwgcHJvbWlzZSBmb3Igc3RpY2t5IGFkXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICBnZXRTY3JvbGxQcm9taXNlRm9yU3RpY2t5QWQoKSB7XG4gICAgaWYgKHRoaXMuaXNTdGlja3lBZCgpKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyhcbiAgICAgICAgICB0aGlzLmVsZW1lbnRfLmdldEFtcERvYygpXG4gICAgICAgICkub25TY3JvbGwoKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gYSBzdGlja3kgYWQgaXMgc2hvd24sIHRoZSBjbG9zZSBidXR0b24gc2hvdWxkIGJlIHJlbmRlcmVkIGF0IHRoZSBzYW1lIHRpbWUuXG4gICAqL1xuICBvblJlc2l6ZVN1Y2Nlc3MoKSB7XG4gICAgaWYgKHRoaXMuaXNTdGlja3lBZCgpICYmICF0aGlzLnRvcFN0aWNreUFkU2Nyb2xsTGlzdGVuZXJfKSB7XG4gICAgICBjb25zdCBkb2MgPSB0aGlzLmVsZW1lbnRfLmdldEFtcERvYygpO1xuICAgICAgdGhpcy50b3BTdGlja3lBZFNjcm9sbExpc3RlbmVyXyA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKGRvYykub25TY3JvbGwoXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBjb25zdCBzY3JvbGxQb3MgPSBkb2Mud2luLi8qT0sqLyBzY3JvbGxZO1xuICAgICAgICAgIGlmIChzY3JvbGxQb3MgPiBUT1BfU1RJQ0tZX0FEX1RSSUdHRVJfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICB0aGlzLnRvcFN0aWNreUFkQ2xvc2VyQWNpdHZlXyA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gV2hlbiB0aGUgc2Nyb2xsIHBvc2l0aW9uIGlzIGNsb3NlIHRvIHRoZSB0b3AsIHdlIGNsb3NlIHRoZVxuICAgICAgICAgIC8vIHRvcCBzdGlja3kgYWQgaW4gb3JkZXIgbm90IHRvIGhhdmUgdGhlIGFkcyBvdmVybGFwIHRoZVxuICAgICAgICAgIC8vIGNvbnRlbnQuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy50b3BTdGlja3lBZENsb3NlckFjaXR2ZV8gJiZcbiAgICAgICAgICAgIHNjcm9sbFBvcyA8IFRPUF9TVElDS1lfQURfQ0xPU0VfVEhSRVNIT0xEXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlU3RpY2t5QWRfKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgdGhpcy51bmxpc3RlbmVyc18ucHVzaCh0aGlzLnRvcFN0aWNreUFkU2Nyb2xsTGlzdGVuZXJfKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgdGhlIHN0aWNreSBhZFxuICAgKi9cbiAgY2xvc2VTdGlja3lBZF8oKSB7XG4gICAgU2VydmljZXMudnN5bmNGb3IodGhpcy5iYXNlSW5zdGFuY2VfLndpbikubXV0YXRlKCgpID0+IHtcbiAgICAgIGNvbnN0IHZpZXdwb3J0ID0gU2VydmljZXMudmlld3BvcnRGb3JEb2ModGhpcy5lbGVtZW50Xy5nZXRBbXBEb2MoKSk7XG4gICAgICB2aWV3cG9ydC5yZW1vdmVGcm9tRml4ZWRMYXllcih0aGlzLmVsZW1lbnQpO1xuICAgICAgcmVtb3ZlRWxlbWVudCh0aGlzLmVsZW1lbnRfKTtcbiAgICAgIHZpZXdwb3J0LnVwZGF0ZVBhZGRpbmdCb3R0b20oMCk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy50b3BTdGlja3lBZFNjcm9sbExpc3RlbmVyXykge1xuICAgICAgdGhpcy50b3BTdGlja3lBZFNjcm9sbExpc3RlbmVyXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZnVuY3Rpb24gdGhhdCBhZGQgYSBjbG9zZSBidXR0b24gdG8gc3RpY2t5IGFkXG4gICAqL1xuICBhZGRDbG9zZUJ1dHRvbl8oKSB7XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMoXG4gICAgICAvKiogQHR5cGUgeyFEb2N1bWVudH0gKi8gKHRoaXMuZWxlbWVudF8ub3duZXJEb2N1bWVudCksXG4gICAgICAnYnV0dG9uJyxcbiAgICAgIGRpY3Qoe1xuICAgICAgICAnYXJpYS1sYWJlbCc6XG4gICAgICAgICAgdGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2xvc2UtYnV0dG9uLWFyaWEtbGFiZWwnKSB8fFxuICAgICAgICAgICdDbG9zZSB0aGlzIGFkJyxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHRoaXMudW5saXN0ZW5lcnNfLnB1c2goXG4gICAgICBsaXN0ZW4oY2xvc2VCdXR0b24sICdjbGljaycsIHRoaXMuY2xvc2VTdGlja3lBZF8uYmluZCh0aGlzKSlcbiAgICApO1xuXG4gICAgY2xvc2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnYW1wLWFkLWNsb3NlLWJ1dHRvbicpO1xuICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ3x1bmRlZmluZWR9IGhlaWdodFxuICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd8dW5kZWZpbmVkfSB3aWR0aFxuICAgKiBAcGFyYW0ge251bWJlcn0gaWZyYW1lSGVpZ2h0XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpZnJhbWVXaWR0aFxuICAgKiBAcGFyYW0geyFNZXNzYWdlRXZlbnR9IGV2ZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFPYmplY3Q+fVxuICAgKi9cbiAgdXBkYXRlU2l6ZShoZWlnaHQsIHdpZHRoLCBpZnJhbWVIZWlnaHQsIGlmcmFtZVdpZHRoLCBldmVudCkge1xuICAgIC8vIENhbGN1bGF0ZSBuZXcgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgY29udGFpbmVyIHRvIGluY2x1ZGUgdGhlIHBhZGRpbmcuXG4gICAgLy8gSWYgcGFkZGluZyBpcyBuZWdhdGl2ZSwganVzdCB1c2UgdGhlIHJlcXVlc3RlZCB3aWR0aCBhbmQgaGVpZ2h0IGRpcmVjdGx5LlxuICAgIGxldCBuZXdIZWlnaHQsIG5ld1dpZHRoO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCwgMTApO1xuICAgIGlmICghaXNOYU4oaGVpZ2h0KSkge1xuICAgICAgbmV3SGVpZ2h0ID0gTWF0aC5tYXgoXG4gICAgICAgIHRoaXMuZWxlbWVudF8uLypPSyovIG9mZnNldEhlaWdodCArIGhlaWdodCAtIGlmcmFtZUhlaWdodCxcbiAgICAgICAgaGVpZ2h0XG4gICAgICApO1xuICAgIH1cbiAgICB3aWR0aCA9IHBhcnNlSW50KHdpZHRoLCAxMCk7XG4gICAgaWYgKCFpc05hTih3aWR0aCkpIHtcbiAgICAgIG5ld1dpZHRoID0gTWF0aC5tYXgoXG4gICAgICAgIHRoaXMuZWxlbWVudF8uLypPSyovIG9mZnNldFdpZHRoICsgd2lkdGggLSBpZnJhbWVXaWR0aCxcbiAgICAgICAgd2lkdGhcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqIEB0eXBlIHshT2JqZWN0PGJvb2xlYW4sIG51bWJlcnx1bmRlZmluZWQsIG51bWJlcnx1bmRlZmluZWQ+fSAqL1xuICAgIGNvbnN0IHJlc2l6ZUluZm8gPSB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgbmV3V2lkdGgsXG4gICAgICBuZXdIZWlnaHQsXG4gICAgfTtcblxuICAgIGlmICghbmV3SGVpZ2h0ICYmICFuZXdXaWR0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcigndW5kZWZpbmVkIHdpZHRoIGFuZCBoZWlnaHQnKSk7XG4gICAgfVxuXG4gICAgaWYgKGdldEFkQ29udGFpbmVyKHRoaXMuZWxlbWVudF8pID09ICdBTVAtU1RJQ0tZLUFEJykge1xuICAgICAgLy8gU3BlY2lhbCBjYXNlOiBmb3JjZSBjb2xsYXBzZSBzdGlja3ktYWQgaWYgbm8gY29udGVudC5cbiAgICAgIHJlc2l6ZUluZm8uc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNpemVJbmZvKTtcbiAgICB9XG5cbiAgICAvLyBTcGVjaWFsIGNhc2U6IGZvciBzdGlja3kgYWRzLCB3ZSBlbmZvcmNlIDIwJSBzaXplIGxpbWl0IGFuZCA1MCUgaGVpZ2h0IGxpbWl0XG4gICAgaWYgKHRoaXMuaXNTdGlja3lBZCgpKSB7XG4gICAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuYmFzZUluc3RhbmNlXy5nZXRWaWV3cG9ydCgpO1xuICAgICAgaWYgKFxuICAgICAgICBoZWlnaHQgKiB3aWR0aCA+XG4gICAgICAgICAgU1RJQ0tZX0FEX01BWF9TSVpFX0xJTUlUICpcbiAgICAgICAgICAgIHZpZXdwb3J0LmdldEhlaWdodCgpICpcbiAgICAgICAgICAgIHZpZXdwb3J0LmdldFdpZHRoKCkgfHxcbiAgICAgICAgbmV3SGVpZ2h0ID4gU1RJQ0tZX0FEX01BWF9IRUlHSFRfTElNSVQgKiB2aWV3cG9ydC5nZXRIZWlnaHQoKVxuICAgICAgKSB7XG4gICAgICAgIHJlc2l6ZUluZm8uc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc2l6ZUluZm8pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iYXNlSW5zdGFuY2VfXG4gICAgICAuYXR0ZW1wdENoYW5nZVNpemUobmV3SGVpZ2h0LCBuZXdXaWR0aCwgZXZlbnQpXG4gICAgICAudGhlbihcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0U2l6ZV8odGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCdpZnJhbWUnKSwgaGVpZ2h0LCB3aWR0aCk7XG4gICAgICAgICAgcmV0dXJuIHJlc2l6ZUluZm87XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICByZXNpemVJbmZvLnN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gcmVzaXplSW5mbztcbiAgICAgICAgfVxuICAgICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZSBzZXQgdGhlIGRpbWVuc2lvbnMgZm9yIGFuIGVsZW1lbnRcbiAgICogQHBhcmFtIHtBbnl9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld0hlaWdodFxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3V2lkdGhcbiAgICovXG4gIHNldFNpemVfKGVsZW1lbnQsIG5ld0hlaWdodCwgbmV3V2lkdGgpIHtcbiAgICBzZXRTdHlsZXMoZWxlbWVudCwge1xuICAgICAgJ2hlaWdodCc6IGAke25ld0hlaWdodH1weGAsXG4gICAgICAnd2lkdGgnOiBgJHtuZXdXaWR0aH1weGAsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGxpc3RlbmVyc1xuICAgKi9cbiAgY2xlYW51cCgpIHtcbiAgICB0aGlzLnVubGlzdGVuZXJzXy5mb3JFYWNoKCh1bmxpc3RlbmVyKSA9PiB1bmxpc3RlbmVyKCkpO1xuICAgIHRoaXMudW5saXN0ZW5lcnNfLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuLy8gTWFrZSB0aGUgY2xhc3MgYXZhaWxhYmxlIHRvIG90aGVyIGxhdGUgbG9hZGVkIGFtcC1hZCBpbXBsZW1lbnRhdGlvbnNcbi8vIHdpdGhvdXQgdGhlbSBoYXZpbmcgdG8gZGVwZW5kIG9uIGl0IGRpcmVjdGx5LlxuQU1QLkFtcEFkVUlIYW5kbGVyID0gQW1wQWRVSUhhbmRsZXI7XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-ad/0.1/amp-ad-ui.js