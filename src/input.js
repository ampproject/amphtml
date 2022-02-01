import {Observable} from '#core/data-structures/observable';

import {Services} from '#service';

import {listenOnce, listenOncePromise} from '#utils/event-helper';
import {dev} from '#utils/log';

import {registerServiceBuilder} from './service-helpers';

const TAG_ = 'Input';

const MAX_MOUSE_CONFIRM_ATTEMPS_ = 3;
const CLICK_TIMEOUT_ = 300;

/**
 * Detects and maintains different types of input such as touch, mouse or
 * keyboard.
 */
export class Input {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private {!Function} */
    this.boundOnKeyDown_ = this.onKeyDown_.bind(this);

    /** @private {!Function} */
    this.boundOnMouseDown_ = this.onMouseDown_.bind(this);

    /** @private {?function(!Event)} */
    this.boundOnMouseMove_ = null;

    /** @private {?Function} */
    this.boundMouseCanceled_ = null;

    /** @private {?Function} */
    this.boundMouseConfirmed_ = null;

    /** @private {boolean} */
    this.hasTouch_ =
      'ontouchstart' in win ||
      (win.navigator['maxTouchPoints'] !== undefined &&
        win.navigator['maxTouchPoints'] > 0) ||
      win['DocumentTouch'] !== undefined;
    dev().fine(TAG_, 'touch detected:', this.hasTouch_);

    /** @private {boolean} */
    this.keyboardActive_ = false;
    this.win.document.addEventListener('keydown', this.boundOnKeyDown_);
    this.win.document.addEventListener('mousedown', this.boundOnMouseDown_);

    /** @private {boolean} */
    this.hasMouse_ = true;

    /** @private {number} */
    this.mouseConfirmAttemptCount_ = 0;

    /** @private {!Observable<boolean>} */
    this.touchDetectedObservable_ = new Observable();

    /** @private {!Observable<boolean>} */
    this.mouseDetectedObservable_ = new Observable();

    /** @private {!Observable<boolean>} */
    this.keyboardStateObservable_ = new Observable();

