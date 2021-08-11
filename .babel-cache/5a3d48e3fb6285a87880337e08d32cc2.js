import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

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
import { BranchToTimeValues, StoryAdSegmentExp } from "../../../src/experiments/story-ad-progress-segment";
import { EventType } from "./events";
import { POLL_INTERVAL_MS } from "./page-advancement";
import { Services } from "../../../src/service";
import { StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { debounce } from "../../../src/core/types/function";
import { dev, devAssert } from "../../../src/log";
import { escapeCssSelectorNth } from "../../../src/core/dom/css-selectors";
import { getExperimentBranch } from "../../../src/experiments";
import { hasOwn, map } from "../../../src/core/types/object";
import { removeChildren } from "../../../src/core/dom";
import { scale, setImportantStyles, setStyle } from "../../../src/core/dom/style";
import { scopedQuerySelector } from "../../../src/core/dom/query";

/**
 * Transition used to show the progress of a media. Has to be linear so the
 * animation is smooth and constant.
 * @const {string}
 */
var TRANSITION_LINEAR = "transform " + POLL_INTERVAL_MS + "ms linear";

/**
 * Transition used to fully fill or unfill a progress bar item.
 * @const {string}
 */
var TRANSITION_EASE = 'transform 200ms ease';

/**
 * Size in pixels of a segment ellipse.
 * @type {number}
 */
var ELLIPSE_WIDTH_PX = 2;

/**
 * Size in pixels of the total side margins of a segment.
 * @const {number}
 */
var SEGMENTS_MARGIN_PX = 4;

/**
 * Maximum number of segments that can be shown at a time before collapsing
 * into ellipsis.
 * @type {number}
 */
var MAX_SEGMENTS = 20;

/**
 * Number of segments we introduce to the bar as we pass an overflow point
 * (when user reaches ellipsis).
 * @const {number}
 */
var SEGMENT_INCREMENT = 5;

/**
 * Progress bar for <amp-story>.
 */
export var ProgressBar = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  function ProgressBar(win, storyEl) {
    _classCallCheck(this, ProgressBar);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {number} */
    this.segmentCount_ = 0;

    /** @private {number} */
    this.activeSegmentIndex_ = 0;

    /** @private {number} */
    this.activeSegmentProgress_ = 1;

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = Services.ampdocServiceFor(this.win_).getSingleDoc();

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(this.ampdoc_);

    /** @private {!Object<string, number>} */
    this.segmentIdMap_ = map();

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {string} */
    this.activeSegmentId_ = '';

    /** @private {!Array<!Element>} */
    this.segments_ = [];

    /** @private {!Promise} */
    this.segmentsAddedPromise_ = _resolvedPromise();

    /**
     * First expanded segment after ellipsis (if any) for stories with segments
     * > MAX_SEGMENTS.
     * @private {number}
     */
    this.firstExpandedSegmentIndex_ = 0;

    /** @private {!Element} */
    this.storyEl_ = storyEl;

    /** @private {?Element} */
    this.currentAdSegment_ = null;
  }

  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   * @return {!ProgressBar}
   */
  _createClass(ProgressBar, [{
    key: "build",
    value:
    /**
     * Builds the progress bar.
     * @param {string} initialSegmentId
     * @return {!Element}
     */
    function build(initialSegmentId) {
      var _this = this;

      if (this.isBuilt_) {
        return this.getRoot();
      }

      this.root_ = this.win_.document.createElement('ol');
      this.root_.setAttribute('aria-hidden', true);
      this.root_.classList.add('i-amphtml-story-progress-bar');
      this.storyEl_.addEventListener(EventType.REPLAY, function () {
        _this.replay_();
      });
      this.storeService_.subscribe(StateProperty.PAGE_IDS, function (pageIds) {
        if (_this.isBuilt_) {
          _this.clear_();
        }

        _this.segmentsAddedPromise_ = _this.mutator_.mutateElement(_this.getRoot(), function () {
          /** @type {!Array} */
          pageIds.forEach(function (id) {
            if (!(id in _this.segmentIdMap_)) {
              _this.addSegment_(id);
            }
          });
        });

        if (_this.isBuilt_) {
          _this.updateProgress(_this.activeSegmentId_, _this.activeSegmentProgress_, true
          /** updateAllSegments */
          );
        }
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.RTL_STATE, function (rtlState) {
        _this.onRtlStateUpdate_(rtlState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.AD_STATE, function (adState) {
        _this.onAdStateUpdate_(adState);
      });
      Services.viewportForDoc(this.ampdoc_).onResize(debounce(this.win_, function () {
        return _this.onResize_();
      }, 300));
      this.segmentsAddedPromise_.then(function () {
        if (_this.segmentCount_ > MAX_SEGMENTS) {
          _this.getInitialFirstExpandedSegmentIndex_(_this.segmentIdMap_[initialSegmentId]);

          _this.render_(false
          /** shouldAnimate */
          );
        }

        _this.getRoot().classList.toggle('i-amphtml-progress-bar-overflow', _this.segmentCount_ > MAX_SEGMENTS);
      });
      this.isBuilt_ = true;
      return this.getRoot();
    }
    /**
     * Reacts to story replay.
     * @private
     */

  }, {
    key: "replay_",
    value: function replay_() {
      if (this.segmentCount_ > MAX_SEGMENTS) {
        this.firstExpandedSegmentIndex_ = 0;
        this.render_(false
        /** shouldAnimate */
        );
      }
    }
    /**
     * Renders the segments by setting their corresponding scaleX and translate.
     * @param {boolean} shouldAnimate
     * @private
     */

  }, {
    key: "render_",
    value: function render_(shouldAnimate) {
      var _this2 = this;

      if (shouldAnimate === void 0) {
        shouldAnimate = true;
      }

      this.getSegmentWidth_().then(function (segmentWidth) {
        var translateX = -(_this2.firstExpandedSegmentIndex_ - _this2.getPrevEllipsisCount_()) * (ELLIPSE_WIDTH_PX + SEGMENTS_MARGIN_PX);

        _this2.mutator_.mutateElement(_this2.getRoot(), function () {
          _this2.getRoot().classList.toggle('i-amphtml-animate-progress', shouldAnimate);

          for (var index = 0; index < _this2.segmentCount_; index++) {
            var width = index >= _this2.firstExpandedSegmentIndex_ && index < _this2.firstExpandedSegmentIndex_ + MAX_SEGMENTS ? segmentWidth : ELLIPSE_WIDTH_PX;

            _this2.transform_(_this2.segments_[index], translateX, width);

            translateX += width + SEGMENTS_MARGIN_PX;
          }
        });
      });
    }
    /**
     * Applies transform to a segment.
     * @param {!Element} segment
     * @param {number} translateX
     * @param {number} width
     * @private
     */

  }, {
    key: "transform_",
    value: function transform_(segment, translateX, width) {
      if (this.storeService_.get(StateProperty.RTL_STATE)) {
        translateX *= -1;
      }

      // Do not remove translateZ(0.00001px) as it prevents an iOS repaint issue.
      // http://mir.aculo.us/2011/12/07/the-case-of-the-disappearing-element/
      segment.setAttribute('style', "transform: translate3d(" + translateX + "px, 0px, 0.00001px) scaleX(" + width / ELLIPSE_WIDTH_PX + ");");
    }
    /**
     * Gets the individual segment width.
     * @return {!Promise<number>}
     * @private
     */

  }, {
    key: "getSegmentWidth_",
    value: function getSegmentWidth_() {
      var _this3 = this;

      var nextEllipsisCount = this.getNextEllipsisCount_();
      var prevEllipsisCount = this.getPrevEllipsisCount_();
      var totalEllipsisWidth = (nextEllipsisCount + prevEllipsisCount) * (ELLIPSE_WIDTH_PX + SEGMENTS_MARGIN_PX);
      return this.getBarWidth_().then(function (barWidth) {
        var totalSegmentsWidth = barWidth - totalEllipsisWidth;
        return totalSegmentsWidth / Math.min(_this3.segmentCount_, MAX_SEGMENTS) - SEGMENTS_MARGIN_PX;
      });
    }
    /**
     * Gets width of the progress bar.
     * @return {!Promise<number>}
     * @private
     */

  }, {
    key: "getBarWidth_",
    value: function getBarWidth_() {
      var _this4 = this;

      return this.mutator_.measureElement(function () {
        return _this4.getRoot().
        /*OK*/
        getBoundingClientRect().width;
      });
    }
    /**
     * Gets the number of ellipsis that should appear to the "next" position of
     * the expanded segments.
     * @return {number}
     * @private
     */

  }, {
    key: "getNextEllipsisCount_",
    value: function getNextEllipsisCount_() {
      var nextPagesCount = this.segmentCount_ - (this.firstExpandedSegmentIndex_ + MAX_SEGMENTS);
      return nextPagesCount > 3 ? 3 : Math.max(nextPagesCount, 0);
    }
    /**
     * Gets the number of ellipsis that should appear to the "previous" position
     * of the expanded segments.
     * @return {number}
     * @private
     */

  }, {
    key: "getPrevEllipsisCount_",
    value: function getPrevEllipsisCount_() {
      return Math.min(3, this.firstExpandedSegmentIndex_);
    }
    /**
     * Checks if an index is past the MAX_SEGMENTS limit and updates the progress
     * bar accordingly.
     * @private
     */

  }, {
    key: "checkIndexForOverflow_",
    value: function checkIndexForOverflow_() {
      // Touching an ellipse on the "next" position of the expanded segments.
      if (this.activeSegmentIndex_ >= this.firstExpandedSegmentIndex_ + MAX_SEGMENTS) {
        var nextLimit = this.firstExpandedSegmentIndex_ + MAX_SEGMENTS + SEGMENT_INCREMENT - 1;
        this.firstExpandedSegmentIndex_ += nextLimit < this.segmentCount_ ? SEGMENT_INCREMENT : this.segmentCount_ - (this.firstExpandedSegmentIndex_ + MAX_SEGMENTS);
        this.render_();
      } else // Touching an ellipse on the "previous" position of the expanded segments.
        if (this.activeSegmentIndex_ < this.firstExpandedSegmentIndex_) {
          this.firstExpandedSegmentIndex_ -= this.firstExpandedSegmentIndex_ - SEGMENT_INCREMENT < 0 ? this.firstExpandedSegmentIndex_ : SEGMENT_INCREMENT;
          this.render_();
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
      var _this5 = this;

      this.mutator_.mutateElement(this.getRoot(), function () {
        rtlState ? _this5.getRoot().setAttribute('dir', 'rtl') : _this5.getRoot().removeAttribute('dir');
      });
    }
    /**
     * Handles resize events.
     * @private
     */

  }, {
    key: "onResize_",
    value: function onResize_() {
      // We need to take into account both conditionals since we could've switched
      // from a screen that had an overflow to one that doesn't and viceversa.
      if (this.getRoot().classList.contains('i-amphtml-progress-bar-overflow') || this.segmentCount_ > MAX_SEGMENTS) {
        this.getInitialFirstExpandedSegmentIndex_(this.activeSegmentIndex_);
        this.render_(false
        /** shouldAnimate */
        );
      }
    }
    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      switch (uiState) {
        case UIType.DESKTOP_FULLBLEED:
          MAX_SEGMENTS = 70;
          ELLIPSE_WIDTH_PX = 3;
          break;

        case UIType.MOBILE:
          MAX_SEGMENTS = 20;
          ELLIPSE_WIDTH_PX = 2;
          break;

        case UIType.DESKTOP_PANELS:
          MAX_SEGMENTS = 20;
          ELLIPSE_WIDTH_PX = 3;
          break;

        default:
          MAX_SEGMENTS = 20;
      }
    }
    /**
     * Show/hide ad progress bar treatment based on ad visibility.
     * @param {boolean} adState
     * TODO(#33969) clean up experiment is launched.
     */

  }, {
    key: "onAdStateUpdate_",
    value: function onAdStateUpdate_(adState) {
      var segmentExpBranch = getExperimentBranch(this.win_, StoryAdSegmentExp.ID);

      if (!segmentExpBranch || segmentExpBranch === StoryAdSegmentExp.CONTROL) {
        return;
      }

      // Set CSS signal that we are in the experiment.
      if (!this.root_.hasAttribute('i-amphtml-ad-progress-exp')) {
        this.root_.setAttribute('i-amphtml-ad-progress-exp', '');
      }

      adState ? this.createAdSegment_(BranchToTimeValues[segmentExpBranch]) : this.removeAdSegment_();
    }
    /**
     * Create ad progress segment that will be shown when ad is visible.
     * TODO(#33969) remove variable animation duration when best value is chosen.
     * @param {string} animationDuration
     */

  }, {
    key: "createAdSegment_",
    value: function createAdSegment_(animationDuration) {
      var _this$getRoot;

      var index = this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);
      // Fill in segment before ad segment.
      this.updateProgressByIndex_(index, 1, false);
      var progressEl = (_this$getRoot = this.getRoot()) == null ? void 0 : _this$getRoot.querySelector(".i-amphtml-story-page-progress-bar:nth-child(" + escapeCssSelectorNth( // +2 because of zero-index and we want the chip after the ad.
      index + 2) + ")");
      var adSegment = this.win_.document.createElement('div');
      adSegment.className = 'i-amphtml-story-ad-progress-value';
      setStyle(adSegment, 'animationDuration', animationDuration);
      this.currentAdSegment_ = adSegment;
      progressEl.appendChild(adSegment);
    }
    /**
     * Remove active ad progress segment when ad is navigated away from
     */

  }, {
    key: "removeAdSegment_",
    value: function removeAdSegment_() {
      var _this$currentAdSegmen;

      (_this$currentAdSegmen = this.currentAdSegment_) == null ? void 0 : _this$currentAdSegmen.parentNode.removeChild(this.currentAdSegment_);
      this.currentAdSegment_ = null;
    }
    /**
     * Builds a new segment element and appends it to the progress bar.
     *
     * @private
     */

  }, {
    key: "buildSegmentEl_",
    value: function buildSegmentEl_() {
      var segmentProgressBar = this.win_.document.createElement('li');
      segmentProgressBar.classList.add('i-amphtml-story-page-progress-bar');
      var segmentProgressValue = this.win_.document.createElement('div');
      segmentProgressValue.classList.add('i-amphtml-story-page-progress-value');
      segmentProgressBar.appendChild(segmentProgressValue);
      this.getRoot().appendChild(segmentProgressBar);
      this.segments_.push(segmentProgressBar);
    }
    /**
     * Clears the progress bar.
     */

  }, {
    key: "clear_",
    value: function clear_() {
      removeChildren(devAssert(this.root_));
      this.segmentIdMap_ = map();
      this.segmentCount_ = 0;
    }
    /**
     * Adds a segment to the progress bar.
     *
     * @param {string} id The id of the segment.
     * @private
     */

  }, {
    key: "addSegment_",
    value: function addSegment_(id) {
      this.segmentIdMap_[id] = this.segmentCount_++;
      this.buildSegmentEl_();
    }
    /**
     * Gets the root element of the progress bar.
     *
     * @return {!Element}
     */

  }, {
    key: "getRoot",
    value: function getRoot() {
      return dev().assertElement(this.root_);
    }
    /**
     * Validates that segment id exists.
     *
     * @param {string} segmentId The index to assert validity
     * @private
     */

  }, {
    key: "assertValidSegmentId_",
    value: function assertValidSegmentId_(segmentId) {
      devAssert(hasOwn(this.segmentIdMap_, segmentId), 'Invalid segment-id passed to progress-bar');
    }
    /**
     * Updates a segment with its corresponding progress.
     *
     * @param {string} segmentId the id of the segment whos progress to change.
     * @param {number} progress A number from 0.0 to 1.0, representing the
     *     progress of the current segment.
     * @param {boolean} updateAllSegments Updates all of the segments.
     */

  }, {
    key: "updateProgress",
    value: function updateProgress(segmentId, progress, updateAllSegments) {
      var _this6 = this;

      if (updateAllSegments === void 0) {
        updateAllSegments = false;
      }

      this.segmentsAddedPromise_.then(function () {
        _this6.assertValidSegmentId_(segmentId);

        var segmentIndex = _this6.segmentIdMap_[segmentId];

        _this6.updateProgressByIndex_(segmentIndex, progress);

        // If updating progress for a new segment, update all the other progress
        // bar segments.
        if (_this6.activeSegmentIndex_ !== segmentIndex || updateAllSegments) {
          _this6.updateSegments_(segmentIndex, progress, _this6.activeSegmentIndex_, _this6.activeSegmentProgress_);
        }

        _this6.activeSegmentProgress_ = progress;
        _this6.activeSegmentIndex_ = segmentIndex;
        _this6.activeSegmentId_ = segmentId;

        if (_this6.segmentCount_ > MAX_SEGMENTS) {
          _this6.checkIndexForOverflow_();
        }
      });
    }
    /**
     * Snap the firstExpandedSegmentIndex_ to its most appropiate place, depending
     * where on the story the user is (could be in the middle of the story).
     * @param {number} segmentIndex
     * @private
     */

  }, {
    key: "getInitialFirstExpandedSegmentIndex_",
    value: function getInitialFirstExpandedSegmentIndex_(segmentIndex) {
      if (segmentIndex > MAX_SEGMENTS && segmentIndex + MAX_SEGMENTS < this.segmentCount_) {
        this.firstExpandedSegmentIndex_ = segmentIndex - segmentIndex % MAX_SEGMENTS;
      } else if (segmentIndex > MAX_SEGMENTS) {
        this.firstExpandedSegmentIndex_ = this.segmentCount_ - MAX_SEGMENTS;
      } else {
        this.firstExpandedSegmentIndex_ = 0;
      }
    }
    /**
     * Updates all the progress bar segments, and decides whether the update has
     * to be animated.
     *
     * @param {number} activeSegmentIndex
     * @param {number} activeSegmentProgress
     * @param {number} prevSegmentIndex
     * @param {number} prevSegmentProgress
     * @private
     */

  }, {
    key: "updateSegments_",
    value: function updateSegments_(activeSegmentIndex, activeSegmentProgress, prevSegmentIndex, prevSegmentProgress) {
      var shouldAnimatePreviousSegment = false;

      // Animating the transition from one full segment to another, which is the
      // most common case.
      if (prevSegmentProgress === 1 && activeSegmentProgress === 1) {
        shouldAnimatePreviousSegment = true;
      }

      // When navigating forward, animate the previous segment only if the
      // following one does not get fully filled.
      if (activeSegmentIndex > prevSegmentIndex && activeSegmentProgress !== 1) {
        shouldAnimatePreviousSegment = true;
      }

      // When navigating backward, animate the previous segment only if the
      // following one gets fully filled.
      if (prevSegmentIndex > activeSegmentIndex && activeSegmentProgress === 1) {
        shouldAnimatePreviousSegment = true;
      }

      for (var i = 0; i < this.segmentCount_; i++) {
        // Active segment already gets updated through update progress events
        // dispatched by its amp-story-page.
        if (i === activeSegmentIndex) {
          continue;
        }

        var progress = i < activeSegmentIndex ? 1 : 0;
        // Only animate the segment corresponding to the previous page, if needed.
        var withTransition = shouldAnimatePreviousSegment ? i === prevSegmentIndex : false;
        this.updateProgressByIndex_(i, progress, withTransition);
      }
    }
    /**
     * Updates styles to show progress to a corresponding segment.
     *
     * @param {number} segmentIndex The index of the progress bar segment whose progress should be
     *     changed.
     * @param {number} progress A number from 0.0 to 1.0, representing the
     *     progress of the current segment.
     * @param {boolean=} withTransition
     * @public
     */

  }, {
    key: "updateProgressByIndex_",
    value: function updateProgressByIndex_(segmentIndex, progress, withTransition) {
      if (withTransition === void 0) {
        withTransition = true;
      }

      // Offset the index by 1, since nth-child indices start at 1 while
      // JavaScript indices start at 0.
      var nthChildIndex = segmentIndex + 1;
      var progressEl = scopedQuerySelector(this.getRoot(), ".i-amphtml-story-page-progress-bar:nth-child(" + escapeCssSelectorNth(nthChildIndex) + ") .i-amphtml-story-page-progress-value");
      this.mutator_.mutateElement(devAssert(progressEl), function () {
        var transition = 'none';

        if (withTransition) {
          // Using an eased transition only if filling the bar to 0 or 1.
          transition = progress === 1 || progress === 0 ? TRANSITION_EASE : TRANSITION_LINEAR;
        }

        setImportantStyles(devAssert(progressEl), {
          'transform': scale(progress + ",1"),
          'transition': transition
        });
      });
    }
  }], [{
    key: "create",
    value: function create(win, storyEl) {
      return new ProgressBar(win, storyEl);
    }
  }]);

  return ProgressBar;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2dyZXNzLWJhci5qcyJdLCJuYW1lcyI6WyJCcmFuY2hUb1RpbWVWYWx1ZXMiLCJTdG9yeUFkU2VnbWVudEV4cCIsIkV2ZW50VHlwZSIsIlBPTExfSU5URVJWQUxfTVMiLCJTZXJ2aWNlcyIsIlN0YXRlUHJvcGVydHkiLCJVSVR5cGUiLCJnZXRTdG9yZVNlcnZpY2UiLCJkZWJvdW5jZSIsImRldiIsImRldkFzc2VydCIsImVzY2FwZUNzc1NlbGVjdG9yTnRoIiwiZ2V0RXhwZXJpbWVudEJyYW5jaCIsImhhc093biIsIm1hcCIsInJlbW92ZUNoaWxkcmVuIiwic2NhbGUiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJzZXRTdHlsZSIsInNjb3BlZFF1ZXJ5U2VsZWN0b3IiLCJUUkFOU0lUSU9OX0xJTkVBUiIsIlRSQU5TSVRJT05fRUFTRSIsIkVMTElQU0VfV0lEVEhfUFgiLCJTRUdNRU5UU19NQVJHSU5fUFgiLCJNQVhfU0VHTUVOVFMiLCJTRUdNRU5UX0lOQ1JFTUVOVCIsIlByb2dyZXNzQmFyIiwid2luIiwic3RvcnlFbCIsIndpbl8iLCJpc0J1aWx0XyIsInJvb3RfIiwic2VnbWVudENvdW50XyIsImFjdGl2ZVNlZ21lbnRJbmRleF8iLCJhY3RpdmVTZWdtZW50UHJvZ3Jlc3NfIiwiYW1wZG9jXyIsImFtcGRvY1NlcnZpY2VGb3IiLCJnZXRTaW5nbGVEb2MiLCJtdXRhdG9yXyIsIm11dGF0b3JGb3JEb2MiLCJzZWdtZW50SWRNYXBfIiwic3RvcmVTZXJ2aWNlXyIsImFjdGl2ZVNlZ21lbnRJZF8iLCJzZWdtZW50c18iLCJzZWdtZW50c0FkZGVkUHJvbWlzZV8iLCJmaXJzdEV4cGFuZGVkU2VnbWVudEluZGV4XyIsInN0b3J5RWxfIiwiY3VycmVudEFkU2VnbWVudF8iLCJpbml0aWFsU2VnbWVudElkIiwiZ2V0Um9vdCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsImNsYXNzTGlzdCIsImFkZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJSRVBMQVkiLCJyZXBsYXlfIiwic3Vic2NyaWJlIiwiUEFHRV9JRFMiLCJwYWdlSWRzIiwiY2xlYXJfIiwibXV0YXRlRWxlbWVudCIsImZvckVhY2giLCJpZCIsImFkZFNlZ21lbnRfIiwidXBkYXRlUHJvZ3Jlc3MiLCJSVExfU1RBVEUiLCJydGxTdGF0ZSIsIm9uUnRsU3RhdGVVcGRhdGVfIiwiVUlfU1RBVEUiLCJ1aVN0YXRlIiwib25VSVN0YXRlVXBkYXRlXyIsIkFEX1NUQVRFIiwiYWRTdGF0ZSIsIm9uQWRTdGF0ZVVwZGF0ZV8iLCJ2aWV3cG9ydEZvckRvYyIsIm9uUmVzaXplIiwib25SZXNpemVfIiwidGhlbiIsImdldEluaXRpYWxGaXJzdEV4cGFuZGVkU2VnbWVudEluZGV4XyIsInJlbmRlcl8iLCJ0b2dnbGUiLCJzaG91bGRBbmltYXRlIiwiZ2V0U2VnbWVudFdpZHRoXyIsInNlZ21lbnRXaWR0aCIsInRyYW5zbGF0ZVgiLCJnZXRQcmV2RWxsaXBzaXNDb3VudF8iLCJpbmRleCIsIndpZHRoIiwidHJhbnNmb3JtXyIsInNlZ21lbnQiLCJnZXQiLCJuZXh0RWxsaXBzaXNDb3VudCIsImdldE5leHRFbGxpcHNpc0NvdW50XyIsInByZXZFbGxpcHNpc0NvdW50IiwidG90YWxFbGxpcHNpc1dpZHRoIiwiZ2V0QmFyV2lkdGhfIiwiYmFyV2lkdGgiLCJ0b3RhbFNlZ21lbnRzV2lkdGgiLCJNYXRoIiwibWluIiwibWVhc3VyZUVsZW1lbnQiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJuZXh0UGFnZXNDb3VudCIsIm1heCIsIm5leHRMaW1pdCIsInJlbW92ZUF0dHJpYnV0ZSIsImNvbnRhaW5zIiwiREVTS1RPUF9GVUxMQkxFRUQiLCJNT0JJTEUiLCJERVNLVE9QX1BBTkVMUyIsInNlZ21lbnRFeHBCcmFuY2giLCJJRCIsIkNPTlRST0wiLCJoYXNBdHRyaWJ1dGUiLCJjcmVhdGVBZFNlZ21lbnRfIiwicmVtb3ZlQWRTZWdtZW50XyIsImFuaW1hdGlvbkR1cmF0aW9uIiwiQ1VSUkVOVF9QQUdFX0lOREVYIiwidXBkYXRlUHJvZ3Jlc3NCeUluZGV4XyIsInByb2dyZXNzRWwiLCJxdWVyeVNlbGVjdG9yIiwiYWRTZWdtZW50IiwiY2xhc3NOYW1lIiwiYXBwZW5kQ2hpbGQiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJzZWdtZW50UHJvZ3Jlc3NCYXIiLCJzZWdtZW50UHJvZ3Jlc3NWYWx1ZSIsInB1c2giLCJidWlsZFNlZ21lbnRFbF8iLCJhc3NlcnRFbGVtZW50Iiwic2VnbWVudElkIiwicHJvZ3Jlc3MiLCJ1cGRhdGVBbGxTZWdtZW50cyIsImFzc2VydFZhbGlkU2VnbWVudElkXyIsInNlZ21lbnRJbmRleCIsInVwZGF0ZVNlZ21lbnRzXyIsImNoZWNrSW5kZXhGb3JPdmVyZmxvd18iLCJhY3RpdmVTZWdtZW50SW5kZXgiLCJhY3RpdmVTZWdtZW50UHJvZ3Jlc3MiLCJwcmV2U2VnbWVudEluZGV4IiwicHJldlNlZ21lbnRQcm9ncmVzcyIsInNob3VsZEFuaW1hdGVQcmV2aW91c1NlZ21lbnQiLCJpIiwid2l0aFRyYW5zaXRpb24iLCJudGhDaGlsZEluZGV4IiwidHJhbnNpdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUNFQSxrQkFERixFQUVFQyxpQkFGRjtBQUlBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUNFQyxhQURGLEVBRUVDLE1BRkYsRUFHRUMsZUFIRjtBQUtBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUFRQyxvQkFBUjtBQUNBLFNBQVFDLG1CQUFSO0FBQ0EsU0FBUUMsTUFBUixFQUFnQkMsR0FBaEI7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsS0FBUixFQUFlQyxrQkFBZixFQUFtQ0MsUUFBbkM7QUFDQSxTQUFRQyxtQkFBUjs7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O0FBSUQsT0FiRDtBQWNEO0FBcG1CSDtBQUFBO0FBQUEsV0FnRUUsZ0JBQWN6SCxHQUFkLEVBQW1CQyxPQUFuQixFQUE0QjtBQUMxQixhQUFPLElBQUlGLFdBQUosQ0FBZ0JDLEdBQWhCLEVBQXFCQyxPQUFyQixDQUFQO0FBQ0Q7QUFsRUg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtcbiAgQnJhbmNoVG9UaW1lVmFsdWVzLFxuICBTdG9yeUFkU2VnbWVudEV4cCxcbn0gZnJvbSAnI2V4cGVyaW1lbnRzL3N0b3J5LWFkLXByb2dyZXNzLXNlZ21lbnQnO1xuaW1wb3J0IHtFdmVudFR5cGV9IGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCB7UE9MTF9JTlRFUlZBTF9NU30gZnJvbSAnLi9wYWdlLWFkdmFuY2VtZW50JztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7XG4gIFN0YXRlUHJvcGVydHksXG4gIFVJVHlwZSxcbiAgZ2V0U3RvcmVTZXJ2aWNlLFxufSBmcm9tICcuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJyNjb3JlL3R5cGVzL2Z1bmN0aW9uJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtlc2NhcGVDc3NTZWxlY3Rvck50aH0gZnJvbSAnI2NvcmUvZG9tL2Nzcy1zZWxlY3RvcnMnO1xuaW1wb3J0IHtnZXRFeHBlcmltZW50QnJhbmNofSBmcm9tICdzcmMvZXhwZXJpbWVudHMnO1xuaW1wb3J0IHtoYXNPd24sIG1hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7cmVtb3ZlQ2hpbGRyZW59IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge3NjYWxlLCBzZXRJbXBvcnRhbnRTdHlsZXMsIHNldFN0eWxlfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHtzY29wZWRRdWVyeVNlbGVjdG9yfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuXG4vKipcbiAqIFRyYW5zaXRpb24gdXNlZCB0byBzaG93IHRoZSBwcm9ncmVzcyBvZiBhIG1lZGlhLiBIYXMgdG8gYmUgbGluZWFyIHNvIHRoZVxuICogYW5pbWF0aW9uIGlzIHNtb290aCBhbmQgY29uc3RhbnQuXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgVFJBTlNJVElPTl9MSU5FQVIgPSBgdHJhbnNmb3JtICR7UE9MTF9JTlRFUlZBTF9NU31tcyBsaW5lYXJgO1xuXG4vKipcbiAqIFRyYW5zaXRpb24gdXNlZCB0byBmdWxseSBmaWxsIG9yIHVuZmlsbCBhIHByb2dyZXNzIGJhciBpdGVtLlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmNvbnN0IFRSQU5TSVRJT05fRUFTRSA9ICd0cmFuc2Zvcm0gMjAwbXMgZWFzZSc7XG5cbi8qKlxuICogU2l6ZSBpbiBwaXhlbHMgb2YgYSBzZWdtZW50IGVsbGlwc2UuXG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5sZXQgRUxMSVBTRV9XSURUSF9QWCA9IDI7XG5cbi8qKlxuICogU2l6ZSBpbiBwaXhlbHMgb2YgdGhlIHRvdGFsIHNpZGUgbWFyZ2lucyBvZiBhIHNlZ21lbnQuXG4gKiBAY29uc3Qge251bWJlcn1cbiAqL1xuY29uc3QgU0VHTUVOVFNfTUFSR0lOX1BYID0gNDtcblxuLyoqXG4gKiBNYXhpbXVtIG51bWJlciBvZiBzZWdtZW50cyB0aGF0IGNhbiBiZSBzaG93biBhdCBhIHRpbWUgYmVmb3JlIGNvbGxhcHNpbmdcbiAqIGludG8gZWxsaXBzaXMuXG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5sZXQgTUFYX1NFR01FTlRTID0gMjA7XG5cbi8qKlxuICogTnVtYmVyIG9mIHNlZ21lbnRzIHdlIGludHJvZHVjZSB0byB0aGUgYmFyIGFzIHdlIHBhc3MgYW4gb3ZlcmZsb3cgcG9pbnRcbiAqICh3aGVuIHVzZXIgcmVhY2hlcyBlbGxpcHNpcykuXG4gKiBAY29uc3Qge251bWJlcn1cbiAqL1xuY29uc3QgU0VHTUVOVF9JTkNSRU1FTlQgPSA1O1xuXG4vKipcbiAqIFByb2dyZXNzIGJhciBmb3IgPGFtcC1zdG9yeT4uXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9ncmVzc0JhciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBzdG9yeUVsXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIHN0b3J5RWwpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzQnVpbHRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMucm9vdF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5zZWdtZW50Q291bnRfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuYWN0aXZlU2VnbWVudEluZGV4XyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmFjdGl2ZVNlZ21lbnRQcm9ncmVzc18gPSAxO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IFNlcnZpY2VzLmFtcGRvY1NlcnZpY2VGb3IodGhpcy53aW5fKS5nZXRTaW5nbGVEb2MoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9tdXRhdG9yLWludGVyZmFjZS5NdXRhdG9ySW50ZXJmYWNlfSAqL1xuICAgIHRoaXMubXV0YXRvcl8gPSBTZXJ2aWNlcy5tdXRhdG9yRm9yRG9jKHRoaXMuYW1wZG9jXyk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCBudW1iZXI+fSAqL1xuICAgIHRoaXMuc2VnbWVudElkTWFwXyA9IG1hcCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHRoaXMud2luXyk7XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLmFjdGl2ZVNlZ21lbnRJZF8gPSAnJztcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PCFFbGVtZW50Pn0gKi9cbiAgICB0aGlzLnNlZ21lbnRzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHshUHJvbWlzZX0gKi9cbiAgICB0aGlzLnNlZ21lbnRzQWRkZWRQcm9taXNlXyA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgLyoqXG4gICAgICogRmlyc3QgZXhwYW5kZWQgc2VnbWVudCBhZnRlciBlbGxpcHNpcyAoaWYgYW55KSBmb3Igc3RvcmllcyB3aXRoIHNlZ21lbnRzXG4gICAgICogPiBNQVhfU0VHTUVOVFMuXG4gICAgICogQHByaXZhdGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5zdG9yeUVsXyA9IHN0b3J5RWw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuY3VycmVudEFkU2VnbWVudF8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHN0b3J5RWxcbiAgICogQHJldHVybiB7IVByb2dyZXNzQmFyfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZSh3aW4sIHN0b3J5RWwpIHtcbiAgICByZXR1cm4gbmV3IFByb2dyZXNzQmFyKHdpbiwgc3RvcnlFbCk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBwcm9ncmVzcyBiYXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbml0aWFsU2VnbWVudElkXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKi9cbiAgYnVpbGQoaW5pdGlhbFNlZ21lbnRJZCkge1xuICAgIGlmICh0aGlzLmlzQnVpbHRfKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSb290KCk7XG4gICAgfVxuXG4gICAgdGhpcy5yb290XyA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbCcpO1xuICAgIHRoaXMucm9vdF8uc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgIHRoaXMucm9vdF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LXByb2dyZXNzLWJhcicpO1xuICAgIHRoaXMuc3RvcnlFbF8uYWRkRXZlbnRMaXN0ZW5lcihFdmVudFR5cGUuUkVQTEFZLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlcGxheV8oKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlBBR0VfSURTLFxuICAgICAgKHBhZ2VJZHMpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaXNCdWlsdF8pIHtcbiAgICAgICAgICB0aGlzLmNsZWFyXygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZWdtZW50c0FkZGVkUHJvbWlzZV8gPSB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoXG4gICAgICAgICAgdGhpcy5nZXRSb290KCksXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgLyoqIEB0eXBlIHshQXJyYXl9ICovIChwYWdlSWRzKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoIShpZCBpbiB0aGlzLnNlZ21lbnRJZE1hcF8pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTZWdtZW50XyhpZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5pc0J1aWx0Xykge1xuICAgICAgICAgIHRoaXMudXBkYXRlUHJvZ3Jlc3MoXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNlZ21lbnRJZF8sXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNlZ21lbnRQcm9ncmVzc18sXG4gICAgICAgICAgICB0cnVlIC8qKiB1cGRhdGVBbGxTZWdtZW50cyAqL1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0cnVlIC8qKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlJUTF9TVEFURSxcbiAgICAgIChydGxTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLm9uUnRsU3RhdGVVcGRhdGVfKHJ0bFN0YXRlKTtcbiAgICAgIH0sXG4gICAgICB0cnVlIC8qKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlVJX1NUQVRFLFxuICAgICAgKHVpU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vblVJU3RhdGVVcGRhdGVfKHVpU3RhdGUpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShTdGF0ZVByb3BlcnR5LkFEX1NUQVRFLCAoYWRTdGF0ZSkgPT4ge1xuICAgICAgdGhpcy5vbkFkU3RhdGVVcGRhdGVfKGFkU3RhdGUpO1xuICAgIH0pO1xuXG4gICAgU2VydmljZXMudmlld3BvcnRGb3JEb2ModGhpcy5hbXBkb2NfKS5vblJlc2l6ZShcbiAgICAgIGRlYm91bmNlKHRoaXMud2luXywgKCkgPT4gdGhpcy5vblJlc2l6ZV8oKSwgMzAwKVxuICAgICk7XG5cbiAgICB0aGlzLnNlZ21lbnRzQWRkZWRQcm9taXNlXy50aGVuKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnNlZ21lbnRDb3VudF8gPiBNQVhfU0VHTUVOVFMpIHtcbiAgICAgICAgdGhpcy5nZXRJbml0aWFsRmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8oXG4gICAgICAgICAgdGhpcy5zZWdtZW50SWRNYXBfW2luaXRpYWxTZWdtZW50SWRdXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJfKGZhbHNlIC8qKiBzaG91bGRBbmltYXRlICovKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZ2V0Um9vdCgpLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAgICdpLWFtcGh0bWwtcHJvZ3Jlc3MtYmFyLW92ZXJmbG93JyxcbiAgICAgICAgdGhpcy5zZWdtZW50Q291bnRfID4gTUFYX1NFR01FTlRTXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pc0J1aWx0XyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBzdG9yeSByZXBsYXkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZXBsYXlfKCkge1xuICAgIGlmICh0aGlzLnNlZ21lbnRDb3VudF8gPiBNQVhfU0VHTUVOVFMpIHtcbiAgICAgIHRoaXMuZmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8gPSAwO1xuICAgICAgdGhpcy5yZW5kZXJfKGZhbHNlIC8qKiBzaG91bGRBbmltYXRlICovKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgc2VnbWVudHMgYnkgc2V0dGluZyB0aGVpciBjb3JyZXNwb25kaW5nIHNjYWxlWCBhbmQgdHJhbnNsYXRlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3VsZEFuaW1hdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlbmRlcl8oc2hvdWxkQW5pbWF0ZSA9IHRydWUpIHtcbiAgICB0aGlzLmdldFNlZ21lbnRXaWR0aF8oKS50aGVuKChzZWdtZW50V2lkdGgpID0+IHtcbiAgICAgIGxldCB0cmFuc2xhdGVYID1cbiAgICAgICAgLSh0aGlzLmZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfIC0gdGhpcy5nZXRQcmV2RWxsaXBzaXNDb3VudF8oKSkgKlxuICAgICAgICAoRUxMSVBTRV9XSURUSF9QWCArIFNFR01FTlRTX01BUkdJTl9QWCk7XG5cbiAgICAgIHRoaXMubXV0YXRvcl8ubXV0YXRlRWxlbWVudCh0aGlzLmdldFJvb3QoKSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAgICdpLWFtcGh0bWwtYW5pbWF0ZS1wcm9ncmVzcycsXG4gICAgICAgICAgc2hvdWxkQW5pbWF0ZVxuICAgICAgICApO1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnNlZ21lbnRDb3VudF87IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCB3aWR0aCA9XG4gICAgICAgICAgICBpbmRleCA+PSB0aGlzLmZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfICYmXG4gICAgICAgICAgICBpbmRleCA8IHRoaXMuZmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8gKyBNQVhfU0VHTUVOVFNcbiAgICAgICAgICAgICAgPyBzZWdtZW50V2lkdGhcbiAgICAgICAgICAgICAgOiBFTExJUFNFX1dJRFRIX1BYO1xuICAgICAgICAgIHRoaXMudHJhbnNmb3JtXyh0aGlzLnNlZ21lbnRzX1tpbmRleF0sIHRyYW5zbGF0ZVgsIHdpZHRoKTtcbiAgICAgICAgICB0cmFuc2xhdGVYICs9IHdpZHRoICsgU0VHTUVOVFNfTUFSR0lOX1BYO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRyYW5zZm9ybSB0byBhIHNlZ21lbnQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHNlZ21lbnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRyYW5zbGF0ZVhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0cmFuc2Zvcm1fKHNlZ21lbnQsIHRyYW5zbGF0ZVgsIHdpZHRoKSB7XG4gICAgaWYgKHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5SVExfU1RBVEUpKSB7XG4gICAgICB0cmFuc2xhdGVYICo9IC0xO1xuICAgIH1cblxuICAgIC8vIERvIG5vdCByZW1vdmUgdHJhbnNsYXRlWigwLjAwMDAxcHgpIGFzIGl0IHByZXZlbnRzIGFuIGlPUyByZXBhaW50IGlzc3VlLlxuICAgIC8vIGh0dHA6Ly9taXIuYWN1bG8udXMvMjAxMS8xMi8wNy90aGUtY2FzZS1vZi10aGUtZGlzYXBwZWFyaW5nLWVsZW1lbnQvXG4gICAgc2VnbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAnc3R5bGUnLFxuICAgICAgYHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoJHt0cmFuc2xhdGVYfXB4LCAwcHgsIDAuMDAwMDFweCkgc2NhbGVYKCR7XG4gICAgICAgIHdpZHRoIC8gRUxMSVBTRV9XSURUSF9QWFxuICAgICAgfSk7YFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgaW5kaXZpZHVhbCBzZWdtZW50IHdpZHRoLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxudW1iZXI+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0U2VnbWVudFdpZHRoXygpIHtcbiAgICBjb25zdCBuZXh0RWxsaXBzaXNDb3VudCA9IHRoaXMuZ2V0TmV4dEVsbGlwc2lzQ291bnRfKCk7XG4gICAgY29uc3QgcHJldkVsbGlwc2lzQ291bnQgPSB0aGlzLmdldFByZXZFbGxpcHNpc0NvdW50XygpO1xuICAgIGNvbnN0IHRvdGFsRWxsaXBzaXNXaWR0aCA9XG4gICAgICAobmV4dEVsbGlwc2lzQ291bnQgKyBwcmV2RWxsaXBzaXNDb3VudCkgKlxuICAgICAgKEVMTElQU0VfV0lEVEhfUFggKyBTRUdNRU5UU19NQVJHSU5fUFgpO1xuICAgIHJldHVybiB0aGlzLmdldEJhcldpZHRoXygpLnRoZW4oKGJhcldpZHRoKSA9PiB7XG4gICAgICBjb25zdCB0b3RhbFNlZ21lbnRzV2lkdGggPSBiYXJXaWR0aCAtIHRvdGFsRWxsaXBzaXNXaWR0aDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgdG90YWxTZWdtZW50c1dpZHRoIC8gTWF0aC5taW4odGhpcy5zZWdtZW50Q291bnRfLCBNQVhfU0VHTUVOVFMpIC1cbiAgICAgICAgU0VHTUVOVFNfTUFSR0lOX1BYXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgd2lkdGggb2YgdGhlIHByb2dyZXNzIGJhci5cbiAgICogQHJldHVybiB7IVByb21pc2U8bnVtYmVyPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEJhcldpZHRoXygpIHtcbiAgICByZXR1cm4gdGhpcy5tdXRhdG9yXy5tZWFzdXJlRWxlbWVudCgoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBlbGxpcHNpcyB0aGF0IHNob3VsZCBhcHBlYXIgdG8gdGhlIFwibmV4dFwiIHBvc2l0aW9uIG9mXG4gICAqIHRoZSBleHBhbmRlZCBzZWdtZW50cy5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0TmV4dEVsbGlwc2lzQ291bnRfKCkge1xuICAgIGNvbnN0IG5leHRQYWdlc0NvdW50ID1cbiAgICAgIHRoaXMuc2VnbWVudENvdW50XyAtICh0aGlzLmZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfICsgTUFYX1NFR01FTlRTKTtcbiAgICByZXR1cm4gbmV4dFBhZ2VzQ291bnQgPiAzID8gMyA6IE1hdGgubWF4KG5leHRQYWdlc0NvdW50LCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgZWxsaXBzaXMgdGhhdCBzaG91bGQgYXBwZWFyIHRvIHRoZSBcInByZXZpb3VzXCIgcG9zaXRpb25cbiAgICogb2YgdGhlIGV4cGFuZGVkIHNlZ21lbnRzLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRQcmV2RWxsaXBzaXNDb3VudF8oKSB7XG4gICAgcmV0dXJuIE1hdGgubWluKDMsIHRoaXMuZmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhbiBpbmRleCBpcyBwYXN0IHRoZSBNQVhfU0VHTUVOVFMgbGltaXQgYW5kIHVwZGF0ZXMgdGhlIHByb2dyZXNzXG4gICAqIGJhciBhY2NvcmRpbmdseS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNoZWNrSW5kZXhGb3JPdmVyZmxvd18oKSB7XG4gICAgLy8gVG91Y2hpbmcgYW4gZWxsaXBzZSBvbiB0aGUgXCJuZXh0XCIgcG9zaXRpb24gb2YgdGhlIGV4cGFuZGVkIHNlZ21lbnRzLlxuICAgIGlmIChcbiAgICAgIHRoaXMuYWN0aXZlU2VnbWVudEluZGV4XyA+PVxuICAgICAgdGhpcy5maXJzdEV4cGFuZGVkU2VnbWVudEluZGV4XyArIE1BWF9TRUdNRU5UU1xuICAgICkge1xuICAgICAgY29uc3QgbmV4dExpbWl0ID1cbiAgICAgICAgdGhpcy5maXJzdEV4cGFuZGVkU2VnbWVudEluZGV4XyArIE1BWF9TRUdNRU5UUyArIFNFR01FTlRfSU5DUkVNRU5UIC0gMTtcblxuICAgICAgdGhpcy5maXJzdEV4cGFuZGVkU2VnbWVudEluZGV4XyArPVxuICAgICAgICBuZXh0TGltaXQgPCB0aGlzLnNlZ21lbnRDb3VudF9cbiAgICAgICAgICA/IFNFR01FTlRfSU5DUkVNRU5UXG4gICAgICAgICAgOiB0aGlzLnNlZ21lbnRDb3VudF8gLVxuICAgICAgICAgICAgKHRoaXMuZmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8gKyBNQVhfU0VHTUVOVFMpO1xuXG4gICAgICB0aGlzLnJlbmRlcl8oKTtcbiAgICB9XG4gICAgLy8gVG91Y2hpbmcgYW4gZWxsaXBzZSBvbiB0aGUgXCJwcmV2aW91c1wiIHBvc2l0aW9uIG9mIHRoZSBleHBhbmRlZCBzZWdtZW50cy5cbiAgICBlbHNlIGlmICh0aGlzLmFjdGl2ZVNlZ21lbnRJbmRleF8gPCB0aGlzLmZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfKSB7XG4gICAgICB0aGlzLmZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfIC09XG4gICAgICAgIHRoaXMuZmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8gLSBTRUdNRU5UX0lOQ1JFTUVOVCA8IDBcbiAgICAgICAgICA/IHRoaXMuZmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF9cbiAgICAgICAgICA6IFNFR01FTlRfSU5DUkVNRU5UO1xuXG4gICAgICB0aGlzLnJlbmRlcl8oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIFJUTCBzdGF0ZSB1cGRhdGVzIGFuZCB0cmlnZ2VycyB0aGUgVUkgZm9yIFJUTC5cbiAgICogQHBhcmFtIHtib29sZWFufSBydGxTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25SdGxTdGF0ZVVwZGF0ZV8ocnRsU3RhdGUpIHtcbiAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQodGhpcy5nZXRSb290KCksICgpID0+IHtcbiAgICAgIHJ0bFN0YXRlXG4gICAgICAgID8gdGhpcy5nZXRSb290KCkuc2V0QXR0cmlidXRlKCdkaXInLCAncnRsJylcbiAgICAgICAgOiB0aGlzLmdldFJvb3QoKS5yZW1vdmVBdHRyaWJ1dGUoJ2RpcicpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgcmVzaXplIGV2ZW50cy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uUmVzaXplXygpIHtcbiAgICAvLyBXZSBuZWVkIHRvIHRha2UgaW50byBhY2NvdW50IGJvdGggY29uZGl0aW9uYWxzIHNpbmNlIHdlIGNvdWxkJ3ZlIHN3aXRjaGVkXG4gICAgLy8gZnJvbSBhIHNjcmVlbiB0aGF0IGhhZCBhbiBvdmVyZmxvdyB0byBvbmUgdGhhdCBkb2Vzbid0IGFuZCB2aWNldmVyc2EuXG4gICAgaWYgKFxuICAgICAgdGhpcy5nZXRSb290KCkuY2xhc3NMaXN0LmNvbnRhaW5zKCdpLWFtcGh0bWwtcHJvZ3Jlc3MtYmFyLW92ZXJmbG93JykgfHxcbiAgICAgIHRoaXMuc2VnbWVudENvdW50XyA+IE1BWF9TRUdNRU5UU1xuICAgICkge1xuICAgICAgdGhpcy5nZXRJbml0aWFsRmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8odGhpcy5hY3RpdmVTZWdtZW50SW5kZXhfKTtcbiAgICAgIHRoaXMucmVuZGVyXyhmYWxzZSAvKiogc2hvdWxkQW5pbWF0ZSAqLyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBVSSBzdGF0ZSB1cGRhdGVzLlxuICAgKiBAcGFyYW0geyFVSVR5cGV9IHVpU3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVUlTdGF0ZVVwZGF0ZV8odWlTdGF0ZSkge1xuICAgIHN3aXRjaCAodWlTdGF0ZSkge1xuICAgICAgY2FzZSBVSVR5cGUuREVTS1RPUF9GVUxMQkxFRUQ6XG4gICAgICAgIE1BWF9TRUdNRU5UUyA9IDcwO1xuICAgICAgICBFTExJUFNFX1dJRFRIX1BYID0gMztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVJVHlwZS5NT0JJTEU6XG4gICAgICAgIE1BWF9TRUdNRU5UUyA9IDIwO1xuICAgICAgICBFTExJUFNFX1dJRFRIX1BYID0gMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVJVHlwZS5ERVNLVE9QX1BBTkVMUzpcbiAgICAgICAgTUFYX1NFR01FTlRTID0gMjA7XG4gICAgICAgIEVMTElQU0VfV0lEVEhfUFggPSAzO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIE1BWF9TRUdNRU5UUyA9IDIwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93L2hpZGUgYWQgcHJvZ3Jlc3MgYmFyIHRyZWF0bWVudCBiYXNlZCBvbiBhZCB2aXNpYmlsaXR5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFkU3RhdGVcbiAgICogVE9ETygjMzM5NjkpIGNsZWFuIHVwIGV4cGVyaW1lbnQgaXMgbGF1bmNoZWQuXG4gICAqL1xuICBvbkFkU3RhdGVVcGRhdGVfKGFkU3RhdGUpIHtcbiAgICBjb25zdCBzZWdtZW50RXhwQnJhbmNoID0gZ2V0RXhwZXJpbWVudEJyYW5jaChcbiAgICAgIHRoaXMud2luXyxcbiAgICAgIFN0b3J5QWRTZWdtZW50RXhwLklEXG4gICAgKTtcbiAgICBpZiAoIXNlZ21lbnRFeHBCcmFuY2ggfHwgc2VnbWVudEV4cEJyYW5jaCA9PT0gU3RvcnlBZFNlZ21lbnRFeHAuQ09OVFJPTCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBTZXQgQ1NTIHNpZ25hbCB0aGF0IHdlIGFyZSBpbiB0aGUgZXhwZXJpbWVudC5cbiAgICBpZiAoIXRoaXMucm9vdF8uaGFzQXR0cmlidXRlKCdpLWFtcGh0bWwtYWQtcHJvZ3Jlc3MtZXhwJykpIHtcbiAgICAgIHRoaXMucm9vdF8uc2V0QXR0cmlidXRlKCdpLWFtcGh0bWwtYWQtcHJvZ3Jlc3MtZXhwJywgJycpO1xuICAgIH1cbiAgICBhZFN0YXRlXG4gICAgICA/IHRoaXMuY3JlYXRlQWRTZWdtZW50XyhCcmFuY2hUb1RpbWVWYWx1ZXNbc2VnbWVudEV4cEJyYW5jaF0pXG4gICAgICA6IHRoaXMucmVtb3ZlQWRTZWdtZW50XygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhZCBwcm9ncmVzcyBzZWdtZW50IHRoYXQgd2lsbCBiZSBzaG93biB3aGVuIGFkIGlzIHZpc2libGUuXG4gICAqIFRPRE8oIzMzOTY5KSByZW1vdmUgdmFyaWFibGUgYW5pbWF0aW9uIGR1cmF0aW9uIHdoZW4gYmVzdCB2YWx1ZSBpcyBjaG9zZW4uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhbmltYXRpb25EdXJhdGlvblxuICAgKi9cbiAgY3JlYXRlQWRTZWdtZW50XyhhbmltYXRpb25EdXJhdGlvbikge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JTkRFWCk7XG4gICAgLy8gRmlsbCBpbiBzZWdtZW50IGJlZm9yZSBhZCBzZWdtZW50LlxuICAgIHRoaXMudXBkYXRlUHJvZ3Jlc3NCeUluZGV4XyhpbmRleCwgMSwgZmFsc2UpO1xuICAgIGNvbnN0IHByb2dyZXNzRWwgPSB0aGlzLmdldFJvb3QoKT8ucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuaS1hbXBodG1sLXN0b3J5LXBhZ2UtcHJvZ3Jlc3MtYmFyOm50aC1jaGlsZCgke2VzY2FwZUNzc1NlbGVjdG9yTnRoKFxuICAgICAgICAvLyArMiBiZWNhdXNlIG9mIHplcm8taW5kZXggYW5kIHdlIHdhbnQgdGhlIGNoaXAgYWZ0ZXIgdGhlIGFkLlxuICAgICAgICBpbmRleCArIDJcbiAgICAgICl9KWBcbiAgICApO1xuICAgIGNvbnN0IGFkU2VnbWVudCA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhZFNlZ21lbnQuY2xhc3NOYW1lID0gJ2ktYW1waHRtbC1zdG9yeS1hZC1wcm9ncmVzcy12YWx1ZSc7XG4gICAgc2V0U3R5bGUoYWRTZWdtZW50LCAnYW5pbWF0aW9uRHVyYXRpb24nLCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgdGhpcy5jdXJyZW50QWRTZWdtZW50XyA9IGFkU2VnbWVudDtcbiAgICBwcm9ncmVzc0VsLmFwcGVuZENoaWxkKGFkU2VnbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFjdGl2ZSBhZCBwcm9ncmVzcyBzZWdtZW50IHdoZW4gYWQgaXMgbmF2aWdhdGVkIGF3YXkgZnJvbVxuICAgKi9cbiAgcmVtb3ZlQWRTZWdtZW50XygpIHtcbiAgICB0aGlzLmN1cnJlbnRBZFNlZ21lbnRfPy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudEFkU2VnbWVudF8pO1xuICAgIHRoaXMuY3VycmVudEFkU2VnbWVudF8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhIG5ldyBzZWdtZW50IGVsZW1lbnQgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIHByb2dyZXNzIGJhci5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkU2VnbWVudEVsXygpIHtcbiAgICBjb25zdCBzZWdtZW50UHJvZ3Jlc3NCYXIgPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBzZWdtZW50UHJvZ3Jlc3NCYXIuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LXBhZ2UtcHJvZ3Jlc3MtYmFyJyk7XG4gICAgY29uc3Qgc2VnbWVudFByb2dyZXNzVmFsdWUgPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2VnbWVudFByb2dyZXNzVmFsdWUuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXN0b3J5LXBhZ2UtcHJvZ3Jlc3MtdmFsdWUnKTtcbiAgICBzZWdtZW50UHJvZ3Jlc3NCYXIuYXBwZW5kQ2hpbGQoc2VnbWVudFByb2dyZXNzVmFsdWUpO1xuICAgIHRoaXMuZ2V0Um9vdCgpLmFwcGVuZENoaWxkKHNlZ21lbnRQcm9ncmVzc0Jhcik7XG4gICAgdGhpcy5zZWdtZW50c18ucHVzaChzZWdtZW50UHJvZ3Jlc3NCYXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgcHJvZ3Jlc3MgYmFyLlxuICAgKi9cbiAgY2xlYXJfKCkge1xuICAgIHJlbW92ZUNoaWxkcmVuKGRldkFzc2VydCh0aGlzLnJvb3RfKSk7XG4gICAgdGhpcy5zZWdtZW50SWRNYXBfID0gbWFwKCk7XG4gICAgdGhpcy5zZWdtZW50Q291bnRfID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgc2VnbWVudCB0byB0aGUgcHJvZ3Jlc3MgYmFyLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgVGhlIGlkIG9mIHRoZSBzZWdtZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkU2VnbWVudF8oaWQpIHtcbiAgICB0aGlzLnNlZ21lbnRJZE1hcF9baWRdID0gdGhpcy5zZWdtZW50Q291bnRfKys7XG4gICAgdGhpcy5idWlsZFNlZ21lbnRFbF8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSByb290IGVsZW1lbnQgb2YgdGhlIHByb2dyZXNzIGJhci5cbiAgICpcbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqL1xuICBnZXRSb290KCkge1xuICAgIHJldHVybiBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMucm9vdF8pO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyB0aGF0IHNlZ21lbnQgaWQgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VnbWVudElkIFRoZSBpbmRleCB0byBhc3NlcnQgdmFsaWRpdHlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFzc2VydFZhbGlkU2VnbWVudElkXyhzZWdtZW50SWQpIHtcbiAgICBkZXZBc3NlcnQoXG4gICAgICBoYXNPd24odGhpcy5zZWdtZW50SWRNYXBfLCBzZWdtZW50SWQpLFxuICAgICAgJ0ludmFsaWQgc2VnbWVudC1pZCBwYXNzZWQgdG8gcHJvZ3Jlc3MtYmFyJ1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBhIHNlZ21lbnQgd2l0aCBpdHMgY29ycmVzcG9uZGluZyBwcm9ncmVzcy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlZ21lbnRJZCB0aGUgaWQgb2YgdGhlIHNlZ21lbnQgd2hvcyBwcm9ncmVzcyB0byBjaGFuZ2UuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcm9ncmVzcyBBIG51bWJlciBmcm9tIDAuMCB0byAxLjAsIHJlcHJlc2VudGluZyB0aGVcbiAgICogICAgIHByb2dyZXNzIG9mIHRoZSBjdXJyZW50IHNlZ21lbnQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXBkYXRlQWxsU2VnbWVudHMgVXBkYXRlcyBhbGwgb2YgdGhlIHNlZ21lbnRzLlxuICAgKi9cbiAgdXBkYXRlUHJvZ3Jlc3Moc2VnbWVudElkLCBwcm9ncmVzcywgdXBkYXRlQWxsU2VnbWVudHMgPSBmYWxzZSkge1xuICAgIHRoaXMuc2VnbWVudHNBZGRlZFByb21pc2VfLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5hc3NlcnRWYWxpZFNlZ21lbnRJZF8oc2VnbWVudElkKTtcbiAgICAgIGNvbnN0IHNlZ21lbnRJbmRleCA9IHRoaXMuc2VnbWVudElkTWFwX1tzZWdtZW50SWRdO1xuXG4gICAgICB0aGlzLnVwZGF0ZVByb2dyZXNzQnlJbmRleF8oc2VnbWVudEluZGV4LCBwcm9ncmVzcyk7XG5cbiAgICAgIC8vIElmIHVwZGF0aW5nIHByb2dyZXNzIGZvciBhIG5ldyBzZWdtZW50LCB1cGRhdGUgYWxsIHRoZSBvdGhlciBwcm9ncmVzc1xuICAgICAgLy8gYmFyIHNlZ21lbnRzLlxuICAgICAgaWYgKHRoaXMuYWN0aXZlU2VnbWVudEluZGV4XyAhPT0gc2VnbWVudEluZGV4IHx8IHVwZGF0ZUFsbFNlZ21lbnRzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlU2VnbWVudHNfKFxuICAgICAgICAgIHNlZ21lbnRJbmRleCxcbiAgICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNlZ21lbnRJbmRleF8sXG4gICAgICAgICAgdGhpcy5hY3RpdmVTZWdtZW50UHJvZ3Jlc3NfXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWN0aXZlU2VnbWVudFByb2dyZXNzXyA9IHByb2dyZXNzO1xuICAgICAgdGhpcy5hY3RpdmVTZWdtZW50SW5kZXhfID0gc2VnbWVudEluZGV4O1xuICAgICAgdGhpcy5hY3RpdmVTZWdtZW50SWRfID0gc2VnbWVudElkO1xuXG4gICAgICBpZiAodGhpcy5zZWdtZW50Q291bnRfID4gTUFYX1NFR01FTlRTKSB7XG4gICAgICAgIHRoaXMuY2hlY2tJbmRleEZvck92ZXJmbG93XygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNuYXAgdGhlIGZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfIHRvIGl0cyBtb3N0IGFwcHJvcGlhdGUgcGxhY2UsIGRlcGVuZGluZ1xuICAgKiB3aGVyZSBvbiB0aGUgc3RvcnkgdGhlIHVzZXIgaXMgKGNvdWxkIGJlIGluIHRoZSBtaWRkbGUgb2YgdGhlIHN0b3J5KS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlZ21lbnRJbmRleFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0SW5pdGlhbEZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfKHNlZ21lbnRJbmRleCkge1xuICAgIGlmIChcbiAgICAgIHNlZ21lbnRJbmRleCA+IE1BWF9TRUdNRU5UUyAmJlxuICAgICAgc2VnbWVudEluZGV4ICsgTUFYX1NFR01FTlRTIDwgdGhpcy5zZWdtZW50Q291bnRfXG4gICAgKSB7XG4gICAgICB0aGlzLmZpcnN0RXhwYW5kZWRTZWdtZW50SW5kZXhfID1cbiAgICAgICAgc2VnbWVudEluZGV4IC0gKHNlZ21lbnRJbmRleCAlIE1BWF9TRUdNRU5UUyk7XG4gICAgfSBlbHNlIGlmIChzZWdtZW50SW5kZXggPiBNQVhfU0VHTUVOVFMpIHtcbiAgICAgIHRoaXMuZmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8gPSB0aGlzLnNlZ21lbnRDb3VudF8gLSBNQVhfU0VHTUVOVFM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmlyc3RFeHBhbmRlZFNlZ21lbnRJbmRleF8gPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGFsbCB0aGUgcHJvZ3Jlc3MgYmFyIHNlZ21lbnRzLCBhbmQgZGVjaWRlcyB3aGV0aGVyIHRoZSB1cGRhdGUgaGFzXG4gICAqIHRvIGJlIGFuaW1hdGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYWN0aXZlU2VnbWVudEluZGV4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhY3RpdmVTZWdtZW50UHJvZ3Jlc3NcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByZXZTZWdtZW50SW5kZXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByZXZTZWdtZW50UHJvZ3Jlc3NcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVNlZ21lbnRzXyhcbiAgICBhY3RpdmVTZWdtZW50SW5kZXgsXG4gICAgYWN0aXZlU2VnbWVudFByb2dyZXNzLFxuICAgIHByZXZTZWdtZW50SW5kZXgsXG4gICAgcHJldlNlZ21lbnRQcm9ncmVzc1xuICApIHtcbiAgICBsZXQgc2hvdWxkQW5pbWF0ZVByZXZpb3VzU2VnbWVudCA9IGZhbHNlO1xuXG4gICAgLy8gQW5pbWF0aW5nIHRoZSB0cmFuc2l0aW9uIGZyb20gb25lIGZ1bGwgc2VnbWVudCB0byBhbm90aGVyLCB3aGljaCBpcyB0aGVcbiAgICAvLyBtb3N0IGNvbW1vbiBjYXNlLlxuICAgIGlmIChwcmV2U2VnbWVudFByb2dyZXNzID09PSAxICYmIGFjdGl2ZVNlZ21lbnRQcm9ncmVzcyA9PT0gMSkge1xuICAgICAgc2hvdWxkQW5pbWF0ZVByZXZpb3VzU2VnbWVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2hlbiBuYXZpZ2F0aW5nIGZvcndhcmQsIGFuaW1hdGUgdGhlIHByZXZpb3VzIHNlZ21lbnQgb25seSBpZiB0aGVcbiAgICAvLyBmb2xsb3dpbmcgb25lIGRvZXMgbm90IGdldCBmdWxseSBmaWxsZWQuXG4gICAgaWYgKGFjdGl2ZVNlZ21lbnRJbmRleCA+IHByZXZTZWdtZW50SW5kZXggJiYgYWN0aXZlU2VnbWVudFByb2dyZXNzICE9PSAxKSB7XG4gICAgICBzaG91bGRBbmltYXRlUHJldmlvdXNTZWdtZW50ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBXaGVuIG5hdmlnYXRpbmcgYmFja3dhcmQsIGFuaW1hdGUgdGhlIHByZXZpb3VzIHNlZ21lbnQgb25seSBpZiB0aGVcbiAgICAvLyBmb2xsb3dpbmcgb25lIGdldHMgZnVsbHkgZmlsbGVkLlxuICAgIGlmIChwcmV2U2VnbWVudEluZGV4ID4gYWN0aXZlU2VnbWVudEluZGV4ICYmIGFjdGl2ZVNlZ21lbnRQcm9ncmVzcyA9PT0gMSkge1xuICAgICAgc2hvdWxkQW5pbWF0ZVByZXZpb3VzU2VnbWVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlZ21lbnRDb3VudF87IGkrKykge1xuICAgICAgLy8gQWN0aXZlIHNlZ21lbnQgYWxyZWFkeSBnZXRzIHVwZGF0ZWQgdGhyb3VnaCB1cGRhdGUgcHJvZ3Jlc3MgZXZlbnRzXG4gICAgICAvLyBkaXNwYXRjaGVkIGJ5IGl0cyBhbXAtc3RvcnktcGFnZS5cbiAgICAgIGlmIChpID09PSBhY3RpdmVTZWdtZW50SW5kZXgpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByb2dyZXNzID0gaSA8IGFjdGl2ZVNlZ21lbnRJbmRleCA/IDEgOiAwO1xuXG4gICAgICAvLyBPbmx5IGFuaW1hdGUgdGhlIHNlZ21lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgcHJldmlvdXMgcGFnZSwgaWYgbmVlZGVkLlxuICAgICAgY29uc3Qgd2l0aFRyYW5zaXRpb24gPSBzaG91bGRBbmltYXRlUHJldmlvdXNTZWdtZW50XG4gICAgICAgID8gaSA9PT0gcHJldlNlZ21lbnRJbmRleFxuICAgICAgICA6IGZhbHNlO1xuXG4gICAgICB0aGlzLnVwZGF0ZVByb2dyZXNzQnlJbmRleF8oaSwgcHJvZ3Jlc3MsIHdpdGhUcmFuc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBzdHlsZXMgdG8gc2hvdyBwcm9ncmVzcyB0byBhIGNvcnJlc3BvbmRpbmcgc2VnbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNlZ21lbnRJbmRleCBUaGUgaW5kZXggb2YgdGhlIHByb2dyZXNzIGJhciBzZWdtZW50IHdob3NlIHByb2dyZXNzIHNob3VsZCBiZVxuICAgKiAgICAgY2hhbmdlZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb2dyZXNzIEEgbnVtYmVyIGZyb20gMC4wIHRvIDEuMCwgcmVwcmVzZW50aW5nIHRoZVxuICAgKiAgICAgcHJvZ3Jlc3Mgb2YgdGhlIGN1cnJlbnQgc2VnbWVudC5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gd2l0aFRyYW5zaXRpb25cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdXBkYXRlUHJvZ3Jlc3NCeUluZGV4XyhzZWdtZW50SW5kZXgsIHByb2dyZXNzLCB3aXRoVHJhbnNpdGlvbiA9IHRydWUpIHtcbiAgICAvLyBPZmZzZXQgdGhlIGluZGV4IGJ5IDEsIHNpbmNlIG50aC1jaGlsZCBpbmRpY2VzIHN0YXJ0IGF0IDEgd2hpbGVcbiAgICAvLyBKYXZhU2NyaXB0IGluZGljZXMgc3RhcnQgYXQgMC5cbiAgICBjb25zdCBudGhDaGlsZEluZGV4ID0gc2VnbWVudEluZGV4ICsgMTtcbiAgICBjb25zdCBwcm9ncmVzc0VsID0gc2NvcGVkUXVlcnlTZWxlY3RvcihcbiAgICAgIHRoaXMuZ2V0Um9vdCgpLFxuICAgICAgYC5pLWFtcGh0bWwtc3RvcnktcGFnZS1wcm9ncmVzcy1iYXI6bnRoLWNoaWxkKCR7ZXNjYXBlQ3NzU2VsZWN0b3JOdGgoXG4gICAgICAgIG50aENoaWxkSW5kZXhcbiAgICAgICl9KSAuaS1hbXBodG1sLXN0b3J5LXBhZ2UtcHJvZ3Jlc3MtdmFsdWVgXG4gICAgKTtcbiAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoZGV2QXNzZXJ0KHByb2dyZXNzRWwpLCAoKSA9PiB7XG4gICAgICBsZXQgdHJhbnNpdGlvbiA9ICdub25lJztcbiAgICAgIGlmICh3aXRoVHJhbnNpdGlvbikge1xuICAgICAgICAvLyBVc2luZyBhbiBlYXNlZCB0cmFuc2l0aW9uIG9ubHkgaWYgZmlsbGluZyB0aGUgYmFyIHRvIDAgb3IgMS5cbiAgICAgICAgdHJhbnNpdGlvbiA9XG4gICAgICAgICAgcHJvZ3Jlc3MgPT09IDEgfHwgcHJvZ3Jlc3MgPT09IDBcbiAgICAgICAgICAgID8gVFJBTlNJVElPTl9FQVNFXG4gICAgICAgICAgICA6IFRSQU5TSVRJT05fTElORUFSO1xuICAgICAgfVxuICAgICAgc2V0SW1wb3J0YW50U3R5bGVzKGRldkFzc2VydChwcm9ncmVzc0VsKSwge1xuICAgICAgICAndHJhbnNmb3JtJzogc2NhbGUoYCR7cHJvZ3Jlc3N9LDFgKSxcbiAgICAgICAgJ3RyYW5zaXRpb24nOiB0cmFuc2l0aW9uLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/progress-bar.js