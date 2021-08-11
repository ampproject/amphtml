function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { scopedQuerySelectorAll } from "../../../src/core/dom/query";
import { setImportantStyles } from "../../../src/core/dom/style";
import { user } from "../../../src/log";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";

/** @const {number} */
var CANVAS_SIZE = 3;

/** @const {number} */
var DURATION_MS = 400;

/** @const {string} */
var CLASS_NAME = 'BACKGROUND-BLUR';

/**
 * readyState for first rendrable frame of video element.
 * @const {number}
 */
var HAVE_CURRENT_DATA = 2;
export var BackgroundBlur = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  function BackgroundBlur(win, element) {
    _classCallCheck(this, BackgroundBlur);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private @const {!Element} */
    this.canvas_ = null;

    /** @private @const {Element} */
    this.offscreenCanvas_ = this.win_.document.createElement('canvas');
    this.offscreenCanvas_.width = this.offscreenCanvas_.height = CANVAS_SIZE;

    /**  @private {?number} */
    this.currentRAF_ = null;

    /**  @private {?boolean} */
    this.firstLoad_ = true;
  }

  /**
   * Setup canvas and attach it to the document.
   */
  _createClass(BackgroundBlur, [{
    key: "attach",
    value: function attach() {
      this.canvas_ = this.win_.document.createElement('canvas');
      this.canvas_.width = this.canvas_.height = CANVAS_SIZE;
      setImportantStyles(this.canvas_, {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0
      });
      this.element_.appendChild(this.canvas_);
    }
    /**
     * Remove canvas from the document and cancel the RAF.
     */

  }, {
    key: "detach",
    value: function detach() {
      this.element_.removeChild(this.canvas_);
      cancelAnimationFrame(this.currentRAF_);
    }
    /**
     * Update the background to the specified page's background.
     * @param {!Element} pageElement
     */

  }, {
    key: "update",
    value: function update(pageElement) {
      var _this = this;

      var mediaEl = this.getBiggestMediaEl_(pageElement);

      if (!mediaEl) {
        user().info(CLASS_NAME, 'No amp-img or amp-video found.');
        this.animate_();
        return;
      }

      // Ensure element is loaded before calling animate.
      whenUpgradedToCustomElement(mediaEl).then(function () {
        return mediaEl.signals().whenSignal(CommonSignals.LOAD_END);
      }).then(function () {
        // If image, render it.
        if (mediaEl.tagName === 'AMP-IMG') {
          _this.animate_(mediaEl.querySelector('img'));

          return;
        }

        // If video, render first frame or poster image.
        var innerVideoEl = mediaEl.querySelector('video');
        var alreadyHasData = innerVideoEl.readyState >= HAVE_CURRENT_DATA;

        if (alreadyHasData) {
          _this.animate_(innerVideoEl);

          return;
        }

        // If video doesnt have data, render from the poster image.
        var posterSrc = mediaEl.getAttribute('poster');

        if (!posterSrc) {
          _this.animate_();

          user().info(CLASS_NAME, 'No "poster" attribute on amp-video.');
          return;
        }

        var img = new Image();

        img.onload = function () {
          return _this.animate_(img);
        };

        img.src = posterSrc;
      }, function () {
        user().error(CLASS_NAME, 'Failed to load the amp-img or amp-video.');
      });
    }
    /**
     * Animated background transition.
     * @private
     * @param {?Element} fillElement
     */

  }, {
    key: "animate_",
    value: function animate_(fillElement) {
      var _this2 = this;

      this.drawOffscreenCanvas_(fillElement);

      // Do not animate on first load.
      if (this.firstLoad_) {
        this.drawCanvas_(1
        /** easing **/
        );
        this.firstLoad_ = false;
        return;
      }

      // Animation loop for fade.
      var startTime;

      var nextFrame = function nextFrame(currTime) {
        if (!startTime) {
          startTime = currTime;
        }

        var elapsed = currTime - startTime;

        if (elapsed < DURATION_MS) {
          var easing = elapsed / DURATION_MS;

          _this2.drawCanvas_(easing);

          _this2.currentRAF_ = requestAnimationFrame(nextFrame);
        }
      };

      // Cancels the previous animation loop before starting a new one.
      cancelAnimationFrame(this.currentRAF_);
      this.currentRAF_ = requestAnimationFrame(nextFrame);
    }
    /**
     * Draws to the canvas with opacity.
     * @private
     * @param {number} alphaPercentage
     */

  }, {
    key: "drawCanvas_",
    value: function drawCanvas_(alphaPercentage) {
      var context = this.canvas_.getContext('2d');
      context.globalAlpha = alphaPercentage;
      context.drawImage(this.offscreenCanvas_, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    /**
     * Composes the image offscreen at 100% opacity, then uses it for fading in.
     * If these draw calls are done with opacity, a flash would be visible.
     * This is due to the black fill being a high contrast compared to the image.
     * The black fill is always needed in case the image is a transparent png.
     * @private
     * @param {?Element} fillElement
     */

  }, {
    key: "drawOffscreenCanvas_",
    value: function drawOffscreenCanvas_(fillElement) {
      var context = this.offscreenCanvas_.getContext('2d');
      // A black background in drawn first in case the image is a transparent PNG.
      context.fillStyle = 'black';
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      if (fillElement) {
        context.drawImage(fillElement, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        // For background protection.
        context.fillStyle = 'rgba(0, 0, 0, .3)';
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
    }
    /**
     * Get active page's biggest amp-img or amp-video element.
     * @private
     * @param {!Element} pageElement
     * @return {?Element} An amp-img, amp-video or null.
     */

  }, {
    key: "getBiggestMediaEl_",
    value: function getBiggestMediaEl_(pageElement) {
      var getSize = function getSize(el) {
        if (!el) {
          return false;
        }

        var layoutBox = el.getLayoutBox();
        return layoutBox.width * layoutBox.height;
      };

      return Array.from(scopedQuerySelectorAll(pageElement, 'amp-story-grid-layer amp-img, amp-story-grid-layer amp-video')).sort(function (firstEl, secondEl) {
        return getSize(secondEl) - getSize(firstEl);
      })[0];
    }
  }]);

  return BackgroundBlur;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhY2tncm91bmQtYmx1ci5qcyJdLCJuYW1lcyI6WyJDb21tb25TaWduYWxzIiwic2NvcGVkUXVlcnlTZWxlY3RvckFsbCIsInNldEltcG9ydGFudFN0eWxlcyIsInVzZXIiLCJ3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnQiLCJDQU5WQVNfU0laRSIsIkRVUkFUSU9OX01TIiwiQ0xBU1NfTkFNRSIsIkhBVkVfQ1VSUkVOVF9EQVRBIiwiQmFja2dyb3VuZEJsdXIiLCJ3aW4iLCJlbGVtZW50Iiwid2luXyIsImVsZW1lbnRfIiwiY2FudmFzXyIsIm9mZnNjcmVlbkNhbnZhc18iLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ3aWR0aCIsImhlaWdodCIsImN1cnJlbnRSQUZfIiwiZmlyc3RMb2FkXyIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsImFwcGVuZENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsInBhZ2VFbGVtZW50IiwibWVkaWFFbCIsImdldEJpZ2dlc3RNZWRpYUVsXyIsImluZm8iLCJhbmltYXRlXyIsInRoZW4iLCJzaWduYWxzIiwid2hlblNpZ25hbCIsIkxPQURfRU5EIiwidGFnTmFtZSIsInF1ZXJ5U2VsZWN0b3IiLCJpbm5lclZpZGVvRWwiLCJhbHJlYWR5SGFzRGF0YSIsInJlYWR5U3RhdGUiLCJwb3N0ZXJTcmMiLCJnZXRBdHRyaWJ1dGUiLCJpbWciLCJJbWFnZSIsIm9ubG9hZCIsInNyYyIsImVycm9yIiwiZmlsbEVsZW1lbnQiLCJkcmF3T2Zmc2NyZWVuQ2FudmFzXyIsImRyYXdDYW52YXNfIiwic3RhcnRUaW1lIiwibmV4dEZyYW1lIiwiY3VyclRpbWUiLCJlbGFwc2VkIiwiZWFzaW5nIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiYWxwaGFQZXJjZW50YWdlIiwiY29udGV4dCIsImdldENvbnRleHQiLCJnbG9iYWxBbHBoYSIsImRyYXdJbWFnZSIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwiZ2V0U2l6ZSIsImVsIiwibGF5b3V0Qm94IiwiZ2V0TGF5b3V0Qm94IiwiQXJyYXkiLCJmcm9tIiwic29ydCIsImZpcnN0RWwiLCJzZWNvbmRFbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsYUFBUjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsMkJBQVI7O0FBRUE7QUFDQSxJQUFNQyxXQUFXLEdBQUcsQ0FBcEI7O0FBRUE7QUFDQSxJQUFNQyxXQUFXLEdBQUcsR0FBcEI7O0FBRUE7QUFDQSxJQUFNQyxVQUFVLEdBQUcsaUJBQW5COztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsaUJBQWlCLEdBQUcsQ0FBMUI7QUFFQSxXQUFhQyxjQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDRSwwQkFBWUMsR0FBWixFQUFpQkMsT0FBakIsRUFBMEI7QUFBQTs7QUFDeEI7QUFDQSxTQUFLQyxJQUFMLEdBQVlGLEdBQVo7O0FBRUE7QUFDQSxTQUFLRyxRQUFMLEdBQWdCRixPQUFoQjs7QUFFQTtBQUNBLFNBQUtHLE9BQUwsR0FBZSxJQUFmOztBQUVBO0FBQ0EsU0FBS0MsZ0JBQUwsR0FBd0IsS0FBS0gsSUFBTCxDQUFVSSxRQUFWLENBQW1CQyxhQUFuQixDQUFpQyxRQUFqQyxDQUF4QjtBQUNBLFNBQUtGLGdCQUFMLENBQXNCRyxLQUF0QixHQUE4QixLQUFLSCxnQkFBTCxDQUFzQkksTUFBdEIsR0FBK0JkLFdBQTdEOztBQUVBO0FBQ0EsU0FBS2UsV0FBTCxHQUFtQixJQUFuQjs7QUFFQTtBQUNBLFNBQUtDLFVBQUwsR0FBa0IsSUFBbEI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUE1QkE7QUFBQTtBQUFBLFdBNkJFLGtCQUFTO0FBQ1AsV0FBS1AsT0FBTCxHQUFlLEtBQUtGLElBQUwsQ0FBVUks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RDtBQXJMSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7Q29tbW9uU2lnbmFsc30gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2NvbW1vbi1zaWduYWxzJztcbmltcG9ydCB7c2NvcGVkUXVlcnlTZWxlY3RvckFsbH0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7c2V0SW1wb3J0YW50U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHt1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7d2hlblVwZ3JhZGVkVG9DdXN0b21FbGVtZW50fSBmcm9tICcuLi8uLi8uLi9zcmMvYW1wLWVsZW1lbnQtaGVscGVycyc7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IENBTlZBU19TSVpFID0gMztcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgRFVSQVRJT05fTVMgPSA0MDA7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IENMQVNTX05BTUUgPSAnQkFDS0dST1VORC1CTFVSJztcblxuLyoqXG4gKiByZWFkeVN0YXRlIGZvciBmaXJzdCByZW5kcmFibGUgZnJhbWUgb2YgdmlkZW8gZWxlbWVudC5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICovXG5jb25zdCBIQVZFX0NVUlJFTlRfREFUQSA9IDI7XG5cbmV4cG9ydCBjbGFzcyBCYWNrZ3JvdW5kQmx1ciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIGVsZW1lbnQpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFFbGVtZW50fSAqL1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5jYW52YXNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge0VsZW1lbnR9ICovXG4gICAgdGhpcy5vZmZzY3JlZW5DYW52YXNfID0gdGhpcy53aW5fLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMub2Zmc2NyZWVuQ2FudmFzXy53aWR0aCA9IHRoaXMub2Zmc2NyZWVuQ2FudmFzXy5oZWlnaHQgPSBDQU5WQVNfU0laRTtcblxuICAgIC8qKiAgQHByaXZhdGUgez9udW1iZXJ9ICovXG4gICAgdGhpcy5jdXJyZW50UkFGXyA9IG51bGw7XG5cbiAgICAvKiogIEBwcml2YXRlIHs/Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmZpcnN0TG9hZF8gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHVwIGNhbnZhcyBhbmQgYXR0YWNoIGl0IHRvIHRoZSBkb2N1bWVudC5cbiAgICovXG4gIGF0dGFjaCgpIHtcbiAgICB0aGlzLmNhbnZhc18gPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy5jYW52YXNfLndpZHRoID0gdGhpcy5jYW52YXNfLmhlaWdodCA9IENBTlZBU19TSVpFO1xuICAgIHNldEltcG9ydGFudFN0eWxlcyh0aGlzLmNhbnZhc18sIHtcbiAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgbGVmdDogMCxcbiAgICAgIHRvcDogMCxcbiAgICB9KTtcbiAgICB0aGlzLmVsZW1lbnRfLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzXyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGNhbnZhcyBmcm9tIHRoZSBkb2N1bWVudCBhbmQgY2FuY2VsIHRoZSBSQUYuXG4gICAqL1xuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGVtZW50Xy5yZW1vdmVDaGlsZCh0aGlzLmNhbnZhc18pO1xuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuY3VycmVudFJBRl8pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYmFja2dyb3VuZCB0byB0aGUgc3BlY2lmaWVkIHBhZ2UncyBiYWNrZ3JvdW5kLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYWdlRWxlbWVudFxuICAgKi9cbiAgdXBkYXRlKHBhZ2VFbGVtZW50KSB7XG4gICAgY29uc3QgbWVkaWFFbCA9IHRoaXMuZ2V0QmlnZ2VzdE1lZGlhRWxfKHBhZ2VFbGVtZW50KTtcbiAgICBpZiAoIW1lZGlhRWwpIHtcbiAgICAgIHVzZXIoKS5pbmZvKENMQVNTX05BTUUsICdObyBhbXAtaW1nIG9yIGFtcC12aWRlbyBmb3VuZC4nKTtcbiAgICAgIHRoaXMuYW5pbWF0ZV8oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgZWxlbWVudCBpcyBsb2FkZWQgYmVmb3JlIGNhbGxpbmcgYW5pbWF0ZS5cbiAgICB3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnQobWVkaWFFbClcbiAgICAgIC50aGVuKCgpID0+IG1lZGlhRWwuc2lnbmFscygpLndoZW5TaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX0VORCkpXG4gICAgICAudGhlbihcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIC8vIElmIGltYWdlLCByZW5kZXIgaXQuXG4gICAgICAgICAgaWYgKG1lZGlhRWwudGFnTmFtZSA9PT0gJ0FNUC1JTUcnKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGVfKG1lZGlhRWwucXVlcnlTZWxlY3RvcignaW1nJykpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHZpZGVvLCByZW5kZXIgZmlyc3QgZnJhbWUgb3IgcG9zdGVyIGltYWdlLlxuICAgICAgICAgIGNvbnN0IGlubmVyVmlkZW9FbCA9IG1lZGlhRWwucXVlcnlTZWxlY3RvcigndmlkZW8nKTtcbiAgICAgICAgICBjb25zdCBhbHJlYWR5SGFzRGF0YSA9IGlubmVyVmlkZW9FbC5yZWFkeVN0YXRlID49IEhBVkVfQ1VSUkVOVF9EQVRBO1xuICAgICAgICAgIGlmIChhbHJlYWR5SGFzRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlXyhpbm5lclZpZGVvRWwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiB2aWRlbyBkb2VzbnQgaGF2ZSBkYXRhLCByZW5kZXIgZnJvbSB0aGUgcG9zdGVyIGltYWdlLlxuICAgICAgICAgIGNvbnN0IHBvc3RlclNyYyA9IG1lZGlhRWwuZ2V0QXR0cmlidXRlKCdwb3N0ZXInKTtcbiAgICAgICAgICBpZiAoIXBvc3RlclNyYykge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlXygpO1xuICAgICAgICAgICAgdXNlcigpLmluZm8oQ0xBU1NfTkFNRSwgJ05vIFwicG9zdGVyXCIgYXR0cmlidXRlIG9uIGFtcC12aWRlby4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHRoaXMuYW5pbWF0ZV8oaW1nKTtcbiAgICAgICAgICBpbWcuc3JjID0gcG9zdGVyU3JjO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdXNlcigpLmVycm9yKENMQVNTX05BTUUsICdGYWlsZWQgdG8gbG9hZCB0aGUgYW1wLWltZyBvciBhbXAtdmlkZW8uJyk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQW5pbWF0ZWQgYmFja2dyb3VuZCB0cmFuc2l0aW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0gez9FbGVtZW50fSBmaWxsRWxlbWVudFxuICAgKi9cbiAgYW5pbWF0ZV8oZmlsbEVsZW1lbnQpIHtcbiAgICB0aGlzLmRyYXdPZmZzY3JlZW5DYW52YXNfKGZpbGxFbGVtZW50KTtcbiAgICAvLyBEbyBub3QgYW5pbWF0ZSBvbiBmaXJzdCBsb2FkLlxuICAgIGlmICh0aGlzLmZpcnN0TG9hZF8pIHtcbiAgICAgIHRoaXMuZHJhd0NhbnZhc18oMSAvKiogZWFzaW5nICoqLyk7XG4gICAgICB0aGlzLmZpcnN0TG9hZF8gPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBBbmltYXRpb24gbG9vcCBmb3IgZmFkZS5cbiAgICBsZXQgc3RhcnRUaW1lO1xuICAgIGNvbnN0IG5leHRGcmFtZSA9IChjdXJyVGltZSkgPT4ge1xuICAgICAgaWYgKCFzdGFydFRpbWUpIHtcbiAgICAgICAgc3RhcnRUaW1lID0gY3VyclRpbWU7XG4gICAgICB9XG4gICAgICBjb25zdCBlbGFwc2VkID0gY3VyclRpbWUgLSBzdGFydFRpbWU7XG4gICAgICBpZiAoZWxhcHNlZCA8IERVUkFUSU9OX01TKSB7XG4gICAgICAgIGNvbnN0IGVhc2luZyA9IGVsYXBzZWQgLyBEVVJBVElPTl9NUztcbiAgICAgICAgdGhpcy5kcmF3Q2FudmFzXyhlYXNpbmcpO1xuICAgICAgICB0aGlzLmN1cnJlbnRSQUZfID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG5leHRGcmFtZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICAvLyBDYW5jZWxzIHRoZSBwcmV2aW91cyBhbmltYXRpb24gbG9vcCBiZWZvcmUgc3RhcnRpbmcgYSBuZXcgb25lLlxuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuY3VycmVudFJBRl8pO1xuICAgIHRoaXMuY3VycmVudFJBRl8gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobmV4dEZyYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0byB0aGUgY2FudmFzIHdpdGggb3BhY2l0eS5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFscGhhUGVyY2VudGFnZVxuICAgKi9cbiAgZHJhd0NhbnZhc18oYWxwaGFQZXJjZW50YWdlKSB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuY2FudmFzXy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhbHBoYVBlcmNlbnRhZ2U7XG4gICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5vZmZzY3JlZW5DYW52YXNfLCAwLCAwLCBDQU5WQVNfU0laRSwgQ0FOVkFTX1NJWkUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2VzIHRoZSBpbWFnZSBvZmZzY3JlZW4gYXQgMTAwJSBvcGFjaXR5LCB0aGVuIHVzZXMgaXQgZm9yIGZhZGluZyBpbi5cbiAgICogSWYgdGhlc2UgZHJhdyBjYWxscyBhcmUgZG9uZSB3aXRoIG9wYWNpdHksIGEgZmxhc2ggd291bGQgYmUgdmlzaWJsZS5cbiAgICogVGhpcyBpcyBkdWUgdG8gdGhlIGJsYWNrIGZpbGwgYmVpbmcgYSBoaWdoIGNvbnRyYXN0IGNvbXBhcmVkIHRvIHRoZSBpbWFnZS5cbiAgICogVGhlIGJsYWNrIGZpbGwgaXMgYWx3YXlzIG5lZWRlZCBpbiBjYXNlIHRoZSBpbWFnZSBpcyBhIHRyYW5zcGFyZW50IHBuZy5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHs/RWxlbWVudH0gZmlsbEVsZW1lbnRcbiAgICovXG4gIGRyYXdPZmZzY3JlZW5DYW52YXNfKGZpbGxFbGVtZW50KSB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMub2Zmc2NyZWVuQ2FudmFzXy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIC8vIEEgYmxhY2sgYmFja2dyb3VuZCBpbiBkcmF3biBmaXJzdCBpbiBjYXNlIHRoZSBpbWFnZSBpcyBhIHRyYW5zcGFyZW50IFBORy5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBDQU5WQVNfU0laRSwgQ0FOVkFTX1NJWkUpO1xuICAgIGlmIChmaWxsRWxlbWVudCkge1xuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoZmlsbEVsZW1lbnQsIDAsIDAsIENBTlZBU19TSVpFLCBDQU5WQVNfU0laRSk7XG4gICAgICAvLyBGb3IgYmFja2dyb3VuZCBwcm90ZWN0aW9uLlxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBDQU5WQVNfU0laRSwgQ0FOVkFTX1NJWkUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWN0aXZlIHBhZ2UncyBiaWdnZXN0IGFtcC1pbWcgb3IgYW1wLXZpZGVvIGVsZW1lbnQuXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhZ2VFbGVtZW50XG4gICAqIEByZXR1cm4gez9FbGVtZW50fSBBbiBhbXAtaW1nLCBhbXAtdmlkZW8gb3IgbnVsbC5cbiAgICovXG4gIGdldEJpZ2dlc3RNZWRpYUVsXyhwYWdlRWxlbWVudCkge1xuICAgIGNvbnN0IGdldFNpemUgPSAoZWwpID0+IHtcbiAgICAgIGlmICghZWwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgY29uc3QgbGF5b3V0Qm94ID0gZWwuZ2V0TGF5b3V0Qm94KCk7XG4gICAgICByZXR1cm4gbGF5b3V0Qm94LndpZHRoICogbGF5b3V0Qm94LmhlaWdodDtcbiAgICB9O1xuICAgIHJldHVybiBBcnJheS5mcm9tKFxuICAgICAgc2NvcGVkUXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgcGFnZUVsZW1lbnQsXG4gICAgICAgICdhbXAtc3RvcnktZ3JpZC1sYXllciBhbXAtaW1nLCBhbXAtc3RvcnktZ3JpZC1sYXllciBhbXAtdmlkZW8nXG4gICAgICApXG4gICAgKS5zb3J0KChmaXJzdEVsLCBzZWNvbmRFbCkgPT4gZ2V0U2l6ZShzZWNvbmRFbCkgLSBnZXRTaXplKGZpcnN0RWwpKVswXTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/background-blur.js