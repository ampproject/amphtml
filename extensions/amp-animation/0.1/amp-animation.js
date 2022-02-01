import {ActionTrust_Enum} from '#core/constants/action-constants';
import {getChildJsonConfig} from '#core/dom';
import {setInitialDisplay, setStyles, toggle} from '#core/dom/style';
import {clamp} from '#core/math';
import {isFiniteNumber} from '#core/types';

import {Services} from '#service';

import {getDetail, listen} from '#utils/event-helper';
import {dev, userAssert} from '#utils/log';

import {installWebAnimationsIfNecessary} from './install-polyfill';
import {WebAnimationService} from './web-animation-service';
import {WebAnimationPlayState} from './web-animation-types';
import {Builder} from './web-animations';

import {Pass} from '../../../src/pass';

const TAG = 'amp-animation';

export class AmpAnimation extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.triggerOnVisibility_ = false;

    /** @private {boolean} */
    this.isIntersecting_ = false;

    /** @private {boolean} */
    this.visible_ = false;

    /** @private {boolean} */
    this.pausedByAction_ = false;

    /** @private {boolean} */
    this.triggered_ = false;

    /** @private {!Array<!UnlistenDef>} */
    this.cleanups_ = [];

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
        this.element
      );
    }

    this.configJson_ = getChildJsonConfig(this.element);

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
      /* delay */ 50
    );

    // Visibility.
    this.cleanups_.push(
      ampdoc.onVisibilityChanged(() => {
        this.setVisible_(this.isIntersecting_ && ampdoc.isVisible());
      })
    );
    const io = new ampdoc.win.IntersectionObserver(
      (records) => {
        const {isIntersecting} = records[records.length - 1];
        this.isIntersecting_ = isIntersecting;
        this.setVisible_(this.isIntersecting_ && ampdoc.isVisible());
      },
      {threshold: 0.001}
    );
    io.observe(dev().assertElement(this.element.parentElement));
    this.cleanups_.push(() => io.disconnect());

    // Resize.
    this.cleanups_.push(listen(this.win, 'resize', () => this.onResize_()));

    // Actions.
    this.registerDefaultAction(
      this.startAction_.bind(this),
      'start',
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'restart',
      this.restartAction_.bind(this),
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'pause',
      this.pauseAction_.bind(this),
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'resume',
      this.resumeAction_.bind(this),
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'togglePause',
      this.togglePauseAction_.bind(this),
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'seekTo',
      this.seekToAction_.bind(this),
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'reverse',
      this.reverseAction_.bind(this),
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'finish',
      this.finishAction_.bind(this),
      ActionTrust_Enum.LOW
    );
    this.registerAction(
      'cancel',
      this.cancelAction_.bind(this),
      ActionTrust_Enum.LOW
    );
  }

  /** @override */
  detachedCallback() {
    const cleanups = this.cleanups_.slice(0);
    this.cleanups_.length = 0;
    cleanups.forEach((cleanup) => cleanup());
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
    let positionObserverData = null;
    if (invocation.event) {
      const detail = getDetail(/** @type {!Event} */ (invocation.event));
      if (detail) {
        positionObserverData = detail['positionObserverData'] || null;
      }
    }

    return this.createRunnerIfNeeded_(null, positionObserverData).then(() => {
      // The animation will be triggered (in paused state) and seek will happen
      // regardless of visibility
      this.triggered_ = true;
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
    const {pausedByAction_: pausedByAction, triggered_: triggered} = this;

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
        opt_args,
        opt_positionObserverData
      ).then((runner) => {
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
      this.configJson_
    );
    const args = /** @type {?./web-animation-types.WebAnimationDef} */ (
      opt_args || null
    );

    // Ensure polyfill is installed.
    const ampdoc = this.getAmpDoc();
    const polyfillPromise = installWebAnimationsIfNecessary(ampdoc);
    const readyPromise = ampdoc.whenReady();
    const hostWin = this.win;
    const baseUrl = ampdoc.getUrl();
    return Promise.all([polyfillPromise, readyPromise]).then(() => {
      const builder = new Builder(
        hostWin,
        this.getRootNode_(),
        baseUrl,
        this.getVsync(),
        Services.ownersForDoc(this.element.getAmpDoc())
      );
      return builder.createRunner(configJson, args, opt_positionObserverData);
    });
  }

  /**
   * @return {!Document|!ShadowRoot}
   * @private
   */
  getRootNode_() {
    return this.getAmpDoc().getRootNode();
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

AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerElement(TAG, AmpAnimation);
  AMP.registerServiceForDoc('web-animation', WebAnimationService);
});
