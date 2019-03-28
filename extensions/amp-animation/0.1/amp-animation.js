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

import {ActionTrust} from '../../../src/action-constants';
import {Builder} from './web-animations';
import {Pass} from '../../../src/pass';
import {Services} from '../../../src/services';
import {WebAnimationPlayState} from './web-animation-types';
import {WebAnimationService} from './web-animation-service';
import {childElementByTag} from '../../../src/dom';
import {clamp} from '../../../src/utils/math';
import {getDetail, listen} from '../../../src/event-helper';
import {getFriendlyIframeEmbedOptional}
  from '../../../src/friendly-iframe-embed';
import {getParentWindowFrameElement} from '../../../src/service';
import {installWebAnimationsIfNecessary} from './web-animations-polyfill';
import {isFiniteNumber} from '../../../src/types';
import {setInitialDisplay, setStyles, toggle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {user, userAssert} from '../../../src/log';

const TAG = 'amp-animation';


export class AmpAnimation extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.triggerOnVisibility_ = false;

    /** @private {boolean} */
    this.visible_ = false;

    /** @private {boolean} */
    this.pausedByAction_ = false;

    /** @private {boolean} */
    this.triggered_ = false;

    /** @private {?../../../src/friendly-iframe-embed.FriendlyIframeEmbed} */
    this.embed_ = null;

    /** @private {?JsonObject} */
    this.configJson_ = null;

    /** @private {?./runners/animation-runner.AnimationRunner} */
    this.runner_ = null;

    /** @private {?Promise} */
    this.runnerPromise_ = null;

    /** @private {?Pass} */
    this.restartPass_ = null;
  }

  /** @override */
  buildCallback() {
    const ampdoc = this.getAmpDoc();

    // Trigger.
    const trigger = this.element.getAttribute('trigger');
    if (trigger) {
      this.triggerOnVisibility_ = userAssert(
          trigger == 'visibility',
          'Only allowed value for "trigger" is "visibility": %s',
          this.element);
    }

    // TODO(dvoytenko): Remove once we support direct parent visibility.
    if (trigger == 'visibility') {
      userAssert(
          this.element.parentNode == this.element.ownerDocument.body ||
          this.element.parentNode == ampdoc.getBody(),
          '%s is only allowed as a direct child of <body> element when trigger'
          + ' is visibility. This restriction will be removed soon.', TAG);
    }

    // Parse config.
    const scriptElement = userAssert(
        childElementByTag(this.element, 'script'),
        '"<script type=application/json>" must be present');
    this.configJson_ = /** @type {?JsonObject} */ (
      tryParseJson(scriptElement.textContent, error => {
        throw user().createError('failed to parse animation script', error);
      })
    );

    if (this.triggerOnVisibility_) {
      // Make the element minimally displayed to make sure that `layoutCallback`
      // is called.
      this.mutateElement(() => {
        setStyles(this.element, {
          visibility: 'hidden',
          top: '0px',
          left: '0px',
          width: '1px',
          height: '1px',
          position: 'fixed',
        });
        toggle(this.element, true);
        setInitialDisplay(this.element, 'block');
      });
    }

    // Restart with debounce.
    this.restartPass_ = new Pass(
        this.win,
        () => {
          if (!this.pausedByAction_) {
            this.startOrResume_();
          }
        },
        /* delay */ 50);

    // Visibility.
    const frameElement = getParentWindowFrameElement(this.element, ampdoc.win);
    const embed =
        frameElement ? getFriendlyIframeEmbedOptional(frameElement) : null;
    if (embed) {
      this.embed_ = embed;
      this.setVisible_(embed.isVisible());
      embed.onVisibilityChanged(() => {
        this.setVisible_(embed.isVisible());
      });
      listen(this.embed_.win, 'resize', () => this.onResize_());
    } else {
      const viewer = Services.viewerForDoc(ampdoc);
      this.setVisible_(viewer.isVisible());
      viewer.onVisibilityChanged(() => {
        this.setVisible_(viewer.isVisible());
      });
      this.getViewport().onResize(e => {
        if (e.relayoutAll) {
          this.onResize_();
        }
      });
    }

    // Actions.
    this.registerDefaultAction(
        this.startAction_.bind(this),
        'start',
        ActionTrust.LOW);
    this.registerAction('restart',
        this.restartAction_.bind(this), ActionTrust.LOW);
    this.registerAction('pause',
        this.pauseAction_.bind(this), ActionTrust.LOW);
    this.registerAction('resume',
        this.resumeAction_.bind(this), ActionTrust.LOW);
    this.registerAction('togglePause',
        this.togglePauseAction_.bind(this), ActionTrust.LOW);
    this.registerAction('seekTo',
        this.seekToAction_.bind(this), ActionTrust.LOW);
    this.registerAction('reverse',
        this.reverseAction_.bind(this), ActionTrust.LOW);
    this.registerAction('finish',
        this.finishAction_.bind(this), ActionTrust.LOW);
    this.registerAction('cancel',
        this.cancelAction_.bind(this), ActionTrust.LOW);
  }

  /**
   * Returns the animation spec.
   * @return {?JsonObject}
   */
  getAnimationSpec() {
    return /** @type {?JsonObject} */ (this.configJson_);
  }

  /** @override */
  layoutCallback() {
    if (this.triggerOnVisibility_) {
      this.startAction_();
    }
    return Promise.resolve();
  }

  /** @override */
  pauseCallback() {
    this.setVisible_(false);
  }

  /**
   * @param {?../../../src/service/action-impl.ActionInvocation=} opt_invocation
   * @return {?Promise}
   * @private
   * @visibleForTesting
   */
  startAction_(opt_invocation) {
    // The animation has been triggered, but there's no guarantee that it
    // will actually be running.
    this.triggered_ = true;
    if (this.visible_) {
      return this.startOrResume_(opt_invocation ? opt_invocation.args : null);
    }
    return Promise.resolve();
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  restartAction_(invocation) {
    this.cancel_();
    // The animation has been triggered, but there's no guarantee that it
    // will actually be running.
    this.triggered_ = true;
    if (this.visible_) {
      return this.startOrResume_(invocation.args);
    }
    return Promise.resolve();
  }

  /**
   * @return {?Promise}
   * @private
   */
  pauseAction_() {
    if (!this.triggered_) {
      return Promise.resolve();
    }
    return this.createRunnerIfNeeded_().then(() => {
      this.pause_();
      this.pausedByAction_ = true;
    });
  }

  /**
   * @return {?Promise}
   * @private
   */
  resumeAction_() {
    if (!this.triggered_) {
      return Promise.resolve();
    }
    return this.createRunnerIfNeeded_().then(() => {
      if (this.visible_) {
        this.runner_.resume();
        this.pausedByAction_ = false;
      }
    });
  }

  /**
   * @return {?Promise}
   * @private
   */
  togglePauseAction_() {
    if (!this.triggered_) {
      return Promise.resolve();
    }
    return this.createRunnerIfNeeded_().then(() => {
      if (this.visible_) {
        if (this.runner_.getPlayState() == WebAnimationPlayState.PAUSED) {
          return this.startOrResume_();
        } else {
          this.pause_();
          this.pausedByAction_ = true;
        }
      }
    });
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  seekToAction_(invocation) {
    // The animation will be triggered (in paused state) and seek will happen
    // regardless of visibility
    this.triggered_ = true;

    let positionObserverData = null;
    if (invocation.event) {
      const detail = getDetail(/** @type {!Event} */(invocation.event));
      if (detail) {
        positionObserverData = detail['positionObserverData'] || null;
      }
    }

    return this.createRunnerIfNeeded_(null, positionObserverData).then(() => {
      this.pause_();
      this.pausedByAction_ = true;
      // time based seek
      const time = parseFloat(invocation.args && invocation.args['time']);
      if (isFiniteNumber(time)) {
        this.runner_.seekTo(time);
      }
      // percent based seek
      const percent = parseFloat(invocation.args && invocation.args['percent']);
      if (isFiniteNumber(percent)) {
        this.runner_.seekToPercent(clamp(percent, 0, 1));
      }
    });
  }

  /**
   * @return {?Promise}
   * @private
   */
  reverseAction_() {
    if (!this.triggered_) {
      return Promise.resolve();
    }
    return this.createRunnerIfNeeded_().then(() => {
      if (this.visible_) {
        this.runner_.reverse();
      }
    });
  }

  /**
   * @return {?Promise}
   * @private
   */
  finishAction_() {
    this.finish_();
    return Promise.resolve();
  }

  /**
   * @return {?Promise}
   * @private
   */
  cancelAction_() {
    this.cancel_();
    return Promise.resolve();
  }

  /**
   * @param {boolean} visible
   * @private
   */
  setVisible_(visible) {
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
  onResize_() {
    // Store the previous `triggered` and `pausedByAction` value since
    // `cancel` may reset it.
    const {triggered_: triggered, pausedByAction_: pausedByAction} = this;

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
  startOrResume_(opt_args) {
    if (!this.triggered_ || !this.visible_) {
      return null;
    }

    this.pausedByAction_ = false;

    if (this.runner_) {
      this.runner_.resume();
      return null;
    }

    return this.createRunnerIfNeeded_(opt_args).then(() => {
      this.runner_.start();
    });
  }

  /**
   * Creates the runner but animations will not start.
   * @param {?JsonObject=} opt_args
   * @param {?JsonObject=} opt_positionObserverData
   * @return {!Promise}
   * @private
   */
  createRunnerIfNeeded_(opt_args, opt_positionObserverData) {
    if (!this.runnerPromise_) {
      this.runnerPromise_ = this.createRunner_(
          opt_args, opt_positionObserverData).then(runner => {
        this.runner_ = runner;
        this.runner_.onPlayStateChanged(this.playStateChanged_.bind(this));
        this.runner_.init();
      });
    }

    return this.runnerPromise_;
  }

  /** @private */
  finish_() {
    this.triggered_ = false;
    this.pausedByAction_ = false;
    if (this.runner_) {
      this.runner_.finish();
      this.runner_ = null;
      this.runnerPromise_ = null;
    }
  }

  /** @private */
  cancel_() {
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
  createRunner_(opt_args, opt_positionObserverData) {
    // Force cast to `WebAnimationDef`. It will be validated during preparation
    // phase.
    const configJson = /** @type {!./web-animation-types.WebAnimationDef} */ (
      this.configJson_);
    const args = /** @type {?./web-animation-types.WebAnimationDef} */ (
      opt_args || null);

    // Ensure polyfill is installed.
    installWebAnimationsIfNecessary(this.win);

    const ampdoc = this.getAmpDoc();
    const readyPromise = this.embed_ ? this.embed_.whenReady() :
      ampdoc.whenReady();
    const hostWin = this.embed_ ? this.embed_.win : this.win;
    const baseUrl = this.embed_ ? this.embed_.getUrl() : ampdoc.getUrl();
    return readyPromise.then(() => {
      const builder = new Builder(
          hostWin,
          this.getRootNode_(),
          baseUrl,
          this.getVsync(),
          this.element.getResources());
      return builder.createRunner(configJson, args, opt_positionObserverData);
    });
  }

  /**
   * @return {!Document|!ShadowRoot}
   * @private
   */
  getRootNode_() {
    return this.embed_ ?
      this.embed_.win.document :
      this.getAmpDoc().getRootNode();
  }

  /** @private */
  pause_() {
    if (this.runner_) {
      this.runner_.pause();
    }
  }

  /**
   * @param {!WebAnimationPlayState} playState
   * @private
   */
  playStateChanged_(playState) {
    if (playState == WebAnimationPlayState.FINISHED) {
      this.finish_();
    }
  }
}



AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerElement(TAG, AmpAnimation);
  AMP.registerServiceForDoc('web-animation', WebAnimationService);
});
