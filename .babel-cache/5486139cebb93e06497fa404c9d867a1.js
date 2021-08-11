import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
import {
BranchToTimeValues,
StoryAdSegmentExp } from "../../../src/experiments/story-ad-progress-segment";

import { EventType } from "./events";
import { POLL_INTERVAL_MS } from "./page-advancement";
import { Services } from "../../../src/service";
import {
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

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
var TRANSITION_LINEAR = "transform ".concat(POLL_INTERVAL_MS, "ms linear");

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
  function ProgressBar(win, storyEl) {_classCallCheck(this, ProgressBar);
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
   */_createClass(ProgressBar, [{ key: "build", value:




    /**
     * Builds the progress bar.
     * @param {string} initialSegmentId
     * @return {!Element}
     */
    function build(initialSegmentId) {var _this = this;
      if (this.isBuilt_) {
        return this.getRoot();
      }

      this.root_ = this.win_.document.createElement('ol');
      this.root_.setAttribute('aria-hidden', true);
      this.root_.classList.add('i-amphtml-story-progress-bar');
      this.storyEl_.addEventListener(EventType.REPLAY, function () {
        _this.replay_();
      });

      this.storeService_.subscribe(
      StateProperty.PAGE_IDS,
      function (pageIds) {
        if (_this.isBuilt_) {
          _this.clear_();
        }

        _this.segmentsAddedPromise_ = _this.mutator_.mutateElement(
        _this.getRoot(),
        function () {
          /** @type {!Array} */(pageIds).forEach(function (id) {
            if (!(id in _this.segmentIdMap_)) {
              _this.addSegment_(id);
            }
          });
        });


        if (_this.isBuilt_) {
          _this.updateProgress(
          _this.activeSegmentId_,
          _this.activeSegmentProgress_,
          true /** updateAllSegments */);

        }
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      function (rtlState) {
        _this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.UI_STATE,
      function (uiState) {
        _this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(StateProperty.AD_STATE, function (adState) {
        _this.onAdStateUpdate_(adState);
      });

      Services.viewportForDoc(this.ampdoc_).onResize(
      debounce(this.win_, function () {return _this.onResize_();}, 300));


      this.segmentsAddedPromise_.then(function () {
        if (_this.segmentCount_ > MAX_SEGMENTS) {
          _this.getInitialFirstExpandedSegmentIndex_(
          _this.segmentIdMap_[initialSegmentId]);


          _this.render_(false /** shouldAnimate */);
        }
        _this.getRoot().classList.toggle(
        'i-amphtml-progress-bar-overflow',
        _this.segmentCount_ > MAX_SEGMENTS);

      });

      this.isBuilt_ = true;
      return this.getRoot();
    }

    /**
     * Reacts to story replay.
     * @private
     */ }, { key: "replay_", value:
    function replay_() {
      if (this.segmentCount_ > MAX_SEGMENTS) {
        this.firstExpandedSegmentIndex_ = 0;
        this.render_(false /** shouldAnimate */);
      }
    }

    /**
     * Renders the segments by setting their corresponding scaleX and translate.
     * @param {boolean} shouldAnimate
     * @private
     */ }, { key: "render_", value:
    function render_() {var _this2 = this;var shouldAnimate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.getSegmentWidth_().then(function (segmentWidth) {
        var translateX =
        -(_this2.firstExpandedSegmentIndex_ - _this2.getPrevEllipsisCount_()) * (
        ELLIPSE_WIDTH_PX + SEGMENTS_MARGIN_PX);

        _this2.mutator_.mutateElement(_this2.getRoot(), function () {
          _this2.getRoot().classList.toggle(
          'i-amphtml-animate-progress',
          shouldAnimate);


          for (var index = 0; index < _this2.segmentCount_; index++) {
            var width =
            index >= _this2.firstExpandedSegmentIndex_ &&
            index < _this2.firstExpandedSegmentIndex_ + MAX_SEGMENTS ?
            segmentWidth :
            ELLIPSE_WIDTH_PX;
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
     */ }, { key: "transform_", value:
    function transform_(segment, translateX, width) {
      if (this.storeService_.get(StateProperty.RTL_STATE)) {
        translateX *= -1;
      }

      // Do not remove translateZ(0.00001px) as it prevents an iOS repaint issue.
      // http://mir.aculo.us/2011/12/07/the-case-of-the-disappearing-element/
      segment.setAttribute(
      'style', "transform: translate3d(".concat(
      translateX, "px, 0px, 0.00001px) scaleX(").concat(
      width / ELLIPSE_WIDTH_PX, ");"));


    }

    /**
     * Gets the individual segment width.
     * @return {!Promise<number>}
     * @private
     */ }, { key: "getSegmentWidth_", value:
    function getSegmentWidth_() {var _this3 = this;
      var nextEllipsisCount = this.getNextEllipsisCount_();
      var prevEllipsisCount = this.getPrevEllipsisCount_();
      var totalEllipsisWidth =
      (nextEllipsisCount + prevEllipsisCount) * (
      ELLIPSE_WIDTH_PX + SEGMENTS_MARGIN_PX);
      return this.getBarWidth_().then(function (barWidth) {
        var totalSegmentsWidth = barWidth - totalEllipsisWidth;

        return (
        totalSegmentsWidth / Math.min(_this3.segmentCount_, MAX_SEGMENTS) -
        SEGMENTS_MARGIN_PX);

      });
    }

    /**
     * Gets width of the progress bar.
     * @return {!Promise<number>}
     * @private
     */ }, { key: "getBarWidth_", value:
    function getBarWidth_() {var _this4 = this;
      return this.mutator_.measureElement(function () {
        return _this4.getRoot(). /*OK*/getBoundingClientRect().width;
      });
    }

    /**
     * Gets the number of ellipsis that should appear to the "next" position of
     * the expanded segments.
     * @return {number}
     * @private
     */ }, { key: "getNextEllipsisCount_", value:
    function getNextEllipsisCount_() {
      var nextPagesCount =
      this.segmentCount_ - (this.firstExpandedSegmentIndex_ + MAX_SEGMENTS);
      return nextPagesCount > 3 ? 3 : Math.max(nextPagesCount, 0);
    }

    /**
     * Gets the number of ellipsis that should appear to the "previous" position
     * of the expanded segments.
     * @return {number}
     * @private
     */ }, { key: "getPrevEllipsisCount_", value:
    function getPrevEllipsisCount_() {
      return Math.min(3, this.firstExpandedSegmentIndex_);
    }

    /**
     * Checks if an index is past the MAX_SEGMENTS limit and updates the progress
     * bar accordingly.
     * @private
     */ }, { key: "checkIndexForOverflow_", value:
    function checkIndexForOverflow_() {
      // Touching an ellipse on the "next" position of the expanded segments.
      if (
      this.activeSegmentIndex_ >=
      this.firstExpandedSegmentIndex_ + MAX_SEGMENTS)
      {
        var nextLimit =
        this.firstExpandedSegmentIndex_ + MAX_SEGMENTS + SEGMENT_INCREMENT - 1;

        this.firstExpandedSegmentIndex_ +=
        nextLimit < this.segmentCount_ ?
        SEGMENT_INCREMENT :
        this.segmentCount_ - (
        this.firstExpandedSegmentIndex_ + MAX_SEGMENTS);

        this.render_();
      } else
        // Touching an ellipse on the "previous" position of the expanded segments.
        if (this.activeSegmentIndex_ < this.firstExpandedSegmentIndex_) {
          this.firstExpandedSegmentIndex_ -=
          this.firstExpandedSegmentIndex_ - SEGMENT_INCREMENT < 0 ?
          this.firstExpandedSegmentIndex_ :
          SEGMENT_INCREMENT;

          this.render_();
        }
    }

    /**
     * Reacts to RTL state updates and triggers the UI for RTL.
     * @param {boolean} rtlState
     * @private
     */ }, { key: "onRtlStateUpdate_", value:
    function onRtlStateUpdate_(rtlState) {var _this5 = this;
      this.mutator_.mutateElement(this.getRoot(), function () {
        rtlState ?
        _this5.getRoot().setAttribute('dir', 'rtl') :
        _this5.getRoot().removeAttribute('dir');
      });
    }

    /**
     * Handles resize events.
     * @private
     */ }, { key: "onResize_", value:
    function onResize_() {
      // We need to take into account both conditionals since we could've switched
      // from a screen that had an overflow to one that doesn't and viceversa.
      if (
      this.getRoot().classList.contains('i-amphtml-progress-bar-overflow') ||
      this.segmentCount_ > MAX_SEGMENTS)
      {
        this.getInitialFirstExpandedSegmentIndex_(this.activeSegmentIndex_);
        this.render_(false /** shouldAnimate */);
      }
    }

    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {
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
          MAX_SEGMENTS = 20;}

    }

    /**
     * Show/hide ad progress bar treatment based on ad visibility.
     * @param {boolean} adState
     * TODO(#33969) clean up experiment is launched.
     */ }, { key: "onAdStateUpdate_", value:
    function onAdStateUpdate_(adState) {
      var segmentExpBranch = getExperimentBranch(
      this.win_,
      StoryAdSegmentExp.ID);

      if (!segmentExpBranch || segmentExpBranch === StoryAdSegmentExp.CONTROL) {
        return;
      }
      // Set CSS signal that we are in the experiment.
      if (!this.root_.hasAttribute('i-amphtml-ad-progress-exp')) {
        this.root_.setAttribute('i-amphtml-ad-progress-exp', '');
      }
      adState ?
      this.createAdSegment_(BranchToTimeValues[segmentExpBranch]) :
      this.removeAdSegment_();
    }

    /**
     * Create ad progress segment that will be shown when ad is visible.
     * TODO(#33969) remove variable animation duration when best value is chosen.
     * @param {string} animationDuration
     */ }, { key: "createAdSegment_", value:
    function createAdSegment_(animationDuration) {var _this$getRoot;
      var index = this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);
      // Fill in segment before ad segment.
      this.updateProgressByIndex_(index, 1, false);
      var progressEl = ((_this$getRoot = this.getRoot()) === null || _this$getRoot === void 0) ? (void 0) : _this$getRoot.querySelector(".i-amphtml-story-page-progress-bar:nth-child(".concat(
      escapeCssSelectorNth(
      // +2 because of zero-index and we want the chip after the ad.
      index + 2), ")"));


      var adSegment = this.win_.document.createElement('div');
      adSegment.className = 'i-amphtml-story-ad-progress-value';
      setStyle(adSegment, 'animationDuration', animationDuration);
      this.currentAdSegment_ = adSegment;
      progressEl.appendChild(adSegment);
    }

    /**
     * Remove active ad progress segment when ad is navigated away from
     */ }, { key: "removeAdSegment_", value:
    function removeAdSegment_() {var _this$currentAdSegmen;
      ((_this$currentAdSegmen = this.currentAdSegment_) === null || _this$currentAdSegmen === void 0) ? (void 0) : _this$currentAdSegmen.parentNode.removeChild(this.currentAdSegment_);
      this.currentAdSegment_ = null;
    }

    /**
     * Builds a new segment element and appends it to the progress bar.
     *
     * @private
     */ }, { key: "buildSegmentEl_", value:
    function buildSegmentEl_() {
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
     */ }, { key: "clear_", value:
    function clear_() {
      removeChildren(devAssert(this.root_));
      this.segmentIdMap_ = map();
      this.segmentCount_ = 0;
    }

    /**
     * Adds a segment to the progress bar.
     *
     * @param {string} id The id of the segment.
     * @private
     */ }, { key: "addSegment_", value:
    function addSegment_(id) {
      this.segmentIdMap_[id] = this.segmentCount_++;
      this.buildSegmentEl_();
    }

    /**
     * Gets the root element of the progress bar.
     *
     * @return {!Element}
     */ }, { key: "getRoot", value:
    function getRoot() {
      return (/** @type {!Element} */(this.root_));
    }

    /**
     * Validates that segment id exists.
     *
     * @param {string} segmentId The index to assert validity
     * @private
     */ }, { key: "assertValidSegmentId_", value:
    function assertValidSegmentId_(segmentId) {
      devAssert(
      hasOwn(this.segmentIdMap_, segmentId));


    }

    /**
     * Updates a segment with its corresponding progress.
     *
     * @param {string} segmentId the id of the segment whos progress to change.
     * @param {number} progress A number from 0.0 to 1.0, representing the
     *     progress of the current segment.
     * @param {boolean} updateAllSegments Updates all of the segments.
     */ }, { key: "updateProgress", value:
    function updateProgress(segmentId, progress) {var _this6 = this;var updateAllSegments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      this.segmentsAddedPromise_.then(function () {
        _this6.assertValidSegmentId_(segmentId);
        var segmentIndex = _this6.segmentIdMap_[segmentId];

        _this6.updateProgressByIndex_(segmentIndex, progress);

        // If updating progress for a new segment, update all the other progress
        // bar segments.
        if (_this6.activeSegmentIndex_ !== segmentIndex || updateAllSegments) {
          _this6.updateSegments_(
          segmentIndex,
          progress,
          _this6.activeSegmentIndex_,
          _this6.activeSegmentProgress_);

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
     */ }, { key: "getInitialFirstExpandedSegmentIndex_", value:
    function getInitialFirstExpandedSegmentIndex_(segmentIndex) {
      if (
      segmentIndex > MAX_SEGMENTS &&
      segmentIndex + MAX_SEGMENTS < this.segmentCount_)
      {
        this.firstExpandedSegmentIndex_ =
        segmentIndex - (segmentIndex % MAX_SEGMENTS);
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
     */ }, { key: "updateSegments_", value:
    function updateSegments_(
    activeSegmentIndex,
    activeSegmentProgress,
    prevSegmentIndex,
    prevSegmentProgress)
    {
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
        var withTransition = shouldAnimatePreviousSegment ?
        i === prevSegmentIndex :
        false;

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
     */ }, { key: "updateProgressByIndex_", value:
    function updateProgressByIndex_(segmentIndex, progress) {var withTransition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      // Offset the index by 1, since nth-child indices start at 1 while
      // JavaScript indices start at 0.
      var nthChildIndex = segmentIndex + 1;
      var progressEl = scopedQuerySelector(
      this.getRoot(), ".i-amphtml-story-page-progress-bar:nth-child(".concat(
      escapeCssSelectorNth(
      nthChildIndex), ") .i-amphtml-story-page-progress-value"));


      this.mutator_.mutateElement(devAssert(progressEl), function () {
        var transition = 'none';
        if (withTransition) {
          // Using an eased transition only if filling the bar to 0 or 1.
          transition =
          progress === 1 || progress === 0 ?
          TRANSITION_EASE :
          TRANSITION_LINEAR;
        }
        setImportantStyles(devAssert(progressEl), {
          'transform': scale("".concat(progress, ",1")),
          'transition': transition });

      });
    } }], [{ key: "create", value: function create(win, storyEl) {return new ProgressBar(win, storyEl);} }]);return ProgressBar;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/progress-bar.js