    // If touch available, temporarily set hasMouse to false and wait for
    // mouse events.
    if (this.hasTouch_) {
      this.hasMouse_ = !this.hasTouch_;
      this.boundOnMouseMove_ = /** @type {function(!Event)} */ (
        this.onMouseMove_.bind(this)
      );
      listenOnce(win.document, 'mousemove', this.boundOnMouseMove_);
    }
  }

  /**
   * See https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-css-classes.md#input-mode-classes
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   */
  setupInputModeClasses(ampdoc) {
    this.onTouchDetected((detected) => {
      this.toggleInputClass_(ampdoc, 'amp-mode-touch', detected);
    }, true);
    this.onMouseDetected((detected) => {
      this.toggleInputClass_(ampdoc, 'amp-mode-mouse', detected);
    }, true);
    this.onKeyboardStateChanged((active) => {
      this.toggleInputClass_(ampdoc, 'amp-mode-keyboard-active', active);
    }, true);
  }

  /**
   * Whether the touch input has been detected.
   * @return {boolean}
   */
  isTouchDetected() {
    return this.hasTouch_;
  }

  /**
   * Registers an event handle in case if the touch is detected.
   * @param {function(boolean)} handler
   * @param {boolean=} opt_fireImmediately
   * @return {!UnlistenDef}
   */
  onTouchDetected(handler, opt_fireImmediately) {
    if (opt_fireImmediately) {
      handler(this.isTouchDetected());
    }
    return this.touchDetectedObservable_.add(handler);
  }

  /**
   * Whether the mouse input has been detected.
   * @return {boolean}
   */
  isMouseDetected() {
    return this.hasMouse_;
  }

  /**
   * Registers an event handle in case if the mouse is detected.
   * @param {function(boolean)} handler
   * @param {boolean=} opt_fireImmediately
   * @return {!UnlistenDef}
   */
  onMouseDetected(handler, opt_fireImmediately) {
    if (opt_fireImmediately) {
      handler(this.isMouseDetected());
    }
    return this.mouseDetectedObservable_.add(handler);
  }

  /**
   * Whether the keyboard input is currently active.
   * @return {boolean}
   */
  isKeyboardActive() {
    return this.keyboardActive_;
  }

  /**
   * Registers an event handle for changes in the keyboard input.
   * @param {function(boolean)} handler
   * @param {boolean=} opt_fireImmediately
   * @return {!UnlistenDef}
   */
  onKeyboardStateChanged(handler, opt_fireImmediately) {
    if (opt_fireImmediately) {
      handler(this.isKeyboardActive());
    }
    return this.keyboardStateObservable_.add(handler);
  }

  /**
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} clazz
   * @param {boolean} on
   * @private
   */
  toggleInputClass_(ampdoc, clazz, on) {
    ampdoc.waitForBodyOpen().then((body) => {
      const vsync = Services./*OK*/ vsyncFor(this.win);
      vsync.mutate(() => {
        body.classList.toggle(clazz, on);
      });
    });
  }

  /**
   * @param {!Event} e
   * @private
   */
  onKeyDown_(e) {
    if (this.keyboardActive_) {
      return;
    }

    if (e.defaultPrevented) {
      return;
    }

    // Ignore inputs.
    const {target} = e;
    if (
      target &&
      (target.tagName == 'INPUT' ||
        target.tagName == 'TEXTAREA' ||
        target.tagName == 'SELECT' ||
        target.tagName == 'OPTION' ||
        target.hasAttribute('contenteditable'))
    ) {
      return;
    }

    this.keyboardActive_ = true;
    this.keyboardStateObservable_.fire(true);
    dev().fine(TAG_, 'keyboard activated');
  }

  /** @private */
  onMouseDown_() {
    if (!this.keyboardActive_) {
      return;
    }
    this.keyboardActive_ = false;
    this.keyboardStateObservable_.fire(false);
    dev().fine(TAG_, 'keyboard deactivated');
  }

  /**
   * @param {!Event} e
   * @return {!Promise|undefined}
   * @private
   */
  onMouseMove_(e) {
    // The event explicitly states that it's a result of a touch event.
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) {
      this.mouseCanceled_();
      return undefined;
    }
    if (!this.boundMouseConfirmed_) {
      this.boundMouseConfirmed_ = this.mouseConfirmed_.bind(this);
      this.boundMouseCanceled_ = this.mouseCanceled_.bind(this);
    }
    // If "click" arrives within a timeout time, this is most likely a
    // touch/mouse emulation. Otherwise, if timeout exceeded, this looks
    // like a legitimate mouse event.
    let unlisten;
    const listenPromise = listenOncePromise(
      this.win.document,
      'click',
      /* capture */ undefined,
      (unlistener) => {
        unlisten = unlistener;
      }
    );
    return Services.timerFor(this.win)
      .timeoutPromise(CLICK_TIMEOUT_, listenPromise)
      .then(this.boundMouseCanceled_, () => {
        if (unlisten) {
          unlisten();
        }
        this.boundMouseConfirmed_();
      });
  }

  /** @private */
  mouseConfirmed_() {
    this.hasMouse_ = true;
    this.mouseDetectedObservable_.fire(true);
    dev().fine(TAG_, 'mouse detected');
  }

  /** @private */
  mouseCanceled_() {
    // Repeat, if attempts allow.
    this.mouseConfirmAttemptCount_++;
    if (this.mouseConfirmAttemptCount_ <= MAX_MOUSE_CONFIRM_ATTEMPS_) {
      listenOnce(
        this.win.document,
        'mousemove',
        /** @type {function(!Event)} */ (this.boundOnMouseMove_)
      );
    } else {
      dev().fine(TAG_, 'mouse detection failed');
    }
  }
}

/**
 * @param {!Window} win
 */
export function installInputService(win) {
  registerServiceBuilder(win, 'input', Input);
}
