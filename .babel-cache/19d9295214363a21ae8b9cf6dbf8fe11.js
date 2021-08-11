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
import { Observable } from "../../../../src/core/data-structures/observable";
import { WebAnimationDef, WebAnimationPlayState, WebAnimationSelectorDef, WebAnimationSubtargetDef, WebAnimationTimingDef, WebCompAnimationDef, WebKeyframeAnimationDef, WebKeyframesDef, WebMultiAnimationDef, WebSwitchAnimationDef } from "../web-animation-types";
import { assertDoesNotContainDisplay } from "../../../../src/assert-display";
import { devAssert } from "../../../../src/log";
import { getTotalDuration } from "./utils";
import { setStyles } from "../../../../src/core/dom/style";

/**
 */
export var NativeWebAnimationRunner = /*#__PURE__*/function (_AnimationRunner) {
  _inherits(NativeWebAnimationRunner, _AnimationRunner);

  var _super = _createSuper(NativeWebAnimationRunner);

  /**
   * @param {!Array<!../web-animation-types.InternalWebAnimationRequestDef>} requests
   */
  function NativeWebAnimationRunner(requests) {
    var _this;

    _classCallCheck(this, NativeWebAnimationRunner);

    _this = _super.call(this, requests);

    /** @protected {?Array<!Animation>} */
    _this.players_ = null;

    /** @private {number} */
    _this.runningCount_ = 0;

    /** @private {!WebAnimationPlayState} */
    _this.playState_ = WebAnimationPlayState.IDLE;

    /** @private {!Observable} */
    _this.playStateChangedObservable_ = new Observable();
    return _this;
  }

  /**
   * @override
   * @return {!WebAnimationPlayState}
   */
  _createClass(NativeWebAnimationRunner, [{
    key: "getPlayState",
    value: function getPlayState() {
      return this.playState_;
    }
    /**
     * @override
     * @param {function(!WebAnimationPlayState)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onPlayStateChanged",
    value: function onPlayStateChanged(handler) {
      return this.playStateChangedObservable_.add(handler);
    }
    /**
     * @override
     * Initializes the players but does not change the state.
     */

  }, {
    key: "init",
    value: function init() {
      var _this2 = this;

      devAssert(!this.players_);
      this.players_ = this.requests_.map(function (request) {
        // Apply vars.
        if (request.vars) {
          setStyles(request.target, assertDoesNotContainDisplay(request.vars));
        }

        var player = request.target.animate(
        /** @type {!Array<Object>} */
        request.keyframes,
        /** @type {KeyframeAnimationOptions} */
        request.timing);
        player.pause();
        return player;
      });
      this.runningCount_ = this.players_.length;
      this.players_.forEach(function (player) {
        player.onfinish = function () {
          _this2.runningCount_--;

          if (_this2.runningCount_ == 0) {
            _this2.setPlayState_(WebAnimationPlayState.FINISHED);
          }
        };
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

      this.resume();
    }
    /**
     * @override
     */

  }, {
    key: "pause",
    value: function pause() {
      devAssert(this.players_);
      this.setPlayState_(WebAnimationPlayState.PAUSED);
      this.players_.forEach(function (player) {
        if (player.playState == WebAnimationPlayState.RUNNING) {
          player.pause();
        }
      });
    }
    /**
     * @override
     */

  }, {
    key: "resume",
    value: function resume() {
      var _this3 = this;

      devAssert(this.players_);
      var oldRunnerPlayState = this.playState_;

      if (oldRunnerPlayState == WebAnimationPlayState.RUNNING) {
        return;
      }

      this.setPlayState_(WebAnimationPlayState.RUNNING);
      this.runningCount_ = 0;
      this.players_.forEach(function (player) {
        /**
         * TODO(gharbiw):
         * The playState on Safari and Edge sometimes gets stuck on
         * the PENDING state (particularly when the animation's visibility
         * gets toggled) so we add an exception to play even if the state
         * is PENDING. Need to investigate why this happens, fix it and
         * remove the exception below.
         */
        if (oldRunnerPlayState != WebAnimationPlayState.PAUSED || player.playState == WebAnimationPlayState.PAUSED || player.playState == WebAnimationPlayState.PENDING) {
          player.play();
          _this3.runningCount_++;
        }
      });
    }
    /**
     * @override
     */

  }, {
    key: "reverse",
    value: function reverse() {
      devAssert(this.players_);
      // TODO(nainar) there is no reverse call on WorkletAnimation
      this.players_.forEach(function (player) {
        player.reverse();
      });
    }
    /**
     * @override
     * @param {time} time
     */

  }, {
    key: "seekTo",
    value: function seekTo(time) {
      if (!this.players_) {
        return;
      }

      this.setPlayState_(WebAnimationPlayState.PAUSED);
      this.players_.forEach(function (player) {
        player.pause();
        player.currentTime = time;
      });
    }
    /**
     * @override
     * Seeks to a relative position within the animation timeline given a
     * percentage (0 to 1 number).
     * @param {number} percent between 0 and 1
     */

  }, {
    key: "seekToPercent",
    value: function seekToPercent(percent) {
      devAssert(percent >= 0 && percent <= 1);
      var totalDuration = this.getTotalDuration_();
      var time = totalDuration * percent;
      this.seekTo(time);
    }
    /**
     * @override
     */

  }, {
    key: "finish",
    value: function finish(pauseOnError) {
      if (pauseOnError === void 0) {
        pauseOnError = false;
      }

      if (!this.players_) {
        return;
      }

      var players = this.players_;
      this.players_ = null;
      this.setPlayState_(WebAnimationPlayState.FINISHED);
      players.forEach(function (player) {
        if (pauseOnError) {
          try {
            // Will fail if animation is infinite, in that case we pause it.
            player.finish();
          } catch (error) {
            player.pause();
          }
        } else {
          player.finish();
        }
      });
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

      this.setPlayState_(WebAnimationPlayState.IDLE);
      this.players_.forEach(function (player) {
        player.cancel();
      });
    }
    /**
     * @param {!WebAnimationPlayState} playState
     * @private
     */

  }, {
    key: "setPlayState_",
    value: function setPlayState_(playState) {
      if (this.playState_ != playState) {
        this.playState_ = playState;
        this.playStateChangedObservable_.fire(this.playState_);
      }
    }
    /**
     * @return {number} total duration in milliseconds.
     * @throws {Error} If timeline is infinite.
     */

  }, {
    key: "getTotalDuration_",
    value: function getTotalDuration_() {
      return getTotalDuration(this.requests_);
    }
  }]);

  return NativeWebAnimationRunner;
}(AnimationRunner);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5hdGl2ZS13ZWItYW5pbWF0aW9uLXJ1bm5lci5qcyJdLCJuYW1lcyI6WyJBbmltYXRpb25SdW5uZXIiLCJPYnNlcnZhYmxlIiwiV2ViQW5pbWF0aW9uRGVmIiwiV2ViQW5pbWF0aW9uUGxheVN0YXRlIiwiV2ViQW5pbWF0aW9uU2VsZWN0b3JEZWYiLCJXZWJBbmltYXRpb25TdWJ0YXJnZXREZWYiLCJXZWJBbmltYXRpb25UaW1pbmdEZWYiLCJXZWJDb21wQW5pbWF0aW9uRGVmIiwiV2ViS2V5ZnJhbWVBbmltYXRpb25EZWYiLCJXZWJLZXlmcmFtZXNEZWYiLCJXZWJNdWx0aUFuaW1hdGlvbkRlZiIsIldlYlN3aXRjaEFuaW1hdGlvbkRlZiIsImFzc2VydERvZXNOb3RDb250YWluRGlzcGxheSIsImRldkFzc2VydCIsImdldFRvdGFsRHVyYXRpb24iLCJzZXRTdHlsZXMiLCJOYXRpdmVXZWJBbmltYXRpb25SdW5uZXIiLCJyZXF1ZXN0cyIsInBsYXllcnNfIiwicnVubmluZ0NvdW50XyIsInBsYXlTdGF0ZV8iLCJJRExFIiwicGxheVN0YXRlQ2hhbmdlZE9ic2VydmFibGVfIiwiaGFuZGxlciIsImFkZCIsInJlcXVlc3RzXyIsIm1hcCIsInJlcXVlc3QiLCJ2YXJzIiwidGFyZ2V0IiwicGxheWVyIiwiYW5pbWF0ZSIsImtleWZyYW1lcyIsInRpbWluZyIsInBhdXNlIiwibGVuZ3RoIiwiZm9yRWFjaCIsIm9uZmluaXNoIiwic2V0UGxheVN0YXRlXyIsIkZJTklTSEVEIiwiaW5pdCIsInJlc3VtZSIsIlBBVVNFRCIsInBsYXlTdGF0ZSIsIlJVTk5JTkciLCJvbGRSdW5uZXJQbGF5U3RhdGUiLCJQRU5ESU5HIiwicGxheSIsInJldmVyc2UiLCJ0aW1lIiwiY3VycmVudFRpbWUiLCJwZXJjZW50IiwidG90YWxEdXJhdGlvbiIsImdldFRvdGFsRHVyYXRpb25fIiwic2Vla1RvIiwicGF1c2VPbkVycm9yIiwicGxheWVycyIsImZpbmlzaCIsImVycm9yIiwiY2Fu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LE1BQUFBLE9BQU8sQ0FBQ3BCLE9BQVIsQ0FBZ0IsVUFBQ04sTUFBRCxFQUFZO0FBQzFCLFlBQUl5QixZQUFKLEVBQWtCO0FBQ2hCLGNBQUk7QUFDRjtBQUNBekIsWUFBQUEsTUFBTSxDQUFDMkIsTUFBUDtBQUNELFdBSEQsQ0FHRSxPQUFPQyxLQUFQLEVBQWM7QUFDZDVCLFlBQUFBLE1BQU0sQ0FBQ0ksS0FBUDtBQUNEO0FBQ0YsU0FQRCxNQU9PO0FBQ0xKLFVBQUFBLE1BQU0sQ0FBQzJCLE1BQVA7QUFDRDtBQUNGLE9BWEQ7QUFZRDtBQUVEO0FBQ0Y7QUFDQTs7QUEzTEE7QUFBQTtBQUFBLFdBNExFLGtCQUFTO0FBQ1AsVUFBSSxDQUFDLEtBQUt2QyxRQUFWLEVBQW9CO0FBQ2xCO0FBQ0Q7O0FBQ0QsV0FBS29CLGFBQUwsQ0FBbUJuQyxxQkFBcUIsQ0FBQ2tCLElBQXpDO0FBQ0EsV0FBS0gsUUFBTCxDQUFja0IsT0FBZCxDQUFzQixVQUFDTixNQUFELEVBQVk7QUFDaENBLFFBQUFBLE1BQU0sQ0FBQzZCLE1BQVA7QUFDRCxPQUZEO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF6TUE7QUFBQTtBQUFBLFdBME1FLHVCQUFjaEIsU0FBZCxFQUF5QjtBQUN2QixVQUFJLEtBQUt2QixVQUFMLElBQW1CdUIsU0FBdkIsRUFBa0M7QUFDaEMsYUFBS3ZCLFVBQUwsR0FBa0J1QixTQUFsQjtBQUNBLGFBQUtyQiwyQkFBTCxDQUFpQ3NDLElBQWpDLENBQXNDLEtBQUt4QyxVQUEzQztBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFwTkE7QUFBQTtBQUFBLFdBcU5FLDZCQUFvQjtBQUNsQixhQUFPTixnQkFBZ0IsQ0FBQyxLQUFLVyxTQUFOLENBQXZCO0FBQ0Q7QUF2Tkg7O0FBQUE7QUFBQSxFQUE4Q3pCLGVBQTlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7QW5pbWF0aW9uUnVubmVyfSBmcm9tICcuL2FuaW1hdGlvbi1ydW5uZXInO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvb2JzZXJ2YWJsZSc7XG5pbXBvcnQge1xuICBXZWJBbmltYXRpb25EZWYsXG4gIFdlYkFuaW1hdGlvblBsYXlTdGF0ZSxcbiAgV2ViQW5pbWF0aW9uU2VsZWN0b3JEZWYsXG4gIFdlYkFuaW1hdGlvblN1YnRhcmdldERlZixcbiAgV2ViQW5pbWF0aW9uVGltaW5nRGVmLFxuICBXZWJDb21wQW5pbWF0aW9uRGVmLFxuICBXZWJLZXlmcmFtZUFuaW1hdGlvbkRlZixcbiAgV2ViS2V5ZnJhbWVzRGVmLFxuICBXZWJNdWx0aUFuaW1hdGlvbkRlZixcbiAgV2ViU3dpdGNoQW5pbWF0aW9uRGVmLFxufSBmcm9tICcuLi93ZWItYW5pbWF0aW9uLXR5cGVzJztcbmltcG9ydCB7YXNzZXJ0RG9lc05vdENvbnRhaW5EaXNwbGF5fSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvYXNzZXJ0LWRpc3BsYXknO1xuaW1wb3J0IHtkZXZBc3NlcnR9IGZyb20gJy4uLy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtnZXRUb3RhbER1cmF0aW9ufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7c2V0U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG4vKipcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdGl2ZVdlYkFuaW1hdGlvblJ1bm5lciBleHRlbmRzIEFuaW1hdGlvblJ1bm5lciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFBcnJheTwhLi4vd2ViLWFuaW1hdGlvbi10eXBlcy5JbnRlcm5hbFdlYkFuaW1hdGlvblJlcXVlc3REZWY+fSByZXF1ZXN0c1xuICAgKi9cbiAgY29uc3RydWN0b3IocmVxdWVzdHMpIHtcbiAgICBzdXBlcihyZXF1ZXN0cyk7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7P0FycmF5PCFBbmltYXRpb24+fSAqL1xuICAgIHRoaXMucGxheWVyc18gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5ydW5uaW5nQ291bnRfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVdlYkFuaW1hdGlvblBsYXlTdGF0ZX0gKi9cbiAgICB0aGlzLnBsYXlTdGF0ZV8gPSBXZWJBbmltYXRpb25QbGF5U3RhdGUuSURMRTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9ic2VydmFibGV9ICovXG4gICAgdGhpcy5wbGF5U3RhdGVDaGFuZ2VkT2JzZXJ2YWJsZV8gPSBuZXcgT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKiBAcmV0dXJuIHshV2ViQW5pbWF0aW9uUGxheVN0YXRlfVxuICAgKi9cbiAgZ2V0UGxheVN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLnBsYXlTdGF0ZV87XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVdlYkFuaW1hdGlvblBsYXlTdGF0ZSl9IGhhbmRsZXJcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKi9cbiAgb25QbGF5U3RhdGVDaGFuZ2VkKGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5wbGF5U3RhdGVDaGFuZ2VkT2JzZXJ2YWJsZV8uYWRkKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKiBJbml0aWFsaXplcyB0aGUgcGxheWVycyBidXQgZG9lcyBub3QgY2hhbmdlIHRoZSBzdGF0ZS5cbiAgICovXG4gIGluaXQoKSB7XG4gICAgZGV2QXNzZXJ0KCF0aGlzLnBsYXllcnNfKTtcbiAgICB0aGlzLnBsYXllcnNfID0gdGhpcy5yZXF1ZXN0c18ubWFwKChyZXF1ZXN0KSA9PiB7XG4gICAgICAvLyBBcHBseSB2YXJzLlxuICAgICAgaWYgKHJlcXVlc3QudmFycykge1xuICAgICAgICBzZXRTdHlsZXMocmVxdWVzdC50YXJnZXQsIGFzc2VydERvZXNOb3RDb250YWluRGlzcGxheShyZXF1ZXN0LnZhcnMpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBsYXllciA9IHJlcXVlc3QudGFyZ2V0LmFuaW1hdGUoXG4gICAgICAgIC8qKiBAdHlwZSB7IUFycmF5PE9iamVjdD59ICovIChyZXF1ZXN0LmtleWZyYW1lcyksXG4gICAgICAgIC8qKiBAdHlwZSB7S2V5ZnJhbWVBbmltYXRpb25PcHRpb25zfSAqLyAocmVxdWVzdC50aW1pbmcpXG4gICAgICApO1xuICAgICAgcGxheWVyLnBhdXNlKCk7XG4gICAgICByZXR1cm4gcGxheWVyO1xuICAgIH0pO1xuICAgIHRoaXMucnVubmluZ0NvdW50XyA9IHRoaXMucGxheWVyc18ubGVuZ3RoO1xuICAgIHRoaXMucGxheWVyc18uZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICBwbGF5ZXIub25maW5pc2ggPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucnVubmluZ0NvdW50Xy0tO1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nQ291bnRfID09IDApIHtcbiAgICAgICAgICB0aGlzLnNldFBsYXlTdGF0ZV8oV2ViQW5pbWF0aW9uUGxheVN0YXRlLkZJTklTSEVEKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHBsYXllcnMgaWYgbm90IGFscmVhZHkgaW5pdGlhbGl6ZWQsXG4gICAqIGFuZCBzdGFydHMgcGxheWluZyB0aGUgYW5pbWF0aW9ucy5cbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIGlmICghdGhpcy5wbGF5ZXJzXykge1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICAgIHRoaXMucmVzdW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBwYXVzZSgpIHtcbiAgICBkZXZBc3NlcnQodGhpcy5wbGF5ZXJzXyk7XG4gICAgdGhpcy5zZXRQbGF5U3RhdGVfKFdlYkFuaW1hdGlvblBsYXlTdGF0ZS5QQVVTRUQpO1xuICAgIHRoaXMucGxheWVyc18uZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICBpZiAocGxheWVyLnBsYXlTdGF0ZSA9PSBXZWJBbmltYXRpb25QbGF5U3RhdGUuUlVOTklORykge1xuICAgICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHJlc3VtZSgpIHtcbiAgICBkZXZBc3NlcnQodGhpcy5wbGF5ZXJzXyk7XG4gICAgY29uc3Qgb2xkUnVubmVyUGxheVN0YXRlID0gdGhpcy5wbGF5U3RhdGVfO1xuICAgIGlmIChvbGRSdW5uZXJQbGF5U3RhdGUgPT0gV2ViQW5pbWF0aW9uUGxheVN0YXRlLlJVTk5JTkcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRQbGF5U3RhdGVfKFdlYkFuaW1hdGlvblBsYXlTdGF0ZS5SVU5OSU5HKTtcbiAgICB0aGlzLnJ1bm5pbmdDb3VudF8gPSAwO1xuICAgIHRoaXMucGxheWVyc18uZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAvKipcbiAgICAgICAqIFRPRE8oZ2hhcmJpdyk6XG4gICAgICAgKiBUaGUgcGxheVN0YXRlIG9uIFNhZmFyaSBhbmQgRWRnZSBzb21ldGltZXMgZ2V0cyBzdHVjayBvblxuICAgICAgICogdGhlIFBFTkRJTkcgc3RhdGUgKHBhcnRpY3VsYXJseSB3aGVuIHRoZSBhbmltYXRpb24ncyB2aXNpYmlsaXR5XG4gICAgICAgKiBnZXRzIHRvZ2dsZWQpIHNvIHdlIGFkZCBhbiBleGNlcHRpb24gdG8gcGxheSBldmVuIGlmIHRoZSBzdGF0ZVxuICAgICAgICogaXMgUEVORElORy4gTmVlZCB0byBpbnZlc3RpZ2F0ZSB3aHkgdGhpcyBoYXBwZW5zLCBmaXggaXQgYW5kXG4gICAgICAgKiByZW1vdmUgdGhlIGV4Y2VwdGlvbiBiZWxvdy5cbiAgICAgICAqL1xuICAgICAgaWYgKFxuICAgICAgICBvbGRSdW5uZXJQbGF5U3RhdGUgIT0gV2ViQW5pbWF0aW9uUGxheVN0YXRlLlBBVVNFRCB8fFxuICAgICAgICBwbGF5ZXIucGxheVN0YXRlID09IFdlYkFuaW1hdGlvblBsYXlTdGF0ZS5QQVVTRUQgfHxcbiAgICAgICAgcGxheWVyLnBsYXlTdGF0ZSA9PSBXZWJBbmltYXRpb25QbGF5U3RhdGUuUEVORElOR1xuICAgICAgKSB7XG4gICAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgICAgIHRoaXMucnVubmluZ0NvdW50XysrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgcmV2ZXJzZSgpIHtcbiAgICBkZXZBc3NlcnQodGhpcy5wbGF5ZXJzXyk7XG4gICAgLy8gVE9ETyhuYWluYXIpIHRoZXJlIGlzIG5vIHJldmVyc2UgY2FsbCBvbiBXb3JrbGV0QW5pbWF0aW9uXG4gICAgdGhpcy5wbGF5ZXJzXy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgIHBsYXllci5yZXZlcnNlKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqIEBwYXJhbSB7dGltZX0gdGltZVxuICAgKi9cbiAgc2Vla1RvKHRpbWUpIHtcbiAgICBpZiAoIXRoaXMucGxheWVyc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRQbGF5U3RhdGVfKFdlYkFuaW1hdGlvblBsYXlTdGF0ZS5QQVVTRUQpO1xuICAgIHRoaXMucGxheWVyc18uZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICAgIHBsYXllci5jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqIFNlZWtzIHRvIGEgcmVsYXRpdmUgcG9zaXRpb24gd2l0aGluIHRoZSBhbmltYXRpb24gdGltZWxpbmUgZ2l2ZW4gYVxuICAgKiBwZXJjZW50YWdlICgwIHRvIDEgbnVtYmVyKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmNlbnQgYmV0d2VlbiAwIGFuZCAxXG4gICAqL1xuICBzZWVrVG9QZXJjZW50KHBlcmNlbnQpIHtcbiAgICBkZXZBc3NlcnQocGVyY2VudCA+PSAwICYmIHBlcmNlbnQgPD0gMSk7XG4gICAgY29uc3QgdG90YWxEdXJhdGlvbiA9IHRoaXMuZ2V0VG90YWxEdXJhdGlvbl8oKTtcbiAgICBjb25zdCB0aW1lID0gdG90YWxEdXJhdGlvbiAqIHBlcmNlbnQ7XG4gICAgdGhpcy5zZWVrVG8odGltZSk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBmaW5pc2gocGF1c2VPbkVycm9yID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMucGxheWVyc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGxheWVycyA9IHRoaXMucGxheWVyc187XG4gICAgdGhpcy5wbGF5ZXJzXyA9IG51bGw7XG4gICAgdGhpcy5zZXRQbGF5U3RhdGVfKFdlYkFuaW1hdGlvblBsYXlTdGF0ZS5GSU5JU0hFRCk7XG4gICAgcGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgIGlmIChwYXVzZU9uRXJyb3IpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBXaWxsIGZhaWwgaWYgYW5pbWF0aW9uIGlzIGluZmluaXRlLCBpbiB0aGF0IGNhc2Ugd2UgcGF1c2UgaXQuXG4gICAgICAgICAgcGxheWVyLmZpbmlzaCgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXIuZmluaXNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBjYW5jZWwoKSB7XG4gICAgaWYgKCF0aGlzLnBsYXllcnNfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0UGxheVN0YXRlXyhXZWJBbmltYXRpb25QbGF5U3RhdGUuSURMRSk7XG4gICAgdGhpcy5wbGF5ZXJzXy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgIHBsYXllci5jYW5jZWwoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXZWJBbmltYXRpb25QbGF5U3RhdGV9IHBsYXlTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0UGxheVN0YXRlXyhwbGF5U3RhdGUpIHtcbiAgICBpZiAodGhpcy5wbGF5U3RhdGVfICE9IHBsYXlTdGF0ZSkge1xuICAgICAgdGhpcy5wbGF5U3RhdGVfID0gcGxheVN0YXRlO1xuICAgICAgdGhpcy5wbGF5U3RhdGVDaGFuZ2VkT2JzZXJ2YWJsZV8uZmlyZSh0aGlzLnBsYXlTdGF0ZV8pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRvdGFsIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcy5cbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRpbWVsaW5lIGlzIGluZmluaXRlLlxuICAgKi9cbiAgZ2V0VG90YWxEdXJhdGlvbl8oKSB7XG4gICAgcmV0dXJuIGdldFRvdGFsRHVyYXRpb24odGhpcy5yZXF1ZXN0c18pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/runners/native-web-animation-runner.js