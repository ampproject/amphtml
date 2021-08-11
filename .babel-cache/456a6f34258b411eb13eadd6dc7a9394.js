import { resolvedPromise as _resolvedPromise9 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise8 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

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
import { ActionTrust } from "../../../src/core/constants/action-constants";
import { Builder } from "./web-animations";
import { Pass } from "../../../src/pass";
import { Services } from "../../../src/service";
import { WebAnimationPlayState } from "./web-animation-types";
import { WebAnimationService } from "./web-animation-service";
import { clamp } from "../../../src/core/math";
import { dev, userAssert } from "../../../src/log";
import { getChildJsonConfig } from "../../../src/core/dom";
import { getDetail, listen } from "../../../src/event-helper";
import { installWebAnimationsIfNecessary } from "./install-polyfill";
import { isFiniteNumber } from "../../../src/core/types";
import { setInitialDisplay, setStyles, toggle } from "../../../src/core/dom/style";
var TAG = 'amp-animation';
export var AmpAnimation = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpAnimation, _AMP$BaseElement);

  var _super = _createSuper(AmpAnimation);

  /** @param {!AmpElement} element */
  function AmpAnimation(element) {
    var _this;

    _classCallCheck(this, AmpAnimation);

    _this = _super.call(this, element);

    /** @private {boolean} */
    _this.triggerOnVisibility_ = false;

    /** @private {boolean} */
    _this.isIntersecting_ = false;

    /** @private {boolean} */
    _this.visible_ = false;

    /** @private {boolean} */
    _this.pausedByAction_ = false;

    /** @private {boolean} */
    _this.triggered_ = false;

    /** @private {!Array<!UnlistenDef>} */
    _this.cleanups_ = [];

    /** @private {?JsonObject} */
    _this.configJson_ = null;

    /** @private {?./runners/animation-runner.AnimationRunner} */
    _this.runner_ = null;

    /** @private {?Promise} */
    _this.runnerPromise_ = null;

    /** @private {?Pass} */
    _this.restartPass_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpAnimation, [{
    key: "buildCallback",
    value: function buildCallback() {
      var _this2 = this;

      var ampdoc = this.getAmpDoc();
      // Trigger.
      var trigger = this.element.getAttribute('trigger');

      if (trigger) {
        this.triggerOnVisibility_ = userAssert(trigger == 'visibility', 'Only allowed value for "trigger" is "visibility": %s', this.element);
      }

      this.configJson_ = getChildJsonConfig(this.element);

      if (this.triggerOnVisibility_) {
        // Make the element minimally displayed to make sure that `layoutCallback`
        // is called.
        this.mutateElement(function () {
          setStyles(_this2.element, {
            visibility: 'hidden',
            top: '0px',
            left: '0px',
            width: '1px',
            height: '1px',
            position: 'fixed'
          });
          toggle(_this2.element, true);
          setInitialDisplay(_this2.element, 'block');
        });
      }

      // Restart with debounce.
      this.restartPass_ = new Pass(this.win, function () {
        if (!_this2.pausedByAction_) {
          _this2.startOrResume_();
        }
      },
      /* delay */
      50);
      // Visibility.
      this.cleanups_.push(ampdoc.onVisibilityChanged(function () {
        _this2.setVisible_(_this2.isIntersecting_ && ampdoc.isVisible());
      }));
      var io = new ampdoc.win.IntersectionObserver(function (records) {
        var isIntersecting = records[records.length - 1].isIntersecting;
        _this2.isIntersecting_ = isIntersecting;

        _this2.setVisible_(_this2.isIntersecting_ && ampdoc.isVisible());
      }, {
        threshold: 0.001
      });
      io.observe(dev().assertElement(this.element.parentElement));
      this.cleanups_.push(function () {
        return io.disconnect();
      });
      // Resize.
      this.cleanups_.push(listen(this.win, 'resize', function () {
        return _this2.onResize_();
      }));
      // Actions.
      this.registerDefaultAction(this.startAction_.bind(this), 'start', ActionTrust.LOW);
      this.registerAction('restart', this.restartAction_.bind(this), ActionTrust.LOW);
      this.registerAction('pause', this.pauseAction_.bind(this), ActionTrust.LOW);
      this.registerAction('resume', this.resumeAction_.bind(this), ActionTrust.LOW);
      this.registerAction('togglePause', this.togglePauseAction_.bind(this), ActionTrust.LOW);
      this.registerAction('seekTo', this.seekToAction_.bind(this), ActionTrust.LOW);
      this.registerAction('reverse', this.reverseAction_.bind(this), ActionTrust.LOW);
      this.registerAction('finish', this.finishAction_.bind(this), ActionTrust.LOW);
      this.registerAction('cancel', this.cancelAction_.bind(this), ActionTrust.LOW);
    }
    /** @override */

  }, {
    key: "detachedCallback",
    value: function detachedCallback() {
      var cleanups = this.cleanups_.slice(0);
      this.cleanups_.length = 0;
      cleanups.forEach(function (cleanup) {
        return cleanup();
      });
    }
    /**
     * Returns the animation spec.
     * @return {?JsonObject}
     */

  }, {
    key: "getAnimationSpec",
    value: function getAnimationSpec() {
      return (
        /** @type {?JsonObject} */
        this.configJson_
      );
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      if (this.triggerOnVisibility_) {
        this.startAction_();
      }

      return _resolvedPromise();
    }
    /** @override */

  }, {
    key: "pauseCallback",
    value: function pauseCallback() {
      this.setVisible_(false);
    }
    /**
     * @param {?../../../src/service/action-impl.ActionInvocation=} opt_invocation
     * @return {?Promise}
     * @private
     */

  }, {
    key: "startAction_",
    value: function startAction_(opt_invocation) {
      // The animation has been triggered, but there's no guarantee that it
      // will actually be running.
      this.triggered_ = true;

      if (this.visible_) {
        return this.startOrResume_(opt_invocation ? opt_invocation.args : null);
      }

      return _resolvedPromise2();
    }
    /**
     * @param {!../../../src/service/action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private
     */

  }, {
    key: "restartAction_",
    value: function restartAction_(invocation) {
      this.cancel_();
      // The animation has been triggered, but there's no guarantee that it
      // will actually be running.
      this.triggered_ = true;

      if (this.visible_) {
        return this.startOrResume_(invocation.args);
      }

      return _resolvedPromise3();
    }
    /**
     * @return {?Promise}
     * @private
     */

  }, {
    key: "pauseAction_",
    value: function pauseAction_() {
      var _this3 = this;

      if (!this.triggered_) {
        return _resolvedPromise4();
      }

      return this.createRunnerIfNeeded_().then(function () {
        _this3.pause_();

        _this3.pausedByAction_ = true;
      });
    }
    /**
     * @return {?Promise}
     * @private
     */

  }, {
    key: "resumeAction_",
    value: function resumeAction_() {
      var _this4 = this;

      if (!this.triggered_) {
        return _resolvedPromise5();
      }

      return this.createRunnerIfNeeded_().then(function () {
        if (_this4.visible_) {
          _this4.runner_.resume();

          _this4.pausedByAction_ = false;
        }
      });
    }
    /**
     * @return {?Promise}
     * @private
     */

  }, {
    key: "togglePauseAction_",
    value: function togglePauseAction_() {
      var _this5 = this;

      if (!this.triggered_) {
        return _resolvedPromise6();
      }

      return this.createRunnerIfNeeded_().then(function () {
        if (_this5.visible_) {
          if (_this5.runner_.getPlayState() == WebAnimationPlayState.PAUSED) {
            return _this5.startOrResume_();
          } else {
            _this5.pause_();

            _this5.pausedByAction_ = true;
          }
        }
      });
    }
    /**
     * @param {!../../../src/service/action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private
     */

  }, {
    key: "seekToAction_",
    value: function seekToAction_(invocation) {
      var _this6 = this;

      var positionObserverData = null;

      if (invocation.event) {
        var detail = getDetail(
        /** @type {!Event} */
        invocation.event);

        if (detail) {
          positionObserverData = detail['positionObserverData'] || null;
        }
      }

      return this.createRunnerIfNeeded_(null, positionObserverData).then(function () {
        // The animation will be triggered (in paused state) and seek will happen
        // regardless of visibility
        _this6.triggered_ = true;

        _this6.pause_();

        _this6.pausedByAction_ = true;
        // time based seek
        var time = parseFloat(invocation.args && invocation.args['time']);

        if (isFiniteNumber(time)) {
          _this6.runner_.seekTo(time);
        }

        // percent based seek
        var percent = parseFloat(invocation.args && invocation.args['percent']);

        if (isFiniteNumber(percent)) {
          _this6.runner_.seekToPercent(clamp(percent, 0, 1));
        }
      });
    }
    /**
     * @return {?Promise}
     * @private
     */

  }, {
    key: "reverseAction_",
    value: function reverseAction_() {
      var _this7 = this;

      if (!this.triggered_) {
        return _resolvedPromise7();
      }

      return this.createRunnerIfNeeded_().then(function () {
        if (_this7.visible_) {
          _this7.runner_.reverse();
        }
      });
    }
    /**
     * @return {?Promise}
     * @private
     */

  }, {
    key: "finishAction_",
    value: function finishAction_() {
      this.finish_();
      return _resolvedPromise8();
    }
    /**
     * @return {?Promise}
     * @private
     */

  }, {
    key: "cancelAction_",
    value: function cancelAction_() {
      this.cancel_();
      return _resolvedPromise9();
    }
    /**
     * @param {boolean} visible
     * @private
     */

  }, {
    key: "setVisible_",
    value: function setVisible_(visible) {
      if (this.visible_ != visible) {
        this.visible_ = visible;

        if (this.triggered_) {
          if (this.visible_) {
            if (!this.pausedByAction_) {
              this.startOrResume_();
            }
          } else {
            this.pause_();
          }
        }
      }
    }
    /** @private */

  }, {
    key: "onResize_",
    value: function onResize_() {
      // Store the previous `triggered` and `pausedByAction` value since
      // `cancel` may reset it.
      var pausedByAction = this.pausedByAction_,
          triggered = this.triggered_;

      // Stop animation right away.
      if (this.runner_) {
        this.runner_.cancel();
        this.runner_ = null;
        this.runnerPromise_ = null;
      }

      // Restart the animation, but debounce to avoid re-starting it multiple
      // times per restart.
      this.triggered_ = triggered;
      this.pausedByAction_ = pausedByAction;

      if (this.triggered_ && this.visible_) {
        this.restartPass_.schedule();
      }
    }
    /**
     * @param {?JsonObject=} opt_args
     * @return {?Promise}
     * @private
     */

  }, {
    key: "startOrResume_",
    value: function startOrResume_(opt_args) {
      var _this8 = this;

      if (!this.triggered_ || !this.visible_) {
        return null;
      }

      this.pausedByAction_ = false;

      if (this.runner_) {
        this.runner_.resume();
        return null;
      }

      return this.createRunnerIfNeeded_(opt_args).then(function () {
        _this8.runner_.start();
      });
    }
    /**
     * Creates the runner but animations will not start.
     * @param {?JsonObject=} opt_args
     * @param {?JsonObject=} opt_positionObserverData
     * @return {!Promise}
     * @private
     */

  }, {
    key: "createRunnerIfNeeded_",
    value: function createRunnerIfNeeded_(opt_args, opt_positionObserverData) {
      var _this9 = this;

      if (!this.runnerPromise_) {
        this.runnerPromise_ = this.createRunner_(opt_args, opt_positionObserverData).then(function (runner) {
          _this9.runner_ = runner;

          _this9.runner_.onPlayStateChanged(_this9.playStateChanged_.bind(_this9));

          _this9.runner_.init();
        });
      }

      return this.runnerPromise_;
    }
    /** @private */

  }, {
    key: "finish_",
    value: function finish_() {
      this.triggered_ = false;
      this.pausedByAction_ = false;

      if (this.runner_) {
        this.runner_.finish();
        this.runner_ = null;
        this.runnerPromise_ = null;
      }
    }
    /** @private */

  }, {
    key: "cancel_",
    value: function cancel_() {
      this.triggered_ = false;
      this.pausedByAction_ = false;

      if (this.runner_) {
        this.runner_.cancel();
        this.runner_ = null;
        this.runnerPromise_ = null;
      }
    }
    /**
     * @param {?JsonObject=} opt_args
     * @param {?JsonObject=} opt_positionObserverData
     * @return {!Promise<!./runners/animation-runner.AnimationRunner>}
     * @private
     */

  }, {
    key: "createRunner_",
    value: function createRunner_(opt_args, opt_positionObserverData) {
      var _this10 = this;

      // Force cast to `WebAnimationDef`. It will be validated during preparation
      // phase.
      var configJson =
      /** @type {!./web-animation-types.WebAnimationDef} */
      this.configJson_;
      var args =
      /** @type {?./web-animation-types.WebAnimationDef} */
      opt_args || null;
      // Ensure polyfill is installed.
      var ampdoc = this.getAmpDoc();
      var polyfillPromise = installWebAnimationsIfNecessary(ampdoc);
      var readyPromise = ampdoc.whenReady();
      var hostWin = this.win;
      var baseUrl = ampdoc.getUrl();
      return Promise.all([polyfillPromise, readyPromise]).then(function () {
        var builder = new Builder(hostWin, _this10.getRootNode_(), baseUrl, _this10.getVsync(), Services.ownersForDoc(_this10.element.getAmpDoc()));
        return builder.createRunner(configJson, args, opt_positionObserverData);
      });
    }
    /**
     * @return {!Document|!ShadowRoot}
     * @private
     */

  }, {
    key: "getRootNode_",
    value: function getRootNode_() {
      return this.getAmpDoc().getRootNode();
    }
    /** @private */

  }, {
    key: "pause_",
    value: function pause_() {
      if (this.runner_) {
        this.runner_.pause();
      }
    }
    /**
     * @param {!WebAnimationPlayState} playState
     * @private
     */

  }, {
    key: "playStateChanged_",
    value: function playStateChanged_(playState) {
      if (playState == WebAnimationPlayState.FINISHED) {
        this.finish_();
      }
    }
  }]);

  return AmpAnimation;
}(AMP.BaseElement);
AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerElement(TAG, AmpAnimation);
  AMP.registerServiceForDoc('web-animation', WebAnimationService);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hbmltYXRpb24uanMiXSwibmFtZXMiOlsiQWN0aW9uVHJ1c3QiLCJCdWlsZGVyIiwiUGFzcyIsIlNlcnZpY2VzIiwiV2ViQW5pbWF0aW9uUGxheVN0YXRlIiwiV2ViQW5pbWF0aW9uU2VydmljZSIsImNsYW1wIiwiZGV2IiwidXNlckFzc2VydCIsImdldENoaWxkSnNvbkNvbmZpZyIsImdldERldGFpbCIsImxpc3RlbiIsImluc3RhbGxXZWJBbmltYXRpb25zSWZOZWNlc3NhcnkiLCJpc0Zpbml0ZU51bWJlciIsInNldEluaXRpYWxEaXNwbGF5Iiwic2V0U3R5bGVzIiwidG9nZ2xlIiwiVEFHIiwiQW1wQW5pbWF0aW9uIiwiZWxlbWVudCIsInRyaWdnZXJPblZpc2liaWxpdHlfIiwiaXNJbnRlcnNlY3RpbmdfIiwidmlzaWJsZV8iLCJwYXVzZWRCeUFjdGlvbl8iLCJ0cmlnZ2VyZWRfIiwiY2xlYW51cHNfIiwiY29uZmlnSnNvbl8iLCJydW5uZXJfIiwicnVubmVyUHJvbWlzZV8iLCJyZXN0YXJ0UGFzc18iLCJhbXBkb2MiLCJnZXRBbXBEb2MiLCJ0cmlnZ2VyIiwiZ2V0QXR0cmlidXRlIiwibXV0YXRlRWxlbWVudCIsInZpc2liaWxpdHkiLCJ0b3AiLCJsZWZ0Iiwid2lkdGgiLCJoZWlnaHQiLCJwb3NpdGlvbiIsIndpbiIsInN0YXJ0T3JSZXN1bWVfIiwicHVzaCIsIm9uVmlzaWJpbGl0eUNoYW5nZWQiLCJzZXRWaXNpYmxlXyIsImlzVmlzaWJsZSIsImlvIiwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXIiLCJyZWNvcmRzIiwiaXNJbnRlcnNlY3RpbmciLCJsZW5ndGgiLCJ0aHJlc2hvbGQiLCJvYnNlcnZlIiwiYXNzZXJ0RWxlbWVudCIsInBhcmVudEVsZW1lbnQiLCJkaXNjb25uZWN0Iiwib25SZXNpemVfIiwicmVnaXN0ZXJEZWZhdWx0QWN0aW9uIiwic3RhcnRBY3Rpb25fIiwiYmluZCIsIkxPVyIsInJlZ2lzdGVyQWN0aW9uIiwicmVzdGFydEFjdGlvbl8iLCJwYXVzZUFjdGlvbl8iLCJyZXN1bWVBY3Rpb25fIiwidG9nZ2xlUGF1c2VBY3Rpb25fIiwic2Vla1RvQWN0aW9uXyIsInJldmVyc2VBY3Rpb25fIiwiZmluaXNoQWN0aW9uXyIsImNhbmNlbEFjdGlvbl8iLCJjbGVhbnVwcyIsInNsaWNlIiwiZm9yRWFjaCIsImNsZWFudXAiLCJvcHRfaW52b2NhdGlvbiIsImFyZ3MiLCJpbnZvY2F0aW9uIiwiY2FuY2VsXyIsImNyZWF0ZVJ1bm5lcklmTmVlZGVkXyIsInRoZW4iLCJwYXVzZV8iLCJyZXN1bWUiLCJnZXRQbGF5U3RhdGUiLCJQQVVTRUQiLCJwb3NpdGlvbk9ic2VydmVyRGF0YSIsImV2ZW50IiwiZGV0YWlsIiwidGltZSIsInBhcnNlRmxvYXQiLCJzZWVrVG8iLCJwZXJjZW50Iiwic2Vla1RvUGVyY2VudCIsInJldmVyc2UiLCJmaW5pc2hfIiwidmlzaWJsZSIsInBhdXNlZEJ5QWN0aW9uIiwidHJpZ2dlcmVkIiwiY2FuY2VsIiwic2NoZWR1bGUiLCJvcHRfYXJncyIsInN0YXJ0Iiwib3B0X3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhIiwiY3JlYXRlUnVubmVyXyIsInJ1bm5lciIsIm9uUGxheVN0YXRlQ2hhbmdlZCIsInBsYXlTdGF0ZUNoYW5nZWRfIiwiaW5pdCIsImZpbmlzaCIsImNvbmZpZ0pzb24iLCJwb2x5ZmlsbFByb21pc2UiLCJyZWFkeVByb21pc2UiLCJ3aGVuUmVhZHkiLCJob3N0V2luIiwiYmFzZVVybCIsImdldFVybCIsIlByb21pc2UiLCJhbGwiLCJidWlsZGVyIiwiZ2V0Um9vdE5vZGVfIiwiZ2V0VnN5bmMiLCJvd25lcnNGb3JEb2MiLCJjcmVhdGVSdW5uZXIiLCJnZXRSb290Tm9kZSIsInBhdXNlIiwicGxheVN0YXRlIiwiRklOSVNIRUQiLCJBTVAiLCJCYXNlRWxlbWVudCIsImV4dGVuc2lvbiIsInJlZ2lzdGVyRWxlbWVudCIsInJlZ2lzdGVyU2VydmljZUZvckRvYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7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LEdBQUcsQ0FBQ0csZUFBSixDQUFvQmpILEdBQXBCLEVBQXlCQyxZQUF6QjtBQUNBNkcsRUFBQUEsR0FBRyxDQUFDSSxxQkFBSixDQUEwQixlQUExQixFQUEyQzlILG1CQUEzQztBQUNELENBSEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtBY3Rpb25UcnVzdH0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2FjdGlvbi1jb25zdGFudHMnO1xuaW1wb3J0IHtCdWlsZGVyfSBmcm9tICcuL3dlYi1hbmltYXRpb25zJztcbmltcG9ydCB7UGFzc30gZnJvbSAnLi4vLi4vLi4vc3JjL3Bhc3MnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtXZWJBbmltYXRpb25QbGF5U3RhdGV9IGZyb20gJy4vd2ViLWFuaW1hdGlvbi10eXBlcyc7XG5pbXBvcnQge1dlYkFuaW1hdGlvblNlcnZpY2V9IGZyb20gJy4vd2ViLWFuaW1hdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7Y2xhbXB9IGZyb20gJyNjb3JlL21hdGgnO1xuaW1wb3J0IHtkZXYsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtnZXRDaGlsZEpzb25Db25maWd9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2dldERldGFpbCwgbGlzdGVufSBmcm9tICcuLi8uLi8uLi9zcmMvZXZlbnQtaGVscGVyJztcbmltcG9ydCB7aW5zdGFsbFdlYkFuaW1hdGlvbnNJZk5lY2Vzc2FyeX0gZnJvbSAnLi9pbnN0YWxsLXBvbHlmaWxsJztcbmltcG9ydCB7aXNGaW5pdGVOdW1iZXJ9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7c2V0SW5pdGlhbERpc3BsYXksIHNldFN0eWxlcywgdG9nZ2xlfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG5jb25zdCBUQUcgPSAnYW1wLWFuaW1hdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBBbXBBbmltYXRpb24gZXh0ZW5kcyBBTVAuQmFzZUVsZW1lbnQge1xuICAvKiogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudCAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy50cmlnZ2VyT25WaXNpYmlsaXR5XyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNJbnRlcnNlY3RpbmdfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy52aXNpYmxlXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMucGF1c2VkQnlBY3Rpb25fID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy50cmlnZ2VyZWRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTwhVW5saXN0ZW5EZWY+fSAqL1xuICAgIHRoaXMuY2xlYW51cHNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgez9Kc29uT2JqZWN0fSAqL1xuICAgIHRoaXMuY29uZmlnSnNvbl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li9ydW5uZXJzL2FuaW1hdGlvbi1ydW5uZXIuQW5pbWF0aW9uUnVubmVyfSAqL1xuICAgIHRoaXMucnVubmVyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlfSAqL1xuICAgIHRoaXMucnVubmVyUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UGFzc30gKi9cbiAgICB0aGlzLnJlc3RhcnRQYXNzXyA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ2FsbGJhY2soKSB7XG4gICAgY29uc3QgYW1wZG9jID0gdGhpcy5nZXRBbXBEb2MoKTtcblxuICAgIC8vIFRyaWdnZXIuXG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RyaWdnZXInKTtcbiAgICBpZiAodHJpZ2dlcikge1xuICAgICAgdGhpcy50cmlnZ2VyT25WaXNpYmlsaXR5XyA9IHVzZXJBc3NlcnQoXG4gICAgICAgIHRyaWdnZXIgPT0gJ3Zpc2liaWxpdHknLFxuICAgICAgICAnT25seSBhbGxvd2VkIHZhbHVlIGZvciBcInRyaWdnZXJcIiBpcyBcInZpc2liaWxpdHlcIjogJXMnLFxuICAgICAgICB0aGlzLmVsZW1lbnRcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5jb25maWdKc29uXyA9IGdldENoaWxkSnNvbkNvbmZpZyh0aGlzLmVsZW1lbnQpO1xuXG4gICAgaWYgKHRoaXMudHJpZ2dlck9uVmlzaWJpbGl0eV8pIHtcbiAgICAgIC8vIE1ha2UgdGhlIGVsZW1lbnQgbWluaW1hbGx5IGRpc3BsYXllZCB0byBtYWtlIHN1cmUgdGhhdCBgbGF5b3V0Q2FsbGJhY2tgXG4gICAgICAvLyBpcyBjYWxsZWQuXG4gICAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICBzZXRTdHlsZXModGhpcy5lbGVtZW50LCB7XG4gICAgICAgICAgdmlzaWJpbGl0eTogJ2hpZGRlbicsXG4gICAgICAgICAgdG9wOiAnMHB4JyxcbiAgICAgICAgICBsZWZ0OiAnMHB4JyxcbiAgICAgICAgICB3aWR0aDogJzFweCcsXG4gICAgICAgICAgaGVpZ2h0OiAnMXB4JyxcbiAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHRvZ2dsZSh0aGlzLmVsZW1lbnQsIHRydWUpO1xuICAgICAgICBzZXRJbml0aWFsRGlzcGxheSh0aGlzLmVsZW1lbnQsICdibG9jaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gUmVzdGFydCB3aXRoIGRlYm91bmNlLlxuICAgIHRoaXMucmVzdGFydFBhc3NfID0gbmV3IFBhc3MoXG4gICAgICB0aGlzLndpbixcbiAgICAgICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnBhdXNlZEJ5QWN0aW9uXykge1xuICAgICAgICAgIHRoaXMuc3RhcnRPclJlc3VtZV8oKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8qIGRlbGF5ICovIDUwXG4gICAgKTtcblxuICAgIC8vIFZpc2liaWxpdHkuXG4gICAgdGhpcy5jbGVhbnVwc18ucHVzaChcbiAgICAgIGFtcGRvYy5vblZpc2liaWxpdHlDaGFuZ2VkKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRWaXNpYmxlXyh0aGlzLmlzSW50ZXJzZWN0aW5nXyAmJiBhbXBkb2MuaXNWaXNpYmxlKCkpO1xuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IGlvID0gbmV3IGFtcGRvYy53aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoXG4gICAgICAocmVjb3JkcykgPT4ge1xuICAgICAgICBjb25zdCB7aXNJbnRlcnNlY3Rpbmd9ID0gcmVjb3Jkc1tyZWNvcmRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLmlzSW50ZXJzZWN0aW5nXyA9IGlzSW50ZXJzZWN0aW5nO1xuICAgICAgICB0aGlzLnNldFZpc2libGVfKHRoaXMuaXNJbnRlcnNlY3RpbmdfICYmIGFtcGRvYy5pc1Zpc2libGUoKSk7XG4gICAgICB9LFxuICAgICAge3RocmVzaG9sZDogMC4wMDF9XG4gICAgKTtcbiAgICBpby5vYnNlcnZlKGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQpKTtcbiAgICB0aGlzLmNsZWFudXBzXy5wdXNoKCgpID0+IGlvLmRpc2Nvbm5lY3QoKSk7XG5cbiAgICAvLyBSZXNpemUuXG4gICAgdGhpcy5jbGVhbnVwc18ucHVzaChsaXN0ZW4odGhpcy53aW4sICdyZXNpemUnLCAoKSA9PiB0aGlzLm9uUmVzaXplXygpKSk7XG5cbiAgICAvLyBBY3Rpb25zLlxuICAgIHRoaXMucmVnaXN0ZXJEZWZhdWx0QWN0aW9uKFxuICAgICAgdGhpcy5zdGFydEFjdGlvbl8uYmluZCh0aGlzKSxcbiAgICAgICdzdGFydCcsXG4gICAgICBBY3Rpb25UcnVzdC5MT1dcbiAgICApO1xuICAgIHRoaXMucmVnaXN0ZXJBY3Rpb24oXG4gICAgICAncmVzdGFydCcsXG4gICAgICB0aGlzLnJlc3RhcnRBY3Rpb25fLmJpbmQodGhpcyksXG4gICAgICBBY3Rpb25UcnVzdC5MT1dcbiAgICApO1xuICAgIHRoaXMucmVnaXN0ZXJBY3Rpb24oJ3BhdXNlJywgdGhpcy5wYXVzZUFjdGlvbl8uYmluZCh0aGlzKSwgQWN0aW9uVHJ1c3QuTE9XKTtcbiAgICB0aGlzLnJlZ2lzdGVyQWN0aW9uKFxuICAgICAgJ3Jlc3VtZScsXG4gICAgICB0aGlzLnJlc3VtZUFjdGlvbl8uYmluZCh0aGlzKSxcbiAgICAgIEFjdGlvblRydXN0LkxPV1xuICAgICk7XG4gICAgdGhpcy5yZWdpc3RlckFjdGlvbihcbiAgICAgICd0b2dnbGVQYXVzZScsXG4gICAgICB0aGlzLnRvZ2dsZVBhdXNlQWN0aW9uXy5iaW5kKHRoaXMpLFxuICAgICAgQWN0aW9uVHJ1c3QuTE9XXG4gICAgKTtcbiAgICB0aGlzLnJlZ2lzdGVyQWN0aW9uKFxuICAgICAgJ3NlZWtUbycsXG4gICAgICB0aGlzLnNlZWtUb0FjdGlvbl8uYmluZCh0aGlzKSxcbiAgICAgIEFjdGlvblRydXN0LkxPV1xuICAgICk7XG4gICAgdGhpcy5yZWdpc3RlckFjdGlvbihcbiAgICAgICdyZXZlcnNlJyxcbiAgICAgIHRoaXMucmV2ZXJzZUFjdGlvbl8uYmluZCh0aGlzKSxcbiAgICAgIEFjdGlvblRydXN0LkxPV1xuICAgICk7XG4gICAgdGhpcy5yZWdpc3RlckFjdGlvbihcbiAgICAgICdmaW5pc2gnLFxuICAgICAgdGhpcy5maW5pc2hBY3Rpb25fLmJpbmQodGhpcyksXG4gICAgICBBY3Rpb25UcnVzdC5MT1dcbiAgICApO1xuICAgIHRoaXMucmVnaXN0ZXJBY3Rpb24oXG4gICAgICAnY2FuY2VsJyxcbiAgICAgIHRoaXMuY2FuY2VsQWN0aW9uXy5iaW5kKHRoaXMpLFxuICAgICAgQWN0aW9uVHJ1c3QuTE9XXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZGV0YWNoZWRDYWxsYmFjaygpIHtcbiAgICBjb25zdCBjbGVhbnVwcyA9IHRoaXMuY2xlYW51cHNfLnNsaWNlKDApO1xuICAgIHRoaXMuY2xlYW51cHNfLmxlbmd0aCA9IDA7XG4gICAgY2xlYW51cHMuZm9yRWFjaCgoY2xlYW51cCkgPT4gY2xlYW51cCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhbmltYXRpb24gc3BlYy5cbiAgICogQHJldHVybiB7P0pzb25PYmplY3R9XG4gICAqL1xuICBnZXRBbmltYXRpb25TcGVjKCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgez9Kc29uT2JqZWN0fSAqLyAodGhpcy5jb25maWdKc29uXyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGxheW91dENhbGxiYWNrKCkge1xuICAgIGlmICh0aGlzLnRyaWdnZXJPblZpc2liaWxpdHlfKSB7XG4gICAgICB0aGlzLnN0YXJ0QWN0aW9uXygpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHBhdXNlQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5zZXRWaXNpYmxlXyhmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHs/Li4vLi4vLi4vc3JjL3NlcnZpY2UvYWN0aW9uLWltcGwuQWN0aW9uSW52b2NhdGlvbj19IG9wdF9pbnZvY2F0aW9uXG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnRBY3Rpb25fKG9wdF9pbnZvY2F0aW9uKSB7XG4gICAgLy8gVGhlIGFuaW1hdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWQsIGJ1dCB0aGVyZSdzIG5vIGd1YXJhbnRlZSB0aGF0IGl0XG4gICAgLy8gd2lsbCBhY3R1YWxseSBiZSBydW5uaW5nLlxuICAgIHRoaXMudHJpZ2dlcmVkXyA9IHRydWU7XG4gICAgaWYgKHRoaXMudmlzaWJsZV8pIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0T3JSZXN1bWVfKG9wdF9pbnZvY2F0aW9uID8gb3B0X2ludm9jYXRpb24uYXJncyA6IG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYWN0aW9uLWltcGwuQWN0aW9uSW52b2NhdGlvbn0gaW52b2NhdGlvblxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlc3RhcnRBY3Rpb25fKGludm9jYXRpb24pIHtcbiAgICB0aGlzLmNhbmNlbF8oKTtcbiAgICAvLyBUaGUgYW5pbWF0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZCwgYnV0IHRoZXJlJ3Mgbm8gZ3VhcmFudGVlIHRoYXQgaXRcbiAgICAvLyB3aWxsIGFjdHVhbGx5IGJlIHJ1bm5pbmcuXG4gICAgdGhpcy50cmlnZ2VyZWRfID0gdHJ1ZTtcbiAgICBpZiAodGhpcy52aXNpYmxlXykge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcnRPclJlc3VtZV8oaW52b2NhdGlvbi5hcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcGF1c2VBY3Rpb25fKCkge1xuICAgIGlmICghdGhpcy50cmlnZ2VyZWRfKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyZWF0ZVJ1bm5lcklmTmVlZGVkXygpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5wYXVzZV8oKTtcbiAgICAgIHRoaXMucGF1c2VkQnlBY3Rpb25fID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlc3VtZUFjdGlvbl8oKSB7XG4gICAgaWYgKCF0aGlzLnRyaWdnZXJlZF8pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlUnVubmVySWZOZWVkZWRfKCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy52aXNpYmxlXykge1xuICAgICAgICB0aGlzLnJ1bm5lcl8ucmVzdW1lKCk7XG4gICAgICAgIHRoaXMucGF1c2VkQnlBY3Rpb25fID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7P1Byb21pc2V9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0b2dnbGVQYXVzZUFjdGlvbl8oKSB7XG4gICAgaWYgKCF0aGlzLnRyaWdnZXJlZF8pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlUnVubmVySWZOZWVkZWRfKCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy52aXNpYmxlXykge1xuICAgICAgICBpZiAodGhpcy5ydW5uZXJfLmdldFBsYXlTdGF0ZSgpID09IFdlYkFuaW1hdGlvblBsYXlTdGF0ZS5QQVVTRUQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydE9yUmVzdW1lXygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucGF1c2VfKCk7XG4gICAgICAgICAgdGhpcy5wYXVzZWRCeUFjdGlvbl8gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYWN0aW9uLWltcGwuQWN0aW9uSW52b2NhdGlvbn0gaW52b2NhdGlvblxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNlZWtUb0FjdGlvbl8oaW52b2NhdGlvbikge1xuICAgIGxldCBwb3NpdGlvbk9ic2VydmVyRGF0YSA9IG51bGw7XG4gICAgaWYgKGludm9jYXRpb24uZXZlbnQpIHtcbiAgICAgIGNvbnN0IGRldGFpbCA9IGdldERldGFpbCgvKiogQHR5cGUgeyFFdmVudH0gKi8gKGludm9jYXRpb24uZXZlbnQpKTtcbiAgICAgIGlmIChkZXRhaWwpIHtcbiAgICAgICAgcG9zaXRpb25PYnNlcnZlckRhdGEgPSBkZXRhaWxbJ3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhJ10gfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jcmVhdGVSdW5uZXJJZk5lZWRlZF8obnVsbCwgcG9zaXRpb25PYnNlcnZlckRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gVGhlIGFuaW1hdGlvbiB3aWxsIGJlIHRyaWdnZXJlZCAoaW4gcGF1c2VkIHN0YXRlKSBhbmQgc2VlayB3aWxsIGhhcHBlblxuICAgICAgLy8gcmVnYXJkbGVzcyBvZiB2aXNpYmlsaXR5XG4gICAgICB0aGlzLnRyaWdnZXJlZF8gPSB0cnVlO1xuICAgICAgdGhpcy5wYXVzZV8oKTtcbiAgICAgIHRoaXMucGF1c2VkQnlBY3Rpb25fID0gdHJ1ZTtcbiAgICAgIC8vIHRpbWUgYmFzZWQgc2Vla1xuICAgICAgY29uc3QgdGltZSA9IHBhcnNlRmxvYXQoaW52b2NhdGlvbi5hcmdzICYmIGludm9jYXRpb24uYXJnc1sndGltZSddKTtcbiAgICAgIGlmIChpc0Zpbml0ZU51bWJlcih0aW1lKSkge1xuICAgICAgICB0aGlzLnJ1bm5lcl8uc2Vla1RvKHRpbWUpO1xuICAgICAgfVxuICAgICAgLy8gcGVyY2VudCBiYXNlZCBzZWVrXG4gICAgICBjb25zdCBwZXJjZW50ID0gcGFyc2VGbG9hdChpbnZvY2F0aW9uLmFyZ3MgJiYgaW52b2NhdGlvbi5hcmdzWydwZXJjZW50J10pO1xuICAgICAgaWYgKGlzRmluaXRlTnVtYmVyKHBlcmNlbnQpKSB7XG4gICAgICAgIHRoaXMucnVubmVyXy5zZWVrVG9QZXJjZW50KGNsYW1wKHBlcmNlbnQsIDAsIDEpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJldmVyc2VBY3Rpb25fKCkge1xuICAgIGlmICghdGhpcy50cmlnZ2VyZWRfKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyZWF0ZVJ1bm5lcklmTmVlZGVkXygpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudmlzaWJsZV8pIHtcbiAgICAgICAgdGhpcy5ydW5uZXJfLnJldmVyc2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZpbmlzaEFjdGlvbl8oKSB7XG4gICAgdGhpcy5maW5pc2hfKCk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2FuY2VsQWN0aW9uXygpIHtcbiAgICB0aGlzLmNhbmNlbF8oKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSB2aXNpYmxlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZXRWaXNpYmxlXyh2aXNpYmxlKSB7XG4gICAgaWYgKHRoaXMudmlzaWJsZV8gIT0gdmlzaWJsZSkge1xuICAgICAgdGhpcy52aXNpYmxlXyA9IHZpc2libGU7XG4gICAgICBpZiAodGhpcy50cmlnZ2VyZWRfKSB7XG4gICAgICAgIGlmICh0aGlzLnZpc2libGVfKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLnBhdXNlZEJ5QWN0aW9uXykge1xuICAgICAgICAgICAgdGhpcy5zdGFydE9yUmVzdW1lXygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnBhdXNlXygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIG9uUmVzaXplXygpIHtcbiAgICAvLyBTdG9yZSB0aGUgcHJldmlvdXMgYHRyaWdnZXJlZGAgYW5kIGBwYXVzZWRCeUFjdGlvbmAgdmFsdWUgc2luY2VcbiAgICAvLyBgY2FuY2VsYCBtYXkgcmVzZXQgaXQuXG4gICAgY29uc3Qge3BhdXNlZEJ5QWN0aW9uXzogcGF1c2VkQnlBY3Rpb24sIHRyaWdnZXJlZF86IHRyaWdnZXJlZH0gPSB0aGlzO1xuXG4gICAgLy8gU3RvcCBhbmltYXRpb24gcmlnaHQgYXdheS5cbiAgICBpZiAodGhpcy5ydW5uZXJfKSB7XG4gICAgICB0aGlzLnJ1bm5lcl8uY2FuY2VsKCk7XG4gICAgICB0aGlzLnJ1bm5lcl8gPSBudWxsO1xuICAgICAgdGhpcy5ydW5uZXJQcm9taXNlXyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVzdGFydCB0aGUgYW5pbWF0aW9uLCBidXQgZGVib3VuY2UgdG8gYXZvaWQgcmUtc3RhcnRpbmcgaXQgbXVsdGlwbGVcbiAgICAvLyB0aW1lcyBwZXIgcmVzdGFydC5cbiAgICB0aGlzLnRyaWdnZXJlZF8gPSB0cmlnZ2VyZWQ7XG4gICAgdGhpcy5wYXVzZWRCeUFjdGlvbl8gPSBwYXVzZWRCeUFjdGlvbjtcbiAgICBpZiAodGhpcy50cmlnZ2VyZWRfICYmIHRoaXMudmlzaWJsZV8pIHtcbiAgICAgIHRoaXMucmVzdGFydFBhc3NfLnNjaGVkdWxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7P0pzb25PYmplY3Q9fSBvcHRfYXJnc1xuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXJ0T3JSZXN1bWVfKG9wdF9hcmdzKSB7XG4gICAgaWYgKCF0aGlzLnRyaWdnZXJlZF8gfHwgIXRoaXMudmlzaWJsZV8pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRoaXMucGF1c2VkQnlBY3Rpb25fID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5ydW5uZXJfKSB7XG4gICAgICB0aGlzLnJ1bm5lcl8ucmVzdW1lKCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jcmVhdGVSdW5uZXJJZk5lZWRlZF8ob3B0X2FyZ3MpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5ydW5uZXJfLnN0YXJ0KCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgcnVubmVyIGJ1dCBhbmltYXRpb25zIHdpbGwgbm90IHN0YXJ0LlxuICAgKiBAcGFyYW0gez9Kc29uT2JqZWN0PX0gb3B0X2FyZ3NcbiAgICogQHBhcmFtIHs/SnNvbk9iamVjdD19IG9wdF9wb3NpdGlvbk9ic2VydmVyRGF0YVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZVJ1bm5lcklmTmVlZGVkXyhvcHRfYXJncywgb3B0X3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5lclByb21pc2VfKSB7XG4gICAgICB0aGlzLnJ1bm5lclByb21pc2VfID0gdGhpcy5jcmVhdGVSdW5uZXJfKFxuICAgICAgICBvcHRfYXJncyxcbiAgICAgICAgb3B0X3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhXG4gICAgICApLnRoZW4oKHJ1bm5lcikgPT4ge1xuICAgICAgICB0aGlzLnJ1bm5lcl8gPSBydW5uZXI7XG4gICAgICAgIHRoaXMucnVubmVyXy5vblBsYXlTdGF0ZUNoYW5nZWQodGhpcy5wbGF5U3RhdGVDaGFuZ2VkXy5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5ydW5uZXJfLmluaXQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJ1bm5lclByb21pc2VfO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGZpbmlzaF8oKSB7XG4gICAgdGhpcy50cmlnZ2VyZWRfID0gZmFsc2U7XG4gICAgdGhpcy5wYXVzZWRCeUFjdGlvbl8gPSBmYWxzZTtcbiAgICBpZiAodGhpcy5ydW5uZXJfKSB7XG4gICAgICB0aGlzLnJ1bm5lcl8uZmluaXNoKCk7XG4gICAgICB0aGlzLnJ1bm5lcl8gPSBudWxsO1xuICAgICAgdGhpcy5ydW5uZXJQcm9taXNlXyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGNhbmNlbF8oKSB7XG4gICAgdGhpcy50cmlnZ2VyZWRfID0gZmFsc2U7XG4gICAgdGhpcy5wYXVzZWRCeUFjdGlvbl8gPSBmYWxzZTtcbiAgICBpZiAodGhpcy5ydW5uZXJfKSB7XG4gICAgICB0aGlzLnJ1bm5lcl8uY2FuY2VsKCk7XG4gICAgICB0aGlzLnJ1bm5lcl8gPSBudWxsO1xuICAgICAgdGhpcy5ydW5uZXJQcm9taXNlXyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7P0pzb25PYmplY3Q9fSBvcHRfYXJnc1xuICAgKiBAcGFyYW0gez9Kc29uT2JqZWN0PX0gb3B0X3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCEuL3J1bm5lcnMvYW5pbWF0aW9uLXJ1bm5lci5BbmltYXRpb25SdW5uZXI+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlUnVubmVyXyhvcHRfYXJncywgb3B0X3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhKSB7XG4gICAgLy8gRm9yY2UgY2FzdCB0byBgV2ViQW5pbWF0aW9uRGVmYC4gSXQgd2lsbCBiZSB2YWxpZGF0ZWQgZHVyaW5nIHByZXBhcmF0aW9uXG4gICAgLy8gcGhhc2UuXG4gICAgY29uc3QgY29uZmlnSnNvbiA9IC8qKiBAdHlwZSB7IS4vd2ViLWFuaW1hdGlvbi10eXBlcy5XZWJBbmltYXRpb25EZWZ9ICovIChcbiAgICAgIHRoaXMuY29uZmlnSnNvbl9cbiAgICApO1xuICAgIGNvbnN0IGFyZ3MgPSAvKiogQHR5cGUgez8uL3dlYi1hbmltYXRpb24tdHlwZXMuV2ViQW5pbWF0aW9uRGVmfSAqLyAoXG4gICAgICBvcHRfYXJncyB8fCBudWxsXG4gICAgKTtcblxuICAgIC8vIEVuc3VyZSBwb2x5ZmlsbCBpcyBpbnN0YWxsZWQuXG4gICAgY29uc3QgYW1wZG9jID0gdGhpcy5nZXRBbXBEb2MoKTtcbiAgICBjb25zdCBwb2x5ZmlsbFByb21pc2UgPSBpbnN0YWxsV2ViQW5pbWF0aW9uc0lmTmVjZXNzYXJ5KGFtcGRvYyk7XG4gICAgY29uc3QgcmVhZHlQcm9taXNlID0gYW1wZG9jLndoZW5SZWFkeSgpO1xuICAgIGNvbnN0IGhvc3RXaW4gPSB0aGlzLndpbjtcbiAgICBjb25zdCBiYXNlVXJsID0gYW1wZG9jLmdldFVybCgpO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbcG9seWZpbGxQcm9taXNlLCByZWFkeVByb21pc2VdKS50aGVuKCgpID0+IHtcbiAgICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgQnVpbGRlcihcbiAgICAgICAgaG9zdFdpbixcbiAgICAgICAgdGhpcy5nZXRSb290Tm9kZV8oKSxcbiAgICAgICAgYmFzZVVybCxcbiAgICAgICAgdGhpcy5nZXRWc3luYygpLFxuICAgICAgICBTZXJ2aWNlcy5vd25lcnNGb3JEb2ModGhpcy5lbGVtZW50LmdldEFtcERvYygpKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBidWlsZGVyLmNyZWF0ZVJ1bm5lcihjb25maWdKc29uLCBhcmdzLCBvcHRfcG9zaXRpb25PYnNlcnZlckRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFEb2N1bWVudHwhU2hhZG93Um9vdH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFJvb3ROb2RlXygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbXBEb2MoKS5nZXRSb290Tm9kZSgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHBhdXNlXygpIHtcbiAgICBpZiAodGhpcy5ydW5uZXJfKSB7XG4gICAgICB0aGlzLnJ1bm5lcl8ucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2ViQW5pbWF0aW9uUGxheVN0YXRlfSBwbGF5U3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHBsYXlTdGF0ZUNoYW5nZWRfKHBsYXlTdGF0ZSkge1xuICAgIGlmIChwbGF5U3RhdGUgPT0gV2ViQW5pbWF0aW9uUGxheVN0YXRlLkZJTklTSEVEKSB7XG4gICAgICB0aGlzLmZpbmlzaF8oKTtcbiAgICB9XG4gIH1cbn1cblxuQU1QLmV4dGVuc2lvbihUQUcsICcwLjEnLCBmdW5jdGlvbiAoQU1QKSB7XG4gIEFNUC5yZWdpc3RlckVsZW1lbnQoVEFHLCBBbXBBbmltYXRpb24pO1xuICBBTVAucmVnaXN0ZXJTZXJ2aWNlRm9yRG9jKCd3ZWItYW5pbWF0aW9uJywgV2ViQW5pbWF0aW9uU2VydmljZSk7XG59KTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/amp-animation.js