function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { AnimationRunner } from "./animation-runner";
import { Services } from "../../../../src/service";
import { assertDoesNotContainDisplay } from "../../../../src/assert-display";
import { dev } from "../../../../src/log";
import { getTotalDuration } from "./utils";
import { px, setStyles } from "../../../../src/core/dom/style";
var moduleName = 'amp-animation-worklet';
var workletModulePromise;

/**
 */
export var ScrollTimelineWorkletRunner = /*#__PURE__*/function (_AnimationRunner) {
  _inherits(ScrollTimelineWorkletRunner, _AnimationRunner);

  var _super = _createSuper(ScrollTimelineWorkletRunner);

  /**
   * @param {!Window} win
   * @param {!Array<!../web-animation-types.InternalWebAnimationRequestDef>} requests
   * @param {!JsonObject} viewportData
   */
  function ScrollTimelineWorkletRunner(win, requests, viewportData) {
    var _this;

    _classCallCheck(this, ScrollTimelineWorkletRunner);

    _this = _super.call(this, requests);

    /** @const @private */
    _this.win_ = win;

    /** @protected {?Array<!WorkletAnimation>} */
    _this.players_ = [];

    /** @private {number} */
    _this.startScrollOffset_ = viewportData['start-scroll-offset'];

    /** @private {number} */
    _this.endScrollOffset_ = viewportData['end-scroll-offset'];

    /** @private {number} */
    _this.initialInViewPercent_ = viewportData['initial-inview-percent'];
    return _this;
  }

  /**
   * @override
   * Initializes the players but does not change the state.
   * @suppress {missingProperties}
   */
  _createClass(ScrollTimelineWorkletRunner, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      var documentElement = this.win_.document.documentElement;
      var viewportService = Services.viewportForDoc(documentElement);
      var scrollSource = viewportService.getScrollingElement();
      var timeRange = getTotalDuration(this.requests_);
      var adjustedTimeRange = (1 - this.initialInViewPercent_) * timeRange;
      var initialElementOffset = this.initialInViewPercent_ * timeRange;
      this.requests_.map(function (request) {
        // Apply vars.
        if (request.vars) {
          setStyles(request.target, assertDoesNotContainDisplay(request.vars));
        }

        getOrAddWorkletModule(_this2.win_).then(function () {
          var scrollTimeline = new _this2.win_.ScrollTimeline({
            scrollSource: scrollSource,
            orientation: 'block',
            startScrollOffset: "" + px(_this2.startScrollOffset_),
            endScrollOffset: "" + px(_this2.endScrollOffset_),
            timeRange: adjustedTimeRange,
            fill: 'both'
          });
          var keyframeEffect = new KeyframeEffect(request.target, request.keyframes,
          /** @type {AnimationEffectTimingProperties} */
          request.timing);
          var player = new _this2.win_.WorkletAnimation("" + moduleName, [keyframeEffect], scrollTimeline, {
            'initial-element-offset': initialElementOffset
          });
          player.play();

          _this2.players_.push(player);
        }, function (e) {
          dev().error('AMP-ANIMATION', e);
        });
      });
    }
    /**
     * @override
     * Initializes the players if not already initialized,
     * and starts playing the animations.
     */

  }, {
    key: "start",
    value: function start() {
      if (!this.players_) {
        this.init();
      }
    }
    /**
     * @override
     */

  }, {
    key: "cancel",
    value: function cancel() {
      if (!this.players_) {
        return;
      }

      this.players_.forEach(function (player) {
        player.cancel();
      });
    }
  }]);

  return ScrollTimelineWorkletRunner;
}(AnimationRunner);

/**
 * @param {!Window} win
 * @private
 * @return {*} TODO(#23582): Specify return type
 */
