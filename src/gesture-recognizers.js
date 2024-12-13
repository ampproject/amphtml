import {GestureRecognizer} from './gesture';
import {calcVelocity} from './motion';

const DOUBLETAP_DELAY = 200;

/**
 * A "tap" gesture.
 * @typedef {{
 *   clientX: number,
 *   clientY: number
 * }}
 */
export let TapDef;

/**
 * Recognizes "tap" gestures.
 * @extends {GestureRecognizer<TapDef>}
 */
export class TapRecognizer extends GestureRecognizer {
  /**
   * @param {!./gesture.Gestures} manager
   */
  constructor(manager) {
    super('tap', manager);

    /** @private {number} */
    this.startX_ = 0;

    /** @private {number} */
    this.startY_ = 0;

    /** @private {number} */
    this.lastX_ = 0;

    /** @private {number} */
    this.lastY_ = 0;

    /** @private {?EventTarget} */
    this.target_ = null;
  }

  /** @override */
  onTouchStart(e) {
    const {touches} = e;
    this.target_ = e.target;
    if (touches && touches.length == 1) {
      this.startX_ = touches[0].clientX;
      this.startY_ = touches[0].clientY;
      return true;
    } else {
      return false;
    }
  }

  /** @override */
  onTouchMove(e) {
    const touches = e.changedTouches || e.touches;
    if (touches && touches.length == 1) {
      this.lastX_ = touches[0].clientX;
      this.lastY_ = touches[0].clientY;
      const dx = Math.abs(this.lastX_ - this.startX_) >= 8;
      const dy = Math.abs(this.lastY_ - this.startY_) >= 8;
      if (dx || dy) {
        return false;
      }
    }
    return true;
  }

  /** @override */
  onTouchEnd(unusedE) {
    this.signalReady(0);
  }

  /** @override */
  acceptStart() {
    this.signalEmit(
      {
        clientX: this.lastX_,
        clientY: this.lastY_,
        target: this.target_,
      },
      null
    );
    this.signalEnd();
  }
}

/**
 * A "doubletap" gesture.
 * @typedef {{
 *   clientX: number,
 *   clientY: number
 * }}
 */
export let DoubletapDef;

/**
 * Recognizes a "doubletap" gesture. This gesture will block a single "tap"
 * for about 200ms while it's expecting the second "tap".
 * @extends {GestureRecognizer<DoubletapDef>}
 */
export class DoubletapRecognizer extends GestureRecognizer {
  /**
   * @param {!./gesture.Gestures} manager
   */
  constructor(manager) {
    super('doubletap', manager);

    /** @private {number} */
    this.startX_ = 0;

    /** @private {number} */
    this.startY_ = 0;

    /** @private {number} */
    this.lastX_ = 0;

    /** @private {number} */
    this.lastY_ = 0;

    /** @private {number} */
    this.tapCount_ = 0;

    /** @private {?Event} */
    this.event_ = null;
  }

  /** @override */
  onTouchStart(e) {
    if (this.tapCount_ > 1) {
      return false;
    }
    const {touches} = e;
    if (touches && touches.length == 1) {
      this.startX_ = touches[0].clientX;
      this.startY_ = touches[0].clientY;
      this.lastX_ = touches[0].clientX;
      this.lastY_ = touches[0].clientY;
      return true;
    } else {
      return false;
    }
  }

