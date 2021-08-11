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
import { StateProperty } from "../../amp-story/1.0/amp-story-store-service";
import { StoryAdPlacements } from "../../../src/experiments/story-ad-placements";

/** @const {number} */
var BEGINNING_OF_STORY_BUFFER = 3;

/** @const {number} */
var END_OF_STORY_BUFFER = 1;

/** @const {number} */
var MAX_ADS_PER_STORY = 4;

/**
 * Calculate the indices of where ads should be placed based
 * on story length and the number of ads we want to show.
 * @param {number} storyLength
 * @param {number} numberOfAds
 * @return {!Array<number>}
 * @visibleForTesting
 */
export function getAdPositions(storyLength, numberOfAds) {
  if (!numberOfAds) {
    return [];
  }

  var firstPosition = Math.ceil(storyLength / (numberOfAds + 1));
  var pagesLeft = storyLength - firstPosition;
  var positions = [firstPosition];
  var interval = Math.ceil(pagesLeft / numberOfAds);

  for (var i = 1; i < numberOfAds; i++) {
    var position = firstPosition + interval * i;
    positions.push(position);
  }

  return positions;
}

/**
 * Get number of ads for this story. 1 ad for every full target interval +
 * a 1/interval chance for an extra ad. Respects maximum ads per story.
 * @param {number} pageCount
 * @param {number} targetInterval
 * @return {number}
 * @visibleForTesting
 */
export function getNumberOfAds(pageCount, targetInterval) {
  var fullSegments = Math.floor(pageCount / targetInterval);
  var addExtraAd = Math.random() < pageCount % targetInterval / targetInterval;
  var remainderAds = addExtraAd ? 1 : 0;
  return Math.min(fullSegments + remainderAds, MAX_ADS_PER_STORY);
}

/**
 * This algorithm will calculate the number of ads to serve and place them
 * in predermined slots upon initialization.
 * @implements {./algorithm-interface.StoryAdPlacementAlgorithm}
 */