function getOrAddWorkletModule(win) {
  if (workletModulePromise) {
    return workletModulePromise;
  }

  var blob = "registerAnimator('" + moduleName + "', class {\n    constructor(options = {\n      'current-element-offset': 0\n    }) {\n      console/*OK*/.info('Using animationWorklet ScrollTimeline');\n      this.initialElementOffset_ = options['initial-element-offset'];\n    }\n    animate(currentTime, effect) {\n      if (currentTime == NaN) {\n        return;\n      }\n      effect.localTime = currentTime + this.initialElementOffset_;\n    }\n  });\n  ";
  workletModulePromise = win.CSS.animationWorklet.addModule(URL.createObjectURL(new Blob([blob], {
    type: 'text/javascript'
  })));
  return workletModulePromise;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcm9sbHRpbWVsaW5lLXdvcmtsZXQtcnVubmVyLmpzIl0sIm5hbWVzIjpbIkFuaW1hdGlvblJ1bm5lciIsIlNlcnZpY2VzIiwiYXNzZXJ0RG9lc05vdENvbnRhaW5EaXNwbGF5IiwiZGV2IiwiZ2V0VG90YWxEdXJhdGlvbiIsInB4Iiwic2V0U3R5bGVzIiwibW9kdWxlTmFtZSIsIndvcmtsZXRNb2R1bGVQcm9taXNlIiwiU2Nyb2xsVGltZWxpbmVXb3JrbGV0UnVubmVyIiwid2luIiwicmVxdWVzdHMiLCJ2aWV3cG9ydERhdGEiLCJ3aW5fIiwicGxheWVyc18iLCJzdGFydFNjcm9sbE9mZnNldF8iLCJlbmRTY3JvbGxPZmZzZXRfIiwiaW5pdGlhbEluVmlld1BlcmNlbnRfIiwiZG9jdW1lbnRFbGVtZW50IiwiZG9jdW1lbnQiLCJ2aWV3cG9ydFNlcnZpY2UiLCJ2aWV3cG9ydEZvckRvYyIsInNjcm9sbFNvdXJjZSIsImdldFNjcm9sbGluZ0VsZW1lbnQiLCJ0aW1lUmFuZ2UiLCJyZXF1ZXN0c18iLCJhZGp1c3RlZFRpbWVSYW5nZSIsImluaXRpYWxFbGVtZW50T2Zmc2V0IiwibWFwIiwicmVxdWVzdCIsInZhcnMiLCJ0YXJnZXQiLCJnZXRPckFkZFdvcmtsZXRNb2R1bGUiLCJ0aGVuIiwic2Nyb2xsVGltZWxpbmUiLCJTY3JvbGxUaW1lbGluZSIsIm9yaWVudGF0aW9uIiwic3RhcnRTY3JvbGxPZmZzZXQiLCJlbmRTY3JvbGxPZmZzZXQiLCJmaWxsIiwia2V5ZnJhbWVFZmZlY3QiLCJLZXlmcmFtZUVmZmVjdCIsImtleWZyYW1lcyIsInRpbWluZyIsInBsYXllciIsIldvcmtsZXRBbmltYXRpb24iLCJwbGF5IiwicHVzaCIsImUiLCJlcnJvciIsImluaXQiLCJmb3JFYWNoIiwiY2FuY2VsIiwiYmxvYiIsIkNTUyIsImFuaW1hdGlvbldvcmtsZXQiLCJhZGRNb2R1bGUiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJCbG9iIiwidHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxlQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLDJCQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLGdCQUFSO0FBQ0EsU0FBUUMsRUFBUixFQUFZQyxTQUFaO0FBRUEsSUFBTUMsVUFBVSxHQUFHLHVCQUFuQjtBQUNBLElBQUlDLG9CQUFKOztBQUVBO0FBQ0E7QUFDQSxXQUFhQywyQkFBYjtBQUFBOztBQUFBOztBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDRSx1Q0FBWUMsR0FBWixFQUFpQkMsUUFBakIsRUFBMkJDLFlBQTNCLEVBQXlDO0FBQUE7O0FBQUE7O0FBQ3ZDLDhCQUFNRCxRQUFOOztBQUVBO0FBQ0EsVUFBS0UsSUFBTCxHQUFZSCxHQUFaOztBQUVBO0FBQ0EsVUFBS0ksUUFBTCxHQUFnQixFQUFoQjs7QUFFQTtBQUNBLFVBQUtDLGtCQUFMLEdBQTBCSCxZQUFZLENBQUMscUJBQUQsQ0FBdEM7O0FBRUE7QUFDQSxVQUFLSSxnQkFBTCxHQUF3QkosWUFBWSxDQUFDLG1CQUFELENBQXBDOztBQUVBO0FBQ0EsVUFBS0sscUJBQUwsR0FBNkJMLFlBQVksQ0FBQyx3QkFBRCxDQUF6QztBQWhCdUM7QUFpQnhDOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUE3QkE7QUFBQTtBQUFBLFdBOEJFLGdCQUFPO0FBQUE7O0FBQ0wsVUFBT00sZUFBUCxHQUEwQixLQUFLTCxJQUFMLENBQVVNLFFBQXBDLENBQU9ELGVBQVA7QUFDQSxVQUFNRSxlQUFlLEdBQUduQixRQUFRLENBQUNvQixjQUFULENBQXdCSCxlQUF4QixDQUF4QjtBQUNBLFVBQU1JLFlBQVksR0FBR0YsZUFBZSxDQUFDRyxtQkFBaEIsRUFBckI7QUFFQSxVQUFNQyxTQUFTLEdBQUdwQixnQkFBZ0IsQ0FBQyxLQUFLcUIsU0FBTixDQUFsQztBQUNBLFVBQU1DLGlCQUFpQixHQUFHLENBQUMsSUFBSSxLQUFLVCxxQkFBVixJQUFtQ08sU0FBN0Q7QUFDQSxVQUFNRyxvQkFBb0IsR0FBRyxLQUFLVixxQkFBTCxHQUE2Qk8sU0FBMUQ7QUFFQSxXQUFLQyxTQUFMLENBQWVHLEdBQWYsQ0FBbUIsVUFBQ0MsT0FBRCxFQUFhO0FBQzlCO0FBQ0EsWUFBSUEsT0FBTyxDQUFDQyxJQUFaLEVBQWtCO0FBQ2hCeEIsVUFBQUEsU0FBUyxDQUFDdUIsT0FBTyxDQUFDRSxNQUFULEVBQWlCN0IsMkJBQTJCLENBQUMyQixPQUFPLENBQUNDLElBQVQsQ0FBNUMsQ0FBVDtBQUNEOztBQUNERSxRQUFBQSxxQkFBcUIsQ0FBQyxNQUFJLENBQUNuQixJQUFOLENBQXJCLENBQWlDb0IsSUFBakMsQ0FDRSxZQUFNO0FBQ0osY0FBTUMsY0FBYyxHQUFHLElBQUksTUFBSSxDQUFDckIsSUFBTCxDQUFVc0IsY0FBZCxDQUE2QjtBQUNsRGIsWUFBQUEsWUFBWSxFQUFaQSxZQURrRDtBQUVsRGMsWUFBQUEsV0FBVyxFQUFFLE9BRnFDO0FBR2xEQyxZQUFBQSxpQkFBaUIsT0FBS2hDLEVBQUUsQ0FBQyxNQUFJLENBQUNVLGtCQUFOLENBSDBCO0FBSWxEdUIsWUFBQUEsZUFBZSxPQUFLakMsRUFBRSxDQUFDLE1BQUksQ0FBQ1csZ0JBQU4sQ0FKNEI7QUFLbERRLFlBQUFBLFNBQVMsRUFBRUUsaUJBTHVDO0FBTWxEYSxZQUFBQSxJQUFJLEVBQUU7QUFONEMsV0FBN0IsQ0FBdkI7QUFRQSxjQUFNQyxjQUFjLEdBQUcsSUFBSUMsY0FBSixDQUNyQlosT0FBTyxDQUFDRSxNQURhLEVBRXJCRixPQUFPLENBQUNhLFNBRmE7QUFHckI7QUFBZ0RiLFVBQUFBLE9BQU8sQ0FBQ2MsTUFIbkMsQ0FBdkI7QUFLQSxjQUFNQyxNQUFNLEdBQUcsSUFBSSxNQUFJLENBQUMvQixJQUFMLENBQVVnQyxnQkFBZCxNQUNWdEMsVUFEVSxFQUViLENBQUNpQyxjQUFELENBRmEsRUFHYk4sY0FIYSxFQUliO0FBQ0Usc0NBQTBCUDtBQUQ1QixXQUphLENBQWY7QUFRQWlCLFVBQUFBLE1BQU0sQ0FBQ0UsSUFBUDs7QUFDQSxVQUFBLE1BQUksQ0FBQ2hDLFFBQUwsQ0FBY2lDLElBQWQsQ0FBbUJILE1BQW5CO0FBQ0QsU0F6QkgsRUEwQkUsVUFBQ0ksQ0FBRCxFQUFPO0FBQ0w3QyxVQUFBQSxHQUFHLEdBQUc4QyxLQUFOLENBQVksZUFBWixFQUE2QkQsQ0FBN0I7QUFDRCxTQTVCSDtBQThCRCxPQW5DRDtBQW9DRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBakZBO0FBQUE7QUFBQSxXQWtGRSxpQkFBUTtBQUNOLFVBQUksQ0FBQyxLQUFLbEMsUUFBVixFQUFvQjtBQUNsQixhQUFLb0MsSUFBTDtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7O0FBMUZBO0FBQUE7QUFBQSxXQTJGRSxrQkFBUztBQUNQLFVBQUksQ0FBQyxLQUFLcEMsUUFBVixFQUFvQjtBQUNsQjtBQUNEOztBQUNELFdBQUtBLFFBQUwsQ0FBY3FDLE9BQWQsQ0FBc0IsVUFBQ1AsTUFBRCxFQUFZO0FBQ2hDQSxRQUFBQSxNQUFNLENBQUNRLE1BQVA7QUFDRCxPQUZEO0FBR0Q7QUFsR0g7O0FBQUE7QUFBQSxFQUFpRHBELGVBQWpEOztBQXFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU2dDLHFCQUFULENBQStCdEIsR0FBL0IsRUFBb0M7QUFDbEMsTUFBSUYsb0JBQUosRUFBMEI7QUFDeEIsV0FBT0Esb0JBQVA7QUFDRDs7QUFDRCxNQUFNNkMsSUFBSSwwQkFBd0I5QyxVQUF4QixnYUFBVjtBQWdCQUMsRUFBQUEsb0JBQW9CLEdBQUdFLEdBQUcsQ0FBQzRDLEdBQUosQ0FBUUMsZ0JBQVIsQ0FBeUJDLFNBQXpCLENBQ3JCQyxHQUFHLENBQUNDLGVBQUosQ0FBb0IsSUFBSUMsSUFBSixDQUFTLENBQUNOLElBQUQsQ0FBVCxFQUFpQjtBQUFDTyxJQUFBQSxJQUFJLEVBQUU7QUFBUCxHQUFqQixDQUFwQixDQURxQixDQUF2QjtBQUlBLFNBQU9wRCxvQkFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7QW5pbWF0aW9uUnVubmVyfSBmcm9tICcuL2FuaW1hdGlvbi1ydW5uZXInO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHthc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXl9IGZyb20gJy4uLy4uLy4uLy4uL3NyYy9hc3NlcnQtZGlzcGxheSc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2dldFRvdGFsRHVyYXRpb259IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtweCwgc2V0U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG5jb25zdCBtb2R1bGVOYW1lID0gJ2FtcC1hbmltYXRpb24td29ya2xldCc7XG5sZXQgd29ya2xldE1vZHVsZVByb21pc2U7XG5cbi8qKlxuICovXG5leHBvcnQgY2xhc3MgU2Nyb2xsVGltZWxpbmVXb3JrbGV0UnVubmVyIGV4dGVuZHMgQW5pbWF0aW9uUnVubmVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUFycmF5PCEuLi93ZWItYW5pbWF0aW9uLXR5cGVzLkludGVybmFsV2ViQW5pbWF0aW9uUmVxdWVzdERlZj59IHJlcXVlc3RzXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHZpZXdwb3J0RGF0YVxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCByZXF1ZXN0cywgdmlld3BvcnREYXRhKSB7XG4gICAgc3VwZXIocmVxdWVzdHMpO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/QXJyYXk8IVdvcmtsZXRBbmltYXRpb24+fSAqL1xuICAgIHRoaXMucGxheWVyc18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc3RhcnRTY3JvbGxPZmZzZXRfID0gdmlld3BvcnREYXRhWydzdGFydC1zY3JvbGwtb2Zmc2V0J107XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmVuZFNjcm9sbE9mZnNldF8gPSB2aWV3cG9ydERhdGFbJ2VuZC1zY3JvbGwtb2Zmc2V0J107XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmluaXRpYWxJblZpZXdQZXJjZW50XyA9IHZpZXdwb3J0RGF0YVsnaW5pdGlhbC1pbnZpZXctcGVyY2VudCddO1xuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKiBJbml0aWFsaXplcyB0aGUgcGxheWVycyBidXQgZG9lcyBub3QgY2hhbmdlIHRoZSBzdGF0ZS5cbiAgICogQHN1cHByZXNzIHttaXNzaW5nUHJvcGVydGllc31cbiAgICovXG4gIGluaXQoKSB7XG4gICAgY29uc3Qge2RvY3VtZW50RWxlbWVudH0gPSB0aGlzLndpbl8uZG9jdW1lbnQ7XG4gICAgY29uc3Qgdmlld3BvcnRTZXJ2aWNlID0gU2VydmljZXMudmlld3BvcnRGb3JEb2MoZG9jdW1lbnRFbGVtZW50KTtcbiAgICBjb25zdCBzY3JvbGxTb3VyY2UgPSB2aWV3cG9ydFNlcnZpY2UuZ2V0U2Nyb2xsaW5nRWxlbWVudCgpO1xuXG4gICAgY29uc3QgdGltZVJhbmdlID0gZ2V0VG90YWxEdXJhdGlvbih0aGlzLnJlcXVlc3RzXyk7XG4gICAgY29uc3QgYWRqdXN0ZWRUaW1lUmFuZ2UgPSAoMSAtIHRoaXMuaW5pdGlhbEluVmlld1BlcmNlbnRfKSAqIHRpbWVSYW5nZTtcbiAgICBjb25zdCBpbml0aWFsRWxlbWVudE9mZnNldCA9IHRoaXMuaW5pdGlhbEluVmlld1BlcmNlbnRfICogdGltZVJhbmdlO1xuXG4gICAgdGhpcy5yZXF1ZXN0c18ubWFwKChyZXF1ZXN0KSA9PiB7XG4gICAgICAvLyBBcHBseSB2YXJzLlxuICAgICAgaWYgKHJlcXVlc3QudmFycykge1xuICAgICAgICBzZXRTdHlsZXMocmVxdWVzdC50YXJnZXQsIGFzc2VydERvZXNOb3RDb250YWluRGlzcGxheShyZXF1ZXN0LnZhcnMpKTtcbiAgICAgIH1cbiAgICAgIGdldE9yQWRkV29ya2xldE1vZHVsZSh0aGlzLndpbl8pLnRoZW4oXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBjb25zdCBzY3JvbGxUaW1lbGluZSA9IG5ldyB0aGlzLndpbl8uU2Nyb2xsVGltZWxpbmUoe1xuICAgICAgICAgICAgc2Nyb2xsU291cmNlLFxuICAgICAgICAgICAgb3JpZW50YXRpb246ICdibG9jaycsXG4gICAgICAgICAgICBzdGFydFNjcm9sbE9mZnNldDogYCR7cHgodGhpcy5zdGFydFNjcm9sbE9mZnNldF8pfWAsXG4gICAgICAgICAgICBlbmRTY3JvbGxPZmZzZXQ6IGAke3B4KHRoaXMuZW5kU2Nyb2xsT2Zmc2V0Xyl9YCxcbiAgICAgICAgICAgIHRpbWVSYW5nZTogYWRqdXN0ZWRUaW1lUmFuZ2UsXG4gICAgICAgICAgICBmaWxsOiAnYm90aCcsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3Qga2V5ZnJhbWVFZmZlY3QgPSBuZXcgS2V5ZnJhbWVFZmZlY3QoXG4gICAgICAgICAgICByZXF1ZXN0LnRhcmdldCxcbiAgICAgICAgICAgIHJlcXVlc3Qua2V5ZnJhbWVzLFxuICAgICAgICAgICAgLyoqIEB0eXBlIHtBbmltYXRpb25FZmZlY3RUaW1pbmdQcm9wZXJ0aWVzfSAqLyAocmVxdWVzdC50aW1pbmcpXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBuZXcgdGhpcy53aW5fLldvcmtsZXRBbmltYXRpb24oXG4gICAgICAgICAgICBgJHttb2R1bGVOYW1lfWAsXG4gICAgICAgICAgICBba2V5ZnJhbWVFZmZlY3RdLFxuICAgICAgICAgICAgc2Nyb2xsVGltZWxpbmUsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICdpbml0aWFsLWVsZW1lbnQtb2Zmc2V0JzogaW5pdGlhbEVsZW1lbnRPZmZzZXQsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICBwbGF5ZXIucGxheSgpO1xuICAgICAgICAgIHRoaXMucGxheWVyc18ucHVzaChwbGF5ZXIpO1xuICAgICAgICB9LFxuICAgICAgICAoZSkgPT4ge1xuICAgICAgICAgIGRldigpLmVycm9yKCdBTVAtQU5JTUFUSU9OJywgZSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbGF5ZXJzIGlmIG5vdCBhbHJlYWR5IGluaXRpYWxpemVkLFxuICAgKiBhbmQgc3RhcnRzIHBsYXlpbmcgdGhlIGFuaW1hdGlvbnMuXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICBpZiAoIXRoaXMucGxheWVyc18pIHtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGNhbmNlbCgpIHtcbiAgICBpZiAoIXRoaXMucGxheWVyc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wbGF5ZXJzXy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgIHBsYXllci5jYW5jZWwoKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcHJpdmF0ZVxuICogQHJldHVybiB7Kn0gVE9ETygjMjM1ODIpOiBTcGVjaWZ5IHJldHVybiB0eXBlXG4gKi9cbmZ1bmN0aW9uIGdldE9yQWRkV29ya2xldE1vZHVsZSh3aW4pIHtcbiAgaWYgKHdvcmtsZXRNb2R1bGVQcm9taXNlKSB7XG4gICAgcmV0dXJuIHdvcmtsZXRNb2R1bGVQcm9taXNlO1xuICB9XG4gIGNvbnN0IGJsb2IgPSBgcmVnaXN0ZXJBbmltYXRvcignJHttb2R1bGVOYW1lfScsIGNsYXNzIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge1xuICAgICAgJ2N1cnJlbnQtZWxlbWVudC1vZmZzZXQnOiAwXG4gICAgfSkge1xuICAgICAgY29uc29sZS8qT0sqLy5pbmZvKCdVc2luZyBhbmltYXRpb25Xb3JrbGV0IFNjcm9sbFRpbWVsaW5lJyk7XG4gICAgICB0aGlzLmluaXRpYWxFbGVtZW50T2Zmc2V0XyA9IG9wdGlvbnNbJ2luaXRpYWwtZWxlbWVudC1vZmZzZXQnXTtcbiAgICB9XG4gICAgYW5pbWF0ZShjdXJyZW50VGltZSwgZWZmZWN0KSB7XG4gICAgICBpZiAoY3VycmVudFRpbWUgPT0gTmFOKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVmZmVjdC5sb2NhbFRpbWUgPSBjdXJyZW50VGltZSArIHRoaXMuaW5pdGlhbEVsZW1lbnRPZmZzZXRfO1xuICAgIH1cbiAgfSk7XG4gIGA7XG5cbiAgd29ya2xldE1vZHVsZVByb21pc2UgPSB3aW4uQ1NTLmFuaW1hdGlvbldvcmtsZXQuYWRkTW9kdWxlKFxuICAgIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2Jsb2JdLCB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSlcbiAgKTtcblxuICByZXR1cm4gd29ya2xldE1vZHVsZVByb21pc2U7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/runners/scrolltimeline-worklet-runner.js