  /** @override */
  onTouchMove(e) {
    const {touches} = e;
    if (touches && touches.length == 1) {
      this.lastX_ = touches[0].clientX;
      this.lastY_ = touches[0].clientY;
      const dx = Math.abs(this.lastX_ - this.startX_) >= 8;
      const dy = Math.abs(this.lastY_ - this.startY_) >= 8;
      if (dx || dy) {
        this.acceptCancel();
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  /** @override */
  onTouchEnd(e) {
    this.tapCount_++;
    if (this.tapCount_ < 2) {
      this.signalPending(DOUBLETAP_DELAY);
    } else {
      this.event_ = e;
      this.signalReady(0);
    }
  }

  /** @override */
  acceptStart() {
    this.tapCount_ = 0;
    this.signalEmit({clientX: this.lastX_, clientY: this.lastY_}, this.event_);
    this.signalEnd();
  }

  /** @override */
  acceptCancel() {
    this.tapCount_ = 0;
  }
}

/**
 * A "swipe-xy", "swipe-x" or "swipe-y" gesture. A number of these gestures
 * may be emitted for a single touch series.
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   deltaX: number,
 *   deltaY: number,
 *   velocityX: number,
 *   velocityY: number
 * }}
 */
export let SwipeDef;

/**
 * Recognizes swipe gestures. This gesture will yield about 10ms to other
 * gestures.
 * @extends {GestureRecognizer<SwipeDef>}
 */
class SwipeRecognizer extends GestureRecognizer {
  /**
   * @param {string} type
   * @param {!./gesture.Gestures} manager
   * @param {boolean} horiz
   * @param {boolean} vert
   */
  constructor(type, manager, horiz, vert) {
    super(type, manager);

    /** @private {boolean} */
    this.horiz_ = horiz;

    /** @private {boolean} */
    this.vert_ = vert;

    /** @private {boolean} */
    this.eventing_ = false;

    /** @private {number} */
    this.startX_ = 0;

    /** @private {number} */
    this.startY_ = 0;

    /** @private {number} */
    this.lastX_ = 0;

    /** @private {number} */
    this.lastY_ = 0;

    /** @private {number} */
    this.prevX_ = 0;

    /** @private {number} */
    this.prevY_ = 0;

    /** @private {time} */
    this.startTime_ = 0;

    /** @private {time} */
    this.lastTime_ = 0;

    /** @private {time} */
    this.prevTime_ = 0;

    /** @private {number} */
    this.velocityX_ = 0;

    /** @private {number} */
    this.velocityY_ = 0;
  }

  /** @override */
  onTouchStart(e) {
    const {touches} = e;
    // If already eventing, ignore additional touches
    if (this.eventing_ && touches && touches.length > 1) {
      return true;
    }
    if (touches && touches.length == 1) {
      this.startTime_ = Date.now();
      this.startX_ = touches[0].clientX;
      this.startY_ = touches[0].clientY;
      return true;
    } else {
      return false;
    }
  }

  /** @override */
  onTouchMove(e) {
    const {touches} = e;
    if (touches && touches.length >= 1) {
      const {clientX: x, clientY: y} = touches[0];
      this.lastX_ = x;
      this.lastY_ = y;
      if (this.eventing_) {
        // If already eventing, always emit new coordinates
        this.emit_(false, false, e);
      } else {
        // Figure out whether or not we should start eventing
        const dx = Math.abs(x - this.startX_);
        const dy = Math.abs(y - this.startY_);
        // Swipe is penalized slightly since it's one of the least demanding
        // gesture, thus -10 in signalReady.
        if (this.horiz_ && this.vert_) {
          if (dx >= 8 || dy >= 8) {
            this.signalReady(-10);
          }
        } else if (this.horiz_) {
          if (dx >= 8 && dx > dy) {
            this.signalReady(-10);
          } else if (dy >= 8) {
            return false;
          }
        } else if (this.vert_) {
          if (dy >= 8 && dy > dx) {
            this.signalReady(-10);
          } else if (dx >= 8) {
            return false;
          }
        } else {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  /** @override */
  onTouchEnd(e) {
    const {touches} = e;
    // Number of current touches on the page
    if (touches && touches.length == 0) {
      this.end_(e);
    }
  }

  /** @override */
  acceptStart() {
    this.eventing_ = true;
    // Reset start coordinates to where the gesture began to avoid visible
    // jump, but preserve them as "prev" coordinates to calculate the right
    // velocity.
    this.prevX_ = this.startX_;
    this.prevY_ = this.startY_;
    this.prevTime_ = this.startTime_;
    this.startX_ = this.lastX_;
    this.startY_ = this.lastY_;
    this.emit_(true, false, null);
  }

  /** @override */
  acceptCancel() {
    this.eventing_ = false;
  }

  /**
   * @param {boolean} first
   * @param {boolean} last
   * @param {?Event} event
   * @private
   */
  emit_(first, last, event) {
    this.lastTime_ = Date.now();
    const deltaTime = this.lastTime_ - this.prevTime_;
    // It's often that `touchend` arrives on the next frame. These should
    // be ignored to avoid a significant velocity downgrade.
    if ((!last && deltaTime > 4) || (last && deltaTime > 16)) {
      const velocityX = calcVelocity(
        this.lastX_ - this.prevX_,
        deltaTime,
        this.velocityX_
      );
      const velocityY = calcVelocity(
        this.lastY_ - this.prevY_,
        deltaTime,
        this.velocityY_
      );

      // On iOS, the touchend will always have the same x/y position as the
      // last touchmove, so we want to make sure we do not remove the velocity.
      // The touchend event with zero velocity can occur within a couple of
      // frames of the last touchmove.
      if (!last || deltaTime > 32 || velocityX != 0 || velocityY != 0) {
        this.velocityX_ = Math.abs(velocityX) > 1e-4 ? velocityX : 0;
        this.velocityY_ = Math.abs(velocityY) > 1e-4 ? velocityY : 0;
      }

      this.prevX_ = this.lastX_;
      this.prevY_ = this.lastY_;
      this.prevTime_ = this.lastTime_;
    }

    this.signalEmit(
      {
        first,
        last,
        time: this.lastTime_,
        deltaX: this.lastX_ - this.startX_,
        deltaY: this.lastY_ - this.startY_,
        startX: this.startX_,
        startY: this.startY_,
        lastX: this.lastX_,
        lastY: this.lastY_,
        velocityX: this.velocityX_,
        velocityY: this.velocityY_,
      },
      event
    );
  }

  /**
   * @param {?Event} event
   * @private
   */
  end_(event) {
    if (this.eventing_) {
      this.eventing_ = false;
      this.emit_(false, true, event);
      this.signalEnd();
    }
  }
}

/**
 * Recognizes "swipe-xy" gesture. Yields about 10ms to other gestures.
 */
export class SwipeXYRecognizer extends SwipeRecognizer {
  /**
   * @param {!./gesture.Gestures} manager
   */
  constructor(manager) {
    super('swipe-xy', manager, true, true);
  }
}

/**
 * Recognizes "swipe-x" gesture. Yields about 10ms to other gestures.
 */
export class SwipeXRecognizer extends SwipeRecognizer {
  /**
   * @param {!./gesture.Gestures} manager
   */
  constructor(manager) {
    super('swipe-x', manager, true, false);
  }
}

/**
 * Recognizes "swipe-y" gesture. Yields about 10ms to other gestures.
 */
export class SwipeYRecognizer extends SwipeRecognizer {
  /**
   * @param {!./gesture.Gestures} manager
   */
  constructor(manager) {
    super('swipe-y', manager, false, true);
  }
}

/**
 * A "tapzoom" gesture. It has a center, delta off the center center and
 * the velocity of moving away from the center.
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   centerClientX: number,
 *   centerClientY: number,
 *   deltaX: number,
 *   deltaY: number,
 *   velocityX: number,
 *   velocityY: number
 * }}
 */
export let TapzoomDef;

/**
 * Recognizes a "tapzoom" gesture. This gesture will block other gestures
 * for about 400ms after first "tap" while it's expecting swipe.
 * @extends {GestureRecognizer<TapzoomDef>}
 */
export class TapzoomRecognizer extends GestureRecognizer {
  /**
   * @param {!./gesture.Gestures} manager
   */
  constructor(manager) {
    super('tapzoom', manager);

    /** @private {boolean} */
    this.eventing_ = false;

    /** @private {number} */
    this.startX_ = 0;

    /** @private {number} */
    this.startY_ = 0;

    /** @private {number} */
    this.lastX_ = 0;

    /** @private {number} */
    this.lastY_ = 0;

    /** @private {number} */
    this.tapCount_ = 0;

    /** @private {number} */
    this.prevX_ = 0;

    /** @private {number} */
    this.prevY_ = 0;

    /** @private {time} */
    this.lastTime_ = 0;

    /** @private {time} */
    this.prevTime_ = 0;

    /** @private {number} */
    this.velocityX_ = 0;

    /** @private {number} */
    this.velocityY_ = 0;
  }

  /** @override */
  onTouchStart(e) {
    if (this.eventing_) {
      return false;
    }
    const {touches} = e;
    if (touches && touches.length == 1) {
      this.startX_ = touches[0].clientX;
      this.startY_ = touches[0].clientY;
      return true;
    } else {
      return false;
    }
  }

  /** @override */
  onTouchMove(e) {
    const {touches} = e;
    if (touches && touches.length == 1) {
      this.lastX_ = touches[0].clientX;
      this.lastY_ = touches[0].clientY;
      if (this.eventing_) {
        this.emit_(false, false, e);
      } else {
        const dx = Math.abs(this.lastX_ - this.startX_) >= 8;
        const dy = Math.abs(this.lastY_ - this.startY_) >= 8;
        if (dx || dy) {
          if (this.tapCount_ == 0) {
            this.acceptCancel();
            return false;
          } else {
            this.signalReady(0);
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }

  /** @override */
  onTouchEnd(e) {
    if (this.eventing_) {
      this.end_(e);
      return;
    }

    this.tapCount_++;
    if (this.tapCount_ == 1) {
      this.signalPending(400);
      return;
    }

    this.acceptCancel();
  }

  /** @override */
  acceptStart() {
    this.tapCount_ = 0;
    this.eventing_ = true;
    this.emit_(true, false, null);
  }

  /** @override */
  acceptCancel() {
    this.tapCount_ = 0;
    this.eventing_ = false;
  }

  /**
   * @param {boolean} first
   * @param {boolean} last
   * @param {?Event} event
   * @private
   */
  emit_(first, last, event) {
    this.lastTime_ = Date.now();
    if (first) {
      this.velocityX_ = this.velocityY_ = 0;
    } else if (this.lastTime_ - this.prevTime_ > 2) {
      this.velocityX_ = calcVelocity(
        this.lastX_ - this.prevX_,
        this.lastTime_ - this.prevTime_,
        this.velocityX_
      );
      this.velocityY_ = calcVelocity(
        this.lastY_ - this.prevY_,
        this.lastTime_ - this.prevTime_,
        this.velocityY_
      );
    }
    this.prevX_ = this.lastX_;
    this.prevY_ = this.lastY_;
    this.prevTime_ = this.lastTime_;

    this.signalEmit(
      {
        first,
        last,
        centerClientX: this.startX_,
        centerClientY: this.startY_,
        deltaX: this.lastX_ - this.startX_,
        deltaY: this.lastY_ - this.startY_,
        velocityX: this.velocityX_,
        velocityY: this.velocityY_,
      },
      event
    );
  }

  /**
   * @param {?Event} event
   * @private
   */
  end_(event) {
    if (this.eventing_) {
      this.eventing_ = false;
      this.emit_(false, true, event);
      this.signalEnd();
    }
  }
}

/**
 * A "pinch" gesture. It has a center, delta off the center center and
 * the velocity of moving away from the center. "dir" component of `1`
 * indicates that it's a expand motion and `-1` indicates pinch motion.
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   centerClientX: number,
 *   centerClientY: number,
 *   dir: number,
 *   distance: number,
 *   deltaX: number,
 *   deltaY: number,
 *   velocityX: number,
 *   velocityY: number
 * }}
 */
export let PinchDef;

/**
 * Threshold in pixels for how much two touches move away from
 * each other before we recognize the gesture as a pinch.
 */
const PINCH_ACCEPT_THRESHOLD = 4;

/**
 * Threshold in pixels for how much two touches move in the same
 * direction before we reject the gesture as a pinch.
 */
const PINCH_REJECT_THRESHOLD = 10;

/**
 * Recognizes a "pinch" gesture.
 * @extends {GestureRecognizer<PinchDef>}
 */
export class PinchRecognizer extends GestureRecognizer {
  /**
   * @param {!./gesture.Gestures} manager
   */
  constructor(manager) {
    super('pinch', manager);

    /** @private {boolean} */
    this.eventing_ = false;

    /** @private {number} */
    this.startX1_ = 0;
    /** @private {number} */
    this.startY1_ = 0;

    /** @private {number} */
    this.startX2_ = 0;
    /** @private {number} */
    this.startY2_ = 0;

    /** @private {number} */
    this.lastX1_ = 0;
    /** @private {number} */
    this.lastY1_ = 0;

    /** @private {number} */
    this.lastX2_ = 0;
    /** @private {number} */
    this.lastY2_ = 0;

    /** @private {number} */
    this.prevDeltaX_ = 0;
    /** @private {number} */
    this.prevDeltaY_ = 0;

    /** @private {number} */
    this.centerClientX_ = 0;
    /** @private {number} */
    this.centerClientY_ = 0;

    /** @private {time} */
    this.startTime_ = 0;
    /** @private {time} */
    this.lastTime_ = 0;
    /** @private {time} */
    this.prevTime_ = 0;

    /** @private {number} */
    this.velocityX_ = 0;
    /** @private {number} */
    this.velocityY_ = 0;
  }

  /** @override */
  onTouchStart(e) {
    const {touches} = e;
    if (!touches) {
      return false;
    }
    // Pinch touches are not always simultaneous, continue to listen
    // for second touch.
    if (touches.length == 1) {
      return true;
    }
    // If already in the middle of a pinch event, ignore additional touches.
    if (this.eventing_ && touches.length > 2) {
      return true;
    }
    if (touches.length == 2) {
      this.startTime_ = Date.now();
      this.startX1_ = touches[0].clientX;
      this.startY1_ = touches[0].clientY;
      this.startX2_ = touches[1].clientX;
      this.startY2_ = touches[1].clientY;
      return true;
    } else {
      return false;
    }
  }

  /** @override */
  onTouchMove(e) {
    const {touches} = e;
    if (!touches || touches.length == 0) {
      return false;
    }
    // Pinch touches are not always simultaneous, continue to listen
    // for second touch.
    if (touches.length == 1) {
      return true;
    }

    // Have 2+ touches
    this.lastX1_ = touches[0].clientX;
    this.lastY1_ = touches[0].clientY;
    this.lastX2_ = touches[1].clientX;
    this.lastY2_ = touches[1].clientY;

    // If eventing, always emit gesture with new coordinates
    if (this.eventing_) {
      this.emit_(false, false, e);
      return true;
    }

    // Gesture is 2+ touch but direction indicates not a pinch
    if (this.isPinchRejected_()) {
      return false;
    }

    if (this.isPinchReady_()) {
      this.signalReady(0);
    }
    // Pinch gesture detected but threshold not reached, continue listening
    return true;
  }

  /**
   * @return {boolean}
   * @private
   */
  isPinchReady_() {
    const dx1 = this.lastX1_ - this.startX1_;
    const dy1 = this.lastY1_ - this.startY1_;
    const dx2 = this.lastX2_ - this.startX2_;
    const dy2 = this.lastY2_ - this.startY2_;

    const pinchDirectionCorrect = dx1 * dx2 <= 0 && dy1 * dy2 <= 0;
    const xPinchRecognized = Math.abs(dx1 - dx2) >= PINCH_ACCEPT_THRESHOLD;
    const yPinchRecognized = Math.abs(dy1 - dy2) >= PINCH_ACCEPT_THRESHOLD;
    return pinchDirectionCorrect && (xPinchRecognized || yPinchRecognized);
  }

  /**
   * @return {boolean}
   * @private
   */
  isPinchRejected_() {
    const dx1 = this.lastX1_ - this.startX1_;
    const dy1 = this.lastY1_ - this.startY1_;
    const dx2 = this.lastX2_ - this.startX2_;
    const dy2 = this.lastY2_ - this.startY2_;

    const pinchDirectionIncorrect = dx1 * dx2 > 0 || dy1 * dy2 > 0;
    const xPinchRejected = Math.abs(dx1 + dx2) >= PINCH_REJECT_THRESHOLD;
    const yPinchRejected = Math.abs(dy1 + dy2) >= PINCH_REJECT_THRESHOLD;
    return pinchDirectionIncorrect && (xPinchRejected || yPinchRejected);
  }

  /** @override */
  onTouchEnd(e) {
    // Pinch requires at least two touches on the page
    const {touches} = e;
    if (touches && touches.length < 2) {
      this.end_(e);
    }
  }

  /** @override */
  acceptStart() {
    this.eventing_ = true;
    this.prevTime_ = this.startTime_;
    this.prevDeltaX_ = 0;
    this.prevDeltaY_ = 0;
    this.centerClientX_ = (this.startX1_ + this.startX2_) * 0.5;
    this.centerClientY_ = (this.startY1_ + this.startY2_) * 0.5;
    this.emit_(true, false, null);
  }

  /** @override */
  acceptCancel() {
    this.eventing_ = false;
  }

  /**
   * @param {boolean} first
   * @param {boolean} last
   * @param {?Event} event
   * @private
   */
  emit_(first, last, event) {
    this.lastTime_ = Date.now();
    const deltaTime = this.lastTime_ - this.prevTime_;
    const deltaX = this.deltaX_();
    const deltaY = this.deltaY_();
    // It's often that `touchend` arrives on the next frame. These should
    // be ignored to avoid a significant velocity downgrade.
    if ((!last && deltaTime > 4) || (last && deltaTime > 16)) {
      this.velocityX_ = calcVelocity(
        deltaX - this.prevDeltaX_,
        deltaTime,
        this.velocityX_
      );
      this.velocityY_ = calcVelocity(
        deltaY - this.prevDeltaY_,
        deltaTime,
        this.velocityY_
      );
      this.velocityX_ = Math.abs(this.velocityX_) > 1e-4 ? this.velocityX_ : 0;
      this.velocityY_ = Math.abs(this.velocityY_) > 1e-4 ? this.velocityY_ : 0;
      this.prevDeltaX_ = deltaX;
      this.prevDeltaY_ = deltaY;
      this.prevTime_ = this.lastTime_;
    }

    const startDist = this.dist_(
      this.startX1_,
      this.startX2_,
      this.startY1_,
      this.startY2_
    );
    const lastDist = this.dist_(
      this.lastX1_,
      this.lastX2_,
      this.lastY1_,
      this.lastY2_
    );
    const distance = lastDist - startDist;
    this.signalEmit(
      {
        first,
        last,
        time: this.lastTime_,
        centerClientX: this.centerClientX_,
        centerClientY: this.centerClientY_,
        dir: Math.sign(distance),
        distance,
        deltaX: deltaX * 0.5,
        deltaY: deltaY * 0.5,
        velocityX: this.velocityX_ * 0.5,
        velocityY: this.velocityY_ * 0.5,
      },
      event
    );
  }

  /**
   * @param {?Event} event
   * @private
   */
  end_(event) {
    if (this.eventing_) {
      this.eventing_ = false;
      this.emit_(false, true, event);
      this.signalEnd();
    }
  }

  /**
   * @param {number} x1
   * @param {number} x2
   * @param {number} y1
   * @param {number} y2
   * @return {number}
   * @private
   */
  dist_(x1, x2, y1, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * @return {number}
   * @private
   */
  deltaX_() {
    return Math.abs(
      this.lastX1_ - this.startX1_ - (this.lastX2_ - this.startX2_)
    );
  }

  /**
   * @return {number}
   * @private
   */
  deltaY_() {
    return Math.abs(
      this.lastY1_ - this.startY1_ - (this.lastY2_ - this.startY2_)
    );
  }
}