export var PredeterminedPositionAlgorithm = /*#__PURE__*/function () {
  /** @override */
  function PredeterminedPositionAlgorithm(storeService, pageManager, placementsExpBranch) {
    _classCallCheck(this, PredeterminedPositionAlgorithm);

    /** @private {!StoryAdPageManager} */
    this.pageManager_ = pageManager;

    /** @private {number} */
    this.targetInterval_ = this.getIntervalFromExpId_(placementsExpBranch);

    /** @private {!Array<string>} */
    this.storyPageIds_ = storeService.get(StateProperty.PAGE_IDS);

    /** @private {!Array<number>} */
    this.adPositions_ = [];

    /** @private {number} */
    this.pagesCreated_ = 0;
  }

  /** @override */
  _createClass(PredeterminedPositionAlgorithm, [{
    key: "isStoryEligible",
    value: function isStoryEligible() {
      var storyLength = this.storyPageIds_.length;
      return storyLength > BEGINNING_OF_STORY_BUFFER + END_OF_STORY_BUFFER;
    }
    /** @override */

  }, {
    key: "initializePages",
    value: function initializePages() {
      var storyLength = this.storyPageIds_.length;
      var numberOfAds = getNumberOfAds(storyLength, this.targetInterval_);
      this.adPositions_ = getAdPositions(storyLength, numberOfAds);

      if (numberOfAds) {
        // TODO(ccordry): once 1px impression is launched create all ads at once.
        return [this.createNextPage_()];
      }

      return [];
    }
    /**
     * Create the next ad page to be shown based on predetermined placements.
     */

  }, {
    key: "createNextPage_",
    value: function createNextPage_() {
      var _this = this;

      var position = this.adPositions_[this.pagesCreated_];
      var adPage = this.pageManager_.createAdPage();
      adPage.registerLoadCallback(function () {
        // TODO(ccordry): we could maybe try again if insertion fails.
        _this.pageManager_.maybeInsertPageAfter(_this.storyPageIds_[position - 1], adPage);
      });
      this.pagesCreated_++;
      return adPage;
    }
    /**
     * This algo does not care about page navigations as positions are calculated
     * upon initialization.
     * @override
     */

  }, {
    key: "onPageChange",
    value: function onPageChange(unusedPageId) {}
    /** @override */

  }, {
    key: "onNewAdView",
    value: function onNewAdView(unusedPageIndex) {
      if (this.pagesCreated_ < this.adPositions_.length) {
        this.createNextPage_();
      }
    }
    /**
     * Map branches to the interval from experiment branch.
     * @param {string} branchId
     * @return {number}
     */

  }, {
    key: "getIntervalFromExpId_",
    value: function getIntervalFromExpId_(branchId) {
      if (branchId === StoryAdPlacements.PREDETERMINED_EIGHT) {
        return 8;
      } else if (branchId === StoryAdPlacements.PREDETERMINED_TEN) {
        return 10;
      } else if (branchId === StoryAdPlacements.PREDETERMINED_TWELVE) {
        return 12;
      }
    }
  }]);

  return PredeterminedPositionAlgorithm;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFsZ29yaXRobS1wcmVkZXRlcm1pbmVkLmpzIl0sIm5hbWVzIjpbIlN0YXRlUHJvcGVydHkiLCJTdG9yeUFkUGxhY2VtZW50cyIsIkJFR0lOTklOR19PRl9TVE9SWV9CVUZGRVIiLCJFTkRfT0ZfU1RPUllfQlVGRkVSIiwiTUFYX0FEU19QRVJfU1RPUlkiLCJnZXRBZFBvc2l0aW9ucyIsInN0b3J5TGVuZ3RoIiwibnVtYmVyT2ZBZHMiLCJmaXJzdFBvc2l0aW9uIiwiTWF0aCIsImNlaWwiLCJwYWdlc0xlZnQiLCJwb3NpdGlvbnMiLCJpbnRlcnZhbCIsImkiLCJwb3NpdGlvbiIsInB1c2giLCJnZXROdW1iZXJPZkFkcyIsInBhZ2VDb3VudCIsInRhcmdldEludGVydmFsIiwiZnVsbFNlZ21lbnRzIiwiZmxvb3IiLCJhZGRFeHRyYUFkIiwicmFuZG9tIiwicmVtYWluZGVyQWRzIiwibWluIiwiUHJlZGV0ZXJtaW5lZFBvc2l0aW9uQWxnb3JpdGhtIiwic3RvcmVTZXJ2aWNlIiwicGFnZU1hbmFnZXIiLCJwbGFjZW1lbnRzRXhwQnJhbmNoIiwicGFnZU1hbmFnZXJfIiwidGFyZ2V0SW50ZXJ2YWxfIiwiZ2V0SW50ZXJ2YWxGcm9tRXhwSWRfIiwic3RvcnlQYWdlSWRzXyIsImdldCIsIlBBR0VfSURTIiwiYWRQb3NpdGlvbnNfIiwicGFnZXNDcmVhdGVkXyIsImxlbmd0aCIsImNyZWF0ZU5leHRQYWdlXyIsImFkUGFnZSIsImNyZWF0ZUFkUGFnZSIsInJlZ2lzdGVyTG9hZENhbGxiYWNrIiwibWF5YmVJbnNlcnRQYWdlQWZ0ZXIiLCJ1bnVzZWRQYWdlSWQiLCJ1bnVzZWRQYWdlSW5kZXgiLCJicmFuY2hJZCIsIlBSRURFVEVSTUlORURfRUlHSFQiLCJQUkVERVRFUk1JTkVEX1RFTiIsIlBSRURFVEVSTUlORURfVFdFTFZFIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxhQUFSO0FBQ0EsU0FBUUMsaUJBQVI7O0FBRUE7QUFDQSxJQUFNQyx5QkFBeUIsR0FBRyxDQUFsQzs7QUFFQTtBQUNBLElBQU1DLG1CQUFtQixHQUFHLENBQTVCOztBQUVBO0FBQ0EsSUFBTUMsaUJBQWlCLEdBQUcsQ0FBMUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsY0FBVCxDQUF3QkMsV0FBeEIsRUFBcUNDLFdBQXJDLEVBQWtEO0FBQ3ZELE1BQUksQ0FBQ0EsV0FBTCxFQUFrQjtBQUNoQixXQUFPLEVBQVA7QUFDRDs7QUFDRCxNQUFNQyxhQUFhLEdBQUdDLElBQUksQ0FBQ0MsSUFBTCxDQUFVSixXQUFXLElBQUlDLFdBQVcsR0FBRyxDQUFsQixDQUFyQixDQUF0QjtBQUNBLE1BQU1JLFNBQVMsR0FBR0wsV0FBVyxHQUFHRSxhQUFoQztBQUNBLE1BQU1JLFNBQVMsR0FBRyxDQUFDSixhQUFELENBQWxCO0FBQ0EsTUFBTUssUUFBUSxHQUFHSixJQUFJLENBQUNDLElBQUwsQ0FBVUMsU0FBUyxHQUFHSixXQUF0QixDQUFqQjs7QUFDQSxPQUFLLElBQUlPLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdQLFdBQXBCLEVBQWlDTyxDQUFDLEVBQWxDLEVBQXNDO0FBQ3BDLFFBQU1DLFFBQVEsR0FBR1AsYUFBYSxHQUFHSyxRQUFRLEdBQUdDLENBQTVDO0FBQ0FGLElBQUFBLFNBQVMsQ0FBQ0ksSUFBVixDQUFlRCxRQUFmO0FBQ0Q7O0FBQ0QsU0FBT0gsU0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNLLGNBQVQsQ0FBd0JDLFNBQXhCLEVBQW1DQyxjQUFuQyxFQUFtRDtBQUN4RCxNQUFNQyxZQUFZLEdBQUdYLElBQUksQ0FBQ1ksS0FBTCxDQUFXSCxTQUFTLEdBQUdDLGNBQXZCLENBQXJCO0FBQ0EsTUFBTUcsVUFBVSxHQUNkYixJQUFJLENBQUNjLE1BQUwsS0FBaUJMLFNBQVMsR0FBR0MsY0FBYixHQUErQkEsY0FEakQ7QUFFQSxNQUFNSyxZQUFZLEdBQUdGLFVBQVUsR0FBRyxDQUFILEdBQU8sQ0FBdEM7QUFDQSxTQUFPYixJQUFJLENBQUNnQixHQUFMLENBQVNMLFlBQVksR0FBR0ksWUFBeEIsRUFBc0NwQixpQkFBdEMsQ0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhc0IsOEJBQWI7QUFDRTtBQUNBLDBDQUFZQyxZQUFaLEVBQTBCQyxXQUExQixFQUF1Q0MsbUJBQXZDLEVBQTREO0FBQUE7O0FBQzFEO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQkYsV0FBcEI7O0FBRUE7QUFDQSxTQUFLRyxlQUFMLEdBQXVCLEtBQUtDLHFCQUFMLENBQTJCSCxtQkFBM0IsQ0FBdkI7O0FBRUE7QUFDQSxTQUFLSSxhQUFMLEdBQXFCTixZQUFZLENBQUNPLEdBQWIsQ0FBaUJsQyxhQUFhLENBQUNtQyxRQUEvQixDQUFyQjs7QUFFQTtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsRUFBcEI7O0FBRUE7QUFDQSxTQUFLQyxhQUFMLEdBQXFCLENBQXJCO0FBQ0Q7O0FBRUQ7QUFuQkY7QUFBQTtBQUFBLFdBb0JFLDJCQUFrQjtBQUNoQixVQUFNL0IsV0FBVyxHQUFHLEtBQUsyQixhQUFMLENBQW1CSyxNQUF2QztBQUNBLGFBQU9oQyxXQUFXLEdBQUdKLHlCQUF5QixHQUFHQyxtQkFBakQ7QUFDRDtBQUVEOztBQXpCRjtBQUFBO0FBQUEsV0EwQkUsMkJBQWtCO0FBQ2hCLFVBQU1HLFdBQVcsR0FBRyxLQUFLMkIsYUFBTCxDQUFtQkssTUFBdkM7QUFDQSxVQUFNL0IsV0FBVyxHQUFHVSxjQUFjLENBQUNYLFdBQUQsRUFBYyxLQUFLeUIsZUFBbkIsQ0FBbEM7QUFDQSxXQUFLSyxZQUFMLEdBQW9CL0IsY0FBYyxDQUFDQyxXQUFELEVBQWNDLFdBQWQsQ0FBbEM7O0FBQ0EsVUFBSUEsV0FBSixFQUFpQjtBQUNmO0FBQ0EsZUFBTyxDQUFDLEtBQUtnQyxlQUFMLEVBQUQsQ0FBUDtBQUNEOztBQUNELGFBQU8sRUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQXZDQTtBQUFBO0FBQUEsV0F3Q0UsMkJBQWtCO0FBQUE7O0FBQ2hCLFVBQU14QixRQUFRLEdBQUcsS0FBS3FCLFlBQUwsQ0FBa0IsS0FBS0MsYUFBdkIsQ0FBakI7QUFDQSxVQUFNRyxNQUFNLEdBQUcsS0FBS1YsWUFBTCxDQUFrQlcsWUFBbEIsRUFBZjtBQUNBRCxNQUFBQSxNQUFNLENBQUNFLG9CQUFQLENBQTRCLFlBQU07QUFDaEM7QUFDQSxRQUFBLEtBQUksQ0FBQ1osWUFBTCxDQUFrQmEsb0JBQWxCLENBQ0UsS0FBSSxDQUFDVixhQUFMLENBQW1CbEIsUUFBUSxHQUFHLENBQTlCLENBREYsRUFFRXlCLE1BRkY7QUFJRCxPQU5EO0FBT0EsV0FBS0gsYUFBTDtBQUNBLGFBQU9HLE1BQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBMURBO0FBQUE7QUFBQSxXQTJERSxzQkFBYUksWUFBYixFQUEyQixDQUFFO0FBRTdCOztBQTdERjtBQUFBO0FBQUEsV0E4REUscUJBQVlDLGVBQVosRUFBNkI7QUFDM0IsVUFBSSxLQUFLUixhQUFMLEdBQXFCLEtBQUtELFlBQUwsQ0FBa0JFLE1BQTNDLEVBQW1EO0FBQ2pELGFBQUtDLGVBQUw7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUF4RUE7QUFBQTtBQUFBLFdBeUVFLCtCQUFzQk8sUUFBdEIsRUFBZ0M7QUFDOUIsVUFBSUEsUUFBUSxLQUFLN0MsaUJBQWlCLENBQUM4QyxtQkFBbkMsRUFBd0Q7QUFDdEQsZUFBTyxDQUFQO0FBQ0QsT0FGRCxNQUVPLElBQUlELFFBQVEsS0FBSzdDLGlCQUFpQixDQUFDK0MsaUJBQW5DLEVBQXNEO0FBQzNELGVBQU8sRUFBUDtBQUNELE9BRk0sTUFFQSxJQUFJRixRQUFRLEtBQUs3QyxpQkFBaUIsQ0FBQ2dELG9CQUFuQyxFQUF5RDtBQUM5RCxlQUFPLEVBQVA7QUFDRDtBQUNGO0FBakZIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtTdGF0ZVByb3BlcnR5fSBmcm9tICcuLi8uLi9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7U3RvcnlBZFBsYWNlbWVudHN9IGZyb20gJyNleHBlcmltZW50cy9zdG9yeS1hZC1wbGFjZW1lbnRzJztcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgQkVHSU5OSU5HX09GX1NUT1JZX0JVRkZFUiA9IDM7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IEVORF9PRl9TVE9SWV9CVUZGRVIgPSAxO1xuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5jb25zdCBNQVhfQURTX1BFUl9TVE9SWSA9IDQ7XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBpbmRpY2VzIG9mIHdoZXJlIGFkcyBzaG91bGQgYmUgcGxhY2VkIGJhc2VkXG4gKiBvbiBzdG9yeSBsZW5ndGggYW5kIHRoZSBudW1iZXIgb2YgYWRzIHdlIHdhbnQgdG8gc2hvdy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdG9yeUxlbmd0aFxuICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mQWRzXG4gKiBAcmV0dXJuIHshQXJyYXk8bnVtYmVyPn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWRQb3NpdGlvbnMoc3RvcnlMZW5ndGgsIG51bWJlck9mQWRzKSB7XG4gIGlmICghbnVtYmVyT2ZBZHMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3QgZmlyc3RQb3NpdGlvbiA9IE1hdGguY2VpbChzdG9yeUxlbmd0aCAvIChudW1iZXJPZkFkcyArIDEpKTtcbiAgY29uc3QgcGFnZXNMZWZ0ID0gc3RvcnlMZW5ndGggLSBmaXJzdFBvc2l0aW9uO1xuICBjb25zdCBwb3NpdGlvbnMgPSBbZmlyc3RQb3NpdGlvbl07XG4gIGNvbnN0IGludGVydmFsID0gTWF0aC5jZWlsKHBhZ2VzTGVmdCAvIG51bWJlck9mQWRzKTtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBudW1iZXJPZkFkczsgaSsrKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBmaXJzdFBvc2l0aW9uICsgaW50ZXJ2YWwgKiBpO1xuICAgIHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uKTtcbiAgfVxuICByZXR1cm4gcG9zaXRpb25zO1xufVxuXG4vKipcbiAqIEdldCBudW1iZXIgb2YgYWRzIGZvciB0aGlzIHN0b3J5LiAxIGFkIGZvciBldmVyeSBmdWxsIHRhcmdldCBpbnRlcnZhbCArXG4gKiBhIDEvaW50ZXJ2YWwgY2hhbmNlIGZvciBhbiBleHRyYSBhZC4gUmVzcGVjdHMgbWF4aW11bSBhZHMgcGVyIHN0b3J5LlxuICogQHBhcmFtIHtudW1iZXJ9IHBhZ2VDb3VudFxuICogQHBhcmFtIHtudW1iZXJ9IHRhcmdldEludGVydmFsXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE51bWJlck9mQWRzKHBhZ2VDb3VudCwgdGFyZ2V0SW50ZXJ2YWwpIHtcbiAgY29uc3QgZnVsbFNlZ21lbnRzID0gTWF0aC5mbG9vcihwYWdlQ291bnQgLyB0YXJnZXRJbnRlcnZhbCk7XG4gIGNvbnN0IGFkZEV4dHJhQWQgPVxuICAgIE1hdGgucmFuZG9tKCkgPCAocGFnZUNvdW50ICUgdGFyZ2V0SW50ZXJ2YWwpIC8gdGFyZ2V0SW50ZXJ2YWw7XG4gIGNvbnN0IHJlbWFpbmRlckFkcyA9IGFkZEV4dHJhQWQgPyAxIDogMDtcbiAgcmV0dXJuIE1hdGgubWluKGZ1bGxTZWdtZW50cyArIHJlbWFpbmRlckFkcywgTUFYX0FEU19QRVJfU1RPUlkpO1xufVxuXG4vKipcbiAqIFRoaXMgYWxnb3JpdGhtIHdpbGwgY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgYWRzIHRvIHNlcnZlIGFuZCBwbGFjZSB0aGVtXG4gKiBpbiBwcmVkZXJtaW5lZCBzbG90cyB1cG9uIGluaXRpYWxpemF0aW9uLlxuICogQGltcGxlbWVudHMgey4vYWxnb3JpdGhtLWludGVyZmFjZS5TdG9yeUFkUGxhY2VtZW50QWxnb3JpdGhtfVxuICovXG5leHBvcnQgY2xhc3MgUHJlZGV0ZXJtaW5lZFBvc2l0aW9uQWxnb3JpdGhtIHtcbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjb25zdHJ1Y3RvcihzdG9yZVNlcnZpY2UsIHBhZ2VNYW5hZ2VyLCBwbGFjZW1lbnRzRXhwQnJhbmNoKSB7XG4gICAgLyoqIEBwcml2YXRlIHshU3RvcnlBZFBhZ2VNYW5hZ2VyfSAqL1xuICAgIHRoaXMucGFnZU1hbmFnZXJfID0gcGFnZU1hbmFnZXI7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLnRhcmdldEludGVydmFsXyA9IHRoaXMuZ2V0SW50ZXJ2YWxGcm9tRXhwSWRfKHBsYWNlbWVudHNFeHBCcmFuY2gpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8c3RyaW5nPn0gKi9cbiAgICB0aGlzLnN0b3J5UGFnZUlkc18gPSBzdG9yZVNlcnZpY2UuZ2V0KFN0YXRlUHJvcGVydHkuUEFHRV9JRFMpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8bnVtYmVyPn0gKi9cbiAgICB0aGlzLmFkUG9zaXRpb25zXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5wYWdlc0NyZWF0ZWRfID0gMDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNTdG9yeUVsaWdpYmxlKCkge1xuICAgIGNvbnN0IHN0b3J5TGVuZ3RoID0gdGhpcy5zdG9yeVBhZ2VJZHNfLmxlbmd0aDtcbiAgICByZXR1cm4gc3RvcnlMZW5ndGggPiBCRUdJTk5JTkdfT0ZfU1RPUllfQlVGRkVSICsgRU5EX09GX1NUT1JZX0JVRkZFUjtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaW5pdGlhbGl6ZVBhZ2VzKCkge1xuICAgIGNvbnN0IHN0b3J5TGVuZ3RoID0gdGhpcy5zdG9yeVBhZ2VJZHNfLmxlbmd0aDtcbiAgICBjb25zdCBudW1iZXJPZkFkcyA9IGdldE51bWJlck9mQWRzKHN0b3J5TGVuZ3RoLCB0aGlzLnRhcmdldEludGVydmFsXyk7XG4gICAgdGhpcy5hZFBvc2l0aW9uc18gPSBnZXRBZFBvc2l0aW9ucyhzdG9yeUxlbmd0aCwgbnVtYmVyT2ZBZHMpO1xuICAgIGlmIChudW1iZXJPZkFkcykge1xuICAgICAgLy8gVE9ETyhjY29yZHJ5KTogb25jZSAxcHggaW1wcmVzc2lvbiBpcyBsYXVuY2hlZCBjcmVhdGUgYWxsIGFkcyBhdCBvbmNlLlxuICAgICAgcmV0dXJuIFt0aGlzLmNyZWF0ZU5leHRQYWdlXygpXTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgbmV4dCBhZCBwYWdlIHRvIGJlIHNob3duIGJhc2VkIG9uIHByZWRldGVybWluZWQgcGxhY2VtZW50cy5cbiAgICovXG4gIGNyZWF0ZU5leHRQYWdlXygpIHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuYWRQb3NpdGlvbnNfW3RoaXMucGFnZXNDcmVhdGVkX107XG4gICAgY29uc3QgYWRQYWdlID0gdGhpcy5wYWdlTWFuYWdlcl8uY3JlYXRlQWRQYWdlKCk7XG4gICAgYWRQYWdlLnJlZ2lzdGVyTG9hZENhbGxiYWNrKCgpID0+IHtcbiAgICAgIC8vIFRPRE8oY2NvcmRyeSk6IHdlIGNvdWxkIG1heWJlIHRyeSBhZ2FpbiBpZiBpbnNlcnRpb24gZmFpbHMuXG4gICAgICB0aGlzLnBhZ2VNYW5hZ2VyXy5tYXliZUluc2VydFBhZ2VBZnRlcihcbiAgICAgICAgdGhpcy5zdG9yeVBhZ2VJZHNfW3Bvc2l0aW9uIC0gMV0sXG4gICAgICAgIGFkUGFnZVxuICAgICAgKTtcbiAgICB9KTtcbiAgICB0aGlzLnBhZ2VzQ3JlYXRlZF8rKztcbiAgICByZXR1cm4gYWRQYWdlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgYWxnbyBkb2VzIG5vdCBjYXJlIGFib3V0IHBhZ2UgbmF2aWdhdGlvbnMgYXMgcG9zaXRpb25zIGFyZSBjYWxjdWxhdGVkXG4gICAqIHVwb24gaW5pdGlhbGl6YXRpb24uXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgb25QYWdlQ2hhbmdlKHVudXNlZFBhZ2VJZCkge31cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uTmV3QWRWaWV3KHVudXNlZFBhZ2VJbmRleCkge1xuICAgIGlmICh0aGlzLnBhZ2VzQ3JlYXRlZF8gPCB0aGlzLmFkUG9zaXRpb25zXy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuY3JlYXRlTmV4dFBhZ2VfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1hcCBicmFuY2hlcyB0byB0aGUgaW50ZXJ2YWwgZnJvbSBleHBlcmltZW50IGJyYW5jaC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaElkXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldEludGVydmFsRnJvbUV4cElkXyhicmFuY2hJZCkge1xuICAgIGlmIChicmFuY2hJZCA9PT0gU3RvcnlBZFBsYWNlbWVudHMuUFJFREVURVJNSU5FRF9FSUdIVCkge1xuICAgICAgcmV0dXJuIDg7XG4gICAgfSBlbHNlIGlmIChicmFuY2hJZCA9PT0gU3RvcnlBZFBsYWNlbWVudHMuUFJFREVURVJNSU5FRF9URU4pIHtcbiAgICAgIHJldHVybiAxMDtcbiAgICB9IGVsc2UgaWYgKGJyYW5jaElkID09PSBTdG9yeUFkUGxhY2VtZW50cy5QUkVERVRFUk1JTkVEX1RXRUxWRSkge1xuICAgICAgcmV0dXJuIDEyO1xuICAgIH1cbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/algorithm-predetermined.js