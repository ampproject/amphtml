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

import {Builder} from './web-animations';
import {ScrollboundScene} from './scrollbound-scene';
import {Pass} from '../../../src/pass';
import {WebAnimationPlayState} from './web-animation-types';
import {childElementByTag} from '../../../src/dom';
import {getFriendlyIframeEmbedOptional}
    from '../../../src/friendly-iframe-embed';
import {getMode} from '../../../src/mode';
import {getParentWindowFrameElement} from '../../../src/service';
import {isExperimentOn} from '../../../src/experiments';
import {installWebAnimations} from 'web-animations-js/web-animations.install';
import {listen} from '../../../src/event-helper';
import {setStyles} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {user, dev} from '../../../src/log';
import {viewerForDoc} from '../../../src/services';

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
    this.triggered_ = false;

    /** @private {?../../../src/friendly-iframe-embed.FriendlyIframeEmbed} */
    this.embed_ = null;

    /** @private {?JsonObject} */
    this.configJson_ = null;

    /** @private {?./web-animations.WebAnimationRunner} */
    this.runner_ = null;

    /** @private {?Pass} */
    this.restartPass_ = null;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG),
        `Experiment "${TAG}" is disabled.`);

    // TODO(dvoytenko): Remove once we support direct parent visibility.
    user().assert(this.element.parentNode == this.element.ownerDocument.body,
        `${TAG} is only allowed as a direct child of <body> element.` +
        ' This restriction will be removed soon.');

    // Trigger.
    const trigger = this.element.getAttribute('trigger');
    if (trigger) {
      this.triggerOnVisibility_ = user().assert(
          trigger == 'visibility',
          'Only allowed value for "trigger" is "visibility": %s',
          this.element);
    }

    // Parse config.
    const scriptElement = user().assert(
        childElementByTag(this.element, 'script'),
        '"<script type=application/json>" must be present');
    this.configJson_ = tryParseJson(scriptElement.textContent, error => {
      throw user().createError('failed to parse animation script', error);
    });

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
          display: 'block',
          position: 'fixed',
        });
      });
    }

    // Restart with debounce.
    this.restartPass_ = new Pass(
        this.win,
        this.startOrResume_.bind(this),
        /* delay */ 50);

    // Visibility.
    const ampdoc = this.getAmpDoc();
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
      const viewer = viewerForDoc(ampdoc);
      this.setVisible_(viewer.isVisible());
      viewer.onVisibilityChanged(() => {
        this.setVisible_(viewer.isVisible());
      });
      this.getViewport().onChanged(e => {
        if (e.relayoutAll) {
          this.onResize_();
        }
      });
    }

    // Actions.
    this.registerAction('start', this.startAction_.bind(this));
    this.registerAction('restart', this.restartAction_.bind(this));
    this.registerAction('pause', this.pauseAction_.bind(this));
    this.registerAction('resume', this.resumeAction_.bind(this));
    this.registerAction('togglePause', this.togglePauseAction_.bind(this));
    this.registerAction('seekTo', this.seekToAction_.bind(this));
    this.registerAction('reverse', this.reverseAction_.bind(this));
    this.registerAction('finish', this.finishAction_.bind(this));
    this.registerAction('cancel', this.cancelAction_.bind(this));
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

  /** @override */
  activate(invocation) {
    this.startAction_(invocation);
  }

  /**
   * @param {?../../../src/service/action-impl.ActionInvocation=} opt_invocation
   * @private
   */
  startAction_(opt_invocation) {
    // The animation has been triggered, but there's no guarantee that it
    // will actually be running.
    this.triggered_ = true;
    if (this.visible_) {
      this.startOrResume_(opt_invocation ? opt_invocation.args : null);
    }
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  restartAction_(invocation) {
    this.cancel_();
    // The animation has been triggered, but there's no guarantee that it
    // will actually be running.
    this.triggered_ = true;
    if (this.visible_) {
      this.startOrResume_(invocation.args);
    }
  }

  /** @private */
  pauseAction_() {
    this.pause_();
  }

  /** @private */
  resumeAction_() {
    if (this.runner_ && this.visible_ && this.triggered_) {
      this.runner_.resume();
    }
  }

  /** @private */
  togglePauseAction_() {
    if (this.runner_ && this.visible_ && this.triggered_) {
      if (this.runner_.getPlayState() == WebAnimationPlayState.PAUSED) {
        this.startOrResume_();
      } else {
        this.pause_();
      }
    }
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  seekToAction_(invocation) {
    if (this.runner_ && this.visible_ && this.triggered_) {
      const time = parseFloat(invocation.args && invocation.args['time']);
      if (time && isFinite(time)) {
        this.runner_.seekTo(time);
      }
    }
  }

  /** @private */
  reverseAction_() {
    if (this.runner_ && this.visible_ && this.triggered_) {
      this.runner_.reverse();
    }
  }

  /** @private */
  finishAction_() {
    this.finish_();
  }

  /** @private */
  cancelAction_() {
    this.cancel_();
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
          this.startOrResume_();
        } else {
          this.pause_();
        }
      }
    }
  }

  /** @private */
  onResize_() {
    // Store the previous `triggered` value since `cancel` may reset it.
    const triggered = this.triggered_;

    // Stop animation right away.
    if (this.runner_) {
      this.runner_.cancel();
      this.runner_ = null;
    }

    // Restart the animation, but debounce to avoid re-starting it multiple
    // times per restart.
    this.triggered_ = triggered;
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

    if (this.runner_) {
      this.runner_.resume();
      return null;
    }

    return this.createRunner_(opt_args).then(runner => {
      this.runner_ = runner;
      this.runner_.onPlayStateChanged(this.playStateChanged_.bind(this));
      this.setupScrollboundAnimations_();
      this.runner_.start();
    });
  }

  /** @private */
  finish_() {
    this.triggered_ = false;
    if (this.runner_) {
      this.runner_.finish();
      this.runner_ = null;
    }
  }

  /** @private */
  cancel_() {
    this.triggered_ = false;
    if (this.runner_) {
      this.runner_.cancel();
      this.runner_ = null;
    }
  }

  /**
   * @param {?JsonObject=} opt_args
   * @return {!Promise<!./web-animations.WebAnimationRunner>}
   * @private
   */
  createRunner_(opt_args) {
    // Force cast to `WebAnimationDef`. It will be validated during preparation
    // phase.
    const configJson = /** @type {!./web-animation-types.WebAnimationDef} */ (
        this.configJson_);
    const args = /** @type {?./web-animation-types.WebAnimationDef} */ (
        opt_args || null);

    // Ensure polyfill is installed.
    if (!this.win.Element.prototype.animate) {
      installWebAnimations(this.win);
    }

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
      return builder.createRunner(configJson, args);
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

  /**
   * @private
   */
  setupScrollboundAnimations_() {
    dev().assert(this.runner_);
    if (!this.runner_.hasScrollboundAnimations()) {
      return;
    }

    // TODO(aghassemi): Remove restriction when we fully support scenes through
    // scene-id attribute and/or allowing parent of `amp-animation` to be the
    // scene container.
    user().assert(this.embed_ || getMode().runtime == 'inabox',
        'scroll-bound animations are only supported in embeds at the moment');

    let sceneElement;
    if (this.embed_) {
      sceneElement = this.embed_.iframe;
    } else {
      sceneElement = this.win.document.documentElement;
    }

    new ScrollboundScene(
      this.getAmpDoc(),
      sceneElement,
      this.runner_.scrollTick.bind(this.runner_), /* onScroll */
      this.runner_.updateScrollDuration.bind(this.runner_) /* onDurationChanged */
    );
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerElement(TAG, AmpAnimation);
